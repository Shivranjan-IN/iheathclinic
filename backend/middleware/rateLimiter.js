const rateLimit = {};

/**
 * In-memory rate limiting middleware
 * @param {number} limit - Maximum number of requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Express middleware function
 */
const rateLimiter = (limit, windowMs) => {
    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const now = Date.now();

        if (!rateLimit[ip]) {
            rateLimit[ip] = [];
        }

        // Filter out expired timestamps
        rateLimit[ip] = rateLimit[ip].filter(timestamp => now - timestamp < windowMs);

        if (rateLimit[ip].length >= limit) {
            console.warn(`[Security Alert] Rate limit exceeded for IP: ${ip} on route: ${req.originalUrl}`);
            return res.status(429).json({
                success: false,
                message: 'Too many requests from this IP, please try again later.'
            });
        }

        rateLimit[ip].push(now);
        next();
    };
};

module.exports = rateLimiter;
