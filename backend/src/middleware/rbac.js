// Emplacement: backend/src/middleware/rbac.js
const logger = require('../utils/logger');

/**
 * Role-Based Access Control permissions mapping
 * Format: 'METHOD:/path' => ['ROLE1', 'ROLE2', ...]
 */
const permissions = {
    // Property routes
    'POST:/api/properties/register': ['NOTARY', 'AUTHORITY', 'ADMIN'],
    'POST:/api/properties/transfer': ['NOTARY', 'AUTHORITY', 'ADMIN'],
    'GET:/api/properties/:id': ['BUYER', 'SELLER', 'NOTARY', 'BANK', 'AUTHORITY', 'ADMIN'],
    'GET:/api/properties/owner/:ownerId': ['BUYER', 'SELLER', 'NOTARY', 'BANK', 'AUTHORITY', 'ADMIN'],

    // Document routes
    'POST:/api/documents/grant': ['NOTARY', 'BANK', 'AUTHORITY', 'ADMIN'],
    'POST:/api/documents/revoke': ['NOTARY', 'BANK', 'AUTHORITY', 'ADMIN'],
    'GET:/api/documents/audit': ['NOTARY', 'BANK', 'AUTHORITY', 'ADMIN'],
    'POST:/api/documents/upload': ['NOTARY', 'AUTHORITY', 'ADMIN'],

    // Payment routes
    'POST:/api/payments/pay': ['BUYER', 'SELLER', 'ADMIN'],

    // Lease routes
    'POST:/api/leases/create': ['NOTARY', 'AUTHORITY', 'ADMIN'],
    'POST:/api/leases/pay': ['TENANT', 'BUYER', 'SELLER', 'ADMIN'],
    'GET:/api/leases/:id': ['TENANT', 'BUYER', 'SELLER', 'NOTARY', 'BANK', 'AUTHORITY', 'ADMIN'],
    'POST:/api/leases/close': ['NOTARY', 'AUTHORITY', 'ADMIN'],

    // Token routes
    'POST:/api/tokens/mint': ['NOTARY', 'AUTHORITY', 'ADMIN'],
    'POST:/api/tokens/allocate': ['NOTARY', 'AUTHORITY', 'ADMIN'],
    'POST:/api/tokens/transfer': ['BUYER', 'SELLER', 'ADMIN'],

    // Notary routes
    'GET:/api/notary/pending': ['NOTARY', 'AUTHORITY', 'ADMIN'],
    'POST:/api/notary/approve': ['NOTARY', 'AUTHORITY', 'ADMIN'],

    // Export routes
    'POST:/api/export/receipt': ['TENANT', 'BUYER', 'SELLER', 'NOTARY', 'ADMIN'],
    'POST:/api/export/lease': ['TENANT', 'BUYER', 'SELLER', 'NOTARY', 'ADMIN'],

    // Admin routes
    'GET:/api/admin/*': ['ADMIN'],
    'POST:/api/admin/*': ['ADMIN'],
    'PUT:/api/admin/*': ['ADMIN'],
    'DELETE:/api/admin/*': ['ADMIN']
};

/**
 * RBAC middleware
 */
function rbac(req, res, next) {
    const role = req.user?.role;

    if (!role) {
        logger.warn('User has no role assigned');
        return res.status(403).json({ error: 'Forbidden: No role assigned' });
    }

    // Build permission key
    const method = req.method;
    let path = req.route?.path || req.path;

    // Normalize path (remove trailing slash)
    path = path.replace(/\/$/, '');

    const key = `${method}:${path}`;

    // Check exact match first
    let allowed = permissions[key];

    // If no exact match, check wildcard patterns
    if (!allowed) {
        for (const [pattern, roles] of Object.entries(permissions)) {
            if (pattern.includes('*')) {
                const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                if (regex.test(key)) {
                    allowed = roles;
                    break;
                }
            }
        }
    }

    // If no permission defined, allow by default (can be changed to deny)
    if (!allowed) {
        logger.debug(`No RBAC rule for ${key}, allowing by default`);
        return next();
    }

    // Check if user's role is in allowed roles
    if (!allowed.includes(role)) {
        logger.warn(`Access denied for role ${role} on ${key}`);
        return res.status(403).json({
            error: 'Forbidden: Insufficient permissions',
            required: allowed,
            current: role
        });
    }

    logger.debug(`Access granted for role ${role} on ${key}`);
    next();
}

module.exports = rbac;
