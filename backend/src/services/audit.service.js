// Emplacement: backend/src/services/audit.service.js
const logger = require('../utils/logger');

/**
 * Create audit log entry
 * @param {string} tenant - Tenant ID
 * @param {string} userId - User ID
 * @param {string} action - Action performed
 * @param {string} resourceId - Resource ID
 * @param {object} metadata - Additional metadata
 */
async function auditLog(tenant, userId, action, resourceId, metadata = {}) {
    const entry = {
        tenant,
        userId,
        action,
        resourceId,
        metadata,
        timestamp: new Date().toISOString()
    };

    // Log to console/file
    logger.info(entry, 'AUDIT');

    // In production, also store in database for compliance
    // await AuditModel.create(entry);

    return entry;
}

module.exports = {
    auditLog
};
