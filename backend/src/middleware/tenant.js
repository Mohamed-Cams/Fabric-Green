// Emplacement: backend/src/middleware/tenant.js
const logger = require('../utils/logger');

/**
 * Tenant middleware - extracts and validates tenant ID from request headers
 */
function tenantMiddleware(req, res, next) {
    const tenant = req.headers['x-tenant-id'];

    if (!tenant) {
        logger.warn('Missing tenant ID in request');
        return res.status(400).json({ error: 'Missing tenant ID. Please provide x-tenant-id header.' });
    }

    // Validate tenant format (alphanumeric, lowercase, max 50 chars)
    if (!/^[a-z0-9-]{1,50}$/.test(tenant)) {
        return res.status(400).json({ error: 'Invalid tenant ID format' });
    }

    req.tenant = tenant;
    logger.debug(`Request for tenant: ${tenant}`);
    next();
}

module.exports = tenantMiddleware;
