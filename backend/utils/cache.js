const cacheStore = new Map();

/**
 * Get item from cache if not expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached value or null if not found/expired
 */
const get = (key) => {
    const cached = cacheStore.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
        cacheStore.delete(key);
        return null;
    }
    return cached.value;
};

/**
 * Set item in cache with a TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttlSeconds - Time to live in seconds (default 300 = 5 mins)
 */
const set = (key, value, ttlSeconds = 300) => {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    cacheStore.set(key, { value, expiresAt });
};

/**
 * Delete specific key from cache
 * @param {string} key - Cache key
 */
const del = (key) => {
    cacheStore.delete(key);
};

/**
 * Delete cache keys starting with a prefix
 * @param {string} prefix - Key prefix
 */
const delByPrefix = (prefix) => {
    for (const key of cacheStore.keys()) {
        if (key.startsWith(prefix)) {
            cacheStore.delete(key);
        }
    }
};

/**
 * Clear the entire cache store
 */
const clear = () => {
    cacheStore.clear();
};

module.exports = {
    get,
    set,
    del,
    delByPrefix,
    clear
};
