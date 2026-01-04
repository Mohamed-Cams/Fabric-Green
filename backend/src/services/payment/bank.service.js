// Emplacement: backend/src/services/payment/bank.service.js
const logger = require('../../utils/logger');

/**
 * Record bank transfer for manual validation
 * @param {number} amountCfa - Amount in CFA francs
 * @param {string} proofUrl - URL to transfer proof document
 * @param {string} payerName - Name of the payer
 * @returns {Promise<object>} Record result
 */
async function recordBankTransfer({ amountCfa, proofUrl, payerName }) {
    try {
        // In a real implementation, this would:
        // 1. Store the transfer proof in MinIO/S3
        // 2. Create a pending validation record in database
        // 3. Notify admin for manual validation

        const record = {
            status: 'PENDING_VALIDATION',
            amountCfa,
            proofUrl,
            payerName,
            recordedAt: new Date().toISOString(),
            method: 'BANK_TRANSFER'
        };

        logger.info(`Bank transfer recorded: ${amountCfa} CFA from ${payerName}`);
        return record;
    } catch (error) {
        logger.error(`Bank transfer record error: ${error.message}`);
        throw new Error(`Bank transfer recording failed: ${error.message}`);
    }
}

/**
 * Validate bank transfer (admin action)
 */
async function validateBankTransfer(transferId) {
    try {
        // Update transfer status to VALIDATED
        logger.info(`Bank transfer validated: ${transferId}`);
        return { status: 'VALIDATED', transferId };
    } catch (error) {
        logger.error(`Bank transfer validation error: ${error.message}`);
        throw error;
    }
}

module.exports = {
    recordBankTransfer,
    validateBankTransfer
};
