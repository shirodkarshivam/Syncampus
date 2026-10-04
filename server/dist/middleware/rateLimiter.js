import rateLimit from 'express-rate-limit';
/**
 * Brute-force protection rate limiter for authentication endpoints.
 * Allows 50 login attempts per 15-minute window in development.
 */
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
        error: 'Too Many Requests',
        message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    },
});
