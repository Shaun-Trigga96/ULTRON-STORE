/**
 * ULTRON Store — Distributed Redis Redlock Manager
 * Enforces sub-millisecond atomic locking for 1-of-1 pre-owned mobile phones.
 */

class InventoryLockManager {
  constructor(options = {}) {
    this.defaultTtlMs = options.defaultTtlMs || 600000; // 10 minutes
    this.locks = new Map(); // Simulated Redis key-value store: lock:imei:<IMEI> -> session_id
    this.lockMeta = new Map();
    this.eventListeners = [];
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
   * Atomic Acquire Lock (Equivalent to Redis: SET lock:imei:<IMEI> <session_id> NX PX <ttlMs>)
   */
  async acquireLock(imei, sessionId, ttlMs = this.defaultTtlMs) {
    const key = `lock:imei:${imei}`;
    const now = Date.now();

    // Check if currently locked and not expired
    if (this.locks.has(key)) {
      const meta = this.lockMeta.get(key);
      if (meta && meta.expiresAt > now) {
        const remainingSeconds = Math.ceil((meta.expiresAt - now) / 1000);
        return {
          success: false,
          conflict: true,
          currentHolder: meta.sessionId,
          remainingSeconds,
          message: `Device (IMEI: ${imei}) is currently held by active session ${meta.sessionId}. Try again in ${remainingSeconds}s.`
        };
      }
    }

    // Acquire lock
    const expiresAt = now + ttlMs;
    this.locks.set(key, sessionId);
    this.lockMeta.set(key, {
      imei,
      sessionId,
      acquiredAt: now,
      expiresAt,
      ttlMs
    });

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
  }

  /**
   * Safe Atomic Release (Lua verification of session ownership)
   */
  async releaseLock(imei, sessionId, reason = 'USER_ABANDONED') {
    const key = `lock:imei:${imei}`;
    const currentHolder = this.locks.get(key);

    if (!currentHolder) {
      return { success: false, message: 'Lock not found or already released' };
    }

    if (currentHolder !== sessionId) {
      return { success: false, message: 'Cannot release lock owned by another session' };
    }

    this.locks.delete(key);
    this.lockMeta.delete(key);

    this.broadcast('inventory.released', {
      imei,
      sessionId,
      reason,
      status: 'AVAILABLE'
    });

    return { success: true, imei, status: 'AVAILABLE' };
  }

  /**
   * Commit Purchase (Transition to SOLD upon verified payment webhook)
   */
  async commitSale(imei, sessionId, orderDetails = {}) {
    const key = `lock:imei:${imei}`;
    const currentHolder = this.locks.get(key);

    if (currentHolder && currentHolder !== sessionId) {
      return { success: false, message: 'Session mismatch on commit' };
    }

    this.locks.delete(key);
    this.lockMeta.delete(key);

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
    if (this.locks.get(key) === sessionId) {
      const meta = this.lockMeta.get(key);
      if (meta) {
        meta.expiresAt += additionalTtlMs;
        return { success: true, newExpiresAt: new Date(meta.expiresAt).toISOString() };
      }
    }
    return { success: false, message: 'Lock not active or expired' };
  }
}

module.exports = { InventoryLockManager };
