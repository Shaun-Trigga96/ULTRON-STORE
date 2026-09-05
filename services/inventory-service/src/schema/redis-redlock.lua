-- ============================================================================
-- ULTRON STORE — REDIS REDLOCK ATOMIC LUA SCRIPTS
-- Prevents race conditions during high-demand smartphone flash sales
-- Sub-millisecond execution directly within Redis cluster engine
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SCRIPT 1: ATOMIC ACQUIRE LOCK (acquire_lock.lua)
-- Key: lock:imei:{IMEI}
-- ARGV[1]: lock_value (Unique Session / Buyer Correlation ID, e.g. "sess_cpt_9812")
-- ARGV[2]: ttl_milliseconds (e.g. 600000 for 10 minutes)
-- Returns:
--   1: Lock acquired successfully
--   0: Lock already held by another session (conflict / rejected)
-- ----------------------------------------------------------------------------
local lock_key = KEYS[1]
local session_id = ARGV[1]
local ttl_ms = tonumber(ARGV[2])

-- Try to set key only if it does NOT exist (NX) with expiration in milliseconds (PX)
local acquired = redis.call('SET', lock_key, session_id, 'NX', 'PX', ttl_ms)

if acquired then
    -- Record lock telemetry metadata in a companion hash
    local meta_key = "lock_meta:imei:" .. string.match(lock_key, "lock:imei:(%d+)")
    redis.call('HSET', meta_key, 
        'session_id', session_id,
        'acquired_at', redis.call('TIME')[1],
        'ttl_ms', ttl_ms
    )
    redis.call('PEXPIRE', meta_key, ttl_ms)
    
    -- Publish real-time event to Redis Pub/Sub stream for WebSocket gateway
    local imei = string.match(lock_key, "lock:imei:(%d+)")
    local event_payload = '{"event":"inventory.locked","imei":"' .. imei .. '","session_id":"' .. session_id .. '","ttl_ms":' .. ttl_ms .. '}'
    redis.call('PUBLISH', 'ultron:inventory:events', event_payload)
    
    return 1
else
    return 0
end

-- ----------------------------------------------------------------------------
-- SCRIPT 2: SAFE ATOMIC RELEASE LOCK (release_lock.lua)
-- Prevents accidental deletion of another buyer's renewed lock if original TTL expired
-- Key: lock:imei:{IMEI}
-- ARGV[1]: expected_session_id (Session trying to release the lock)
-- Returns:
--   1: Lock released successfully by valid owner
--   0: Lock not found or owned by a different session (no-op)
-- ----------------------------------------------------------------------------
-- local lock_key = KEYS[1]
-- local current_val = redis.call('GET', lock_key)
-- if current_val == ARGV[1] then
--     redis.call('DEL', lock_key)
--     local imei = string.match(lock_key, "lock:imei:(%d+)")
--     redis.call('PUBLISH', 'ultron:inventory:events', '{"event":"inventory.released","imei":"' .. imei .. '"}')
--     return 1
-- else
--     return 0
-- end

-- ----------------------------------------------------------------------------
-- SCRIPT 3: ATOMIC HEARTBEAT EXTENSION (extend_lock.lua)
-- Extends checkout reservation if buyer is actively typing shipping info
-- Key: lock:imei:{IMEI}
-- ARGV[1]: session_id
-- ARGV[2]: additional_ttl_ms (e.g. 300000 for 5 extra minutes)
-- ----------------------------------------------------------------------------
-- local lock_key = KEYS[1]
-- if redis.call('GET', lock_key) == ARGV[1] then
--     return redis.call('PEXPIRE', lock_key, tonumber(ARGV[2]))
-- else
--     return 0
-- end
