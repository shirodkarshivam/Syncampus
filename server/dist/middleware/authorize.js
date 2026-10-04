/**
 * Reusable RBAC authorization middleware.
 * Verifies that the authenticated user possesses one of the allowed roles.
 * Never trusts client request bodies or query parameters.
 */
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required before checking role permissions',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `Forbidden: Access requires role [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
            });
            return;
        }
        next();
    };
}
