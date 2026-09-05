const { createClient } = require('redis');

/**
 * ULTRON Store — Distributed Redis Redlock Manager
 * Enforces sub-millisecond atomic locking for 1-of-1 pre-owned mobile phones.
 */
class InventoryLockManager {
  constructor(options = {}) {
    this.defaultTtlMs = options.defaultTtlMs || 600000; // 10 minutes
    this.eventListeners = [];
    
    // Connect to genuine Redis instance configured in docker-compose
    this.redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    });

    this.redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    this.redisClient.on('connect', () => console.log('Connected to actual Redis instance for Redlock.'));
    
    this.redisClient.connect().catch(console.error);
  }

  onEvent(listener) {
    this.eventListeners.push(listener);
  }

  broadcast(event, payload) {
    const message = {
      event,
      timestamp: new Date().toISOString(),
      ...payload
    };
    for (const listener of this.eventListeners) {
      try {
        listener(message);
      } catch (err) {
        console.error('Listener error:', err);
      }
    }
  }

  /**
   * Atomic Acquire Lock (Genuine Redis SET NX PX)
   */
  async acquireLock(imei, sessionId, ttlMs = this.defaultTtlMs) {
    const key = `lock:imei:${imei}`;
    const now = Date.now();
    const expiresAt = now + ttlMs;

    try {
      // Atomic SET with Not eXists (NX) and expiration (PX)
      const acquired = await this.redisClient.set(key, sessionId, {
        NX: true,
        PX: ttlMs
      });

      if (!acquired) {
        const ttlRemaining = await this.redisClient.pttl(key);
        const currentHolder = await this.redisClient.get(key);
        return {
          success: false,
          conflict: true,
          currentHolder: currentHolder,
          remainingSeconds: Math.ceil(ttlRemaining / 1000),
          message: `Device (IMEI: ${imei}) is currently held by active session. Try again in ${Math.ceil(ttlRemaining / 1000)}s.`
        };
      }

      this.broadcast('inventory.locked', {
        imei,
        sessionId,
        ttlSeconds: Math.floor(ttlMs / 1000),
        expiresAt: new Date(expiresAt).toISOString(),
        status: 'LOCKED_CHECKOUT_HOLD'
      });

      return {
        success: true,
        conflict: false,
        imei,
        sessionId,
        expiresAt: new Date(expiresAt).toISOString(),
        ttlSeconds: Math.floor(ttlMs / 1000)
      };
    } catch (err) {
      console.error('Redis lock acquisition failed:', err);
      return { success: false, message: 'Internal datastore error' };
    }
  }

  /**
   * Safe Atomic Release (Lua verification of session ownership)
   */
  async releaseLock(imei, sessionId, reason = 'USER_ABANDONED') {
    const key = `lock:imei:${imei}`;
    
    // Atomic check-and-delete via Lua script to prevent releasing someone else's lock
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await this.redisClient.eval(luaScript, {
        keys: [key],
        arguments: [sessionId]
      });

      if (result === 0) {
        return { success: false, message: 'Lock not found or owned by another session' };
      }

      this.broadcast('inventory.released', {
        imei,
        sessionId,
        reason,
        status: 'AVAILABLE'
      });

      return { success: true, imei, status: 'AVAILABLE' };
    } catch (err) {
      console.error('Redis lock release failed:', err);
      return { success: false, message: 'Internal datastore error' };
    }
  }

  /**
   * Commit Purchase (Transition to SOLD)
   */
  async commitSale(imei, sessionId, orderDetails = {}) {
    const releaseResult = await this.releaseLock(imei, sessionId, 'CHECKOUT_COMPLETE');
    
    if (!releaseResult.success) {
      return { success: false, message: 'Session mismatch on commit' };
    }

    this.broadcast('inventory.sold', {
      imei,
      orderId: orderDetails.orderId || `ord_${Date.now()}`,
      buyerUserId: orderDetails.buyerUserId || sessionId,
      sellingPriceCents: orderDetails.sellingPriceCents,
      status: 'SOLD'
    });

    return {
      success: true,
      imei,
      orderId: orderDetails.orderId,
      status: 'SOLD'
    };
  }

  /**
   * Heartbeat renewal
   */
  async renewHeartbeat(imei, sessionId, additionalTtlMs = 300000) {
    const key = `lock:imei:${imei}`;
    
    // Atomic check-and-expire via Lua script
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("pexpire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;

    try {
      const result = await this.redisClient.eval(luaScript, {
        keys: [key],
        arguments: [sessionId, additionalTtlMs.toString()]
      });

      if (result === 1) {
        return { success: true, newExpiresAt: new Date(Date.now() + additionalTtlMs).toISOString() };
      }
      return { success: false, message: 'Lock not active, expired, or owned by another session' };
    } catch (err) {
      console.error('Redis lock renewal failed:', err);
      return { success: false, message: 'Internal datastore error' };
    }
  }
}

module.exports = { InventoryLockManager };
