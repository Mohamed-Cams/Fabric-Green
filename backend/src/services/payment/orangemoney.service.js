// Emplacement: backend/src/services/payment/orangemoney.service.js
const axios = require('axios');
const { OM_API_KEY, OM_API_URL, GREEN_T_OM_ACCOUNT } = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Collect payment via Orange Money Senegal
 * @param {number} amountCfa - Amount in CFA francs
 * @param {string} customerPhone - Customer phone number
 * @param {string} description - Payment description
 * @returns {Promise<object>} Payment result
 */
async function collectOM({ amountCfa, customerPhone, description }) {
    if (!OM_API_KEY) {
        throw new Error('Orange Money API is not configured. Please set OM_API_KEY environment variable.');
    }

    try {
        // Note: This is a placeholder implementation
        // Adapt to actual Orange Money API documentation
        const response = await axios.post(`${OM_API_URL}/collect`, {
            amount: amountCfa,
            phone: customerPhone,
            description,
            currency: 'XOF'
        }, {
            headers: {
                'Authorization': `Bearer ${OM_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        logger.info(`Orange Money payment collected: ${amountCfa} CFA from ${customerPhone}`);
        return response.data;
    } catch (error) {
        logger.error(`Orange Money payment error: ${error.message}`);
        throw new Error(`Orange Money payment failed: ${error.message}`);
    }
}

/**
 * Transfer commission to Green T SARL Orange Money account
 * @param {number} commissionCfa - Commission amount in CFA
 * @returns {Promise<object>} Transfer result
 */
async function transferCommissionToGreenT({ commissionCfa }) {
    if (!OM_API_KEY || !GREEN_T_OM_ACCOUNT) {
        logger.warn('Orange Money commission transfer not configured');
        return { status: 'SKIPPED', reason: 'Not configured' };
    }

    try {
        const response = await axios.post(`${OM_API_URL}/transfer`, {
            amount: commissionCfa,
            to: GREEN_T_OM_ACCOUNT,
            description: 'Commission Green T SARL 3%',
            currency: 'XOF'
        }, {
            headers: {
                'Authorization': `Bearer ${OM_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        logger.info(`Orange Money commission transferred: ${commissionCfa} CFA to Green T`);
        return response.data;
    } catch (error) {
        logger.error(`Orange Money commission transfer error: ${error.message}`);
        throw new Error(`Orange Money commission transfer failed: ${error.message}`);
    }
}

module.exports = {
    collectOM,
    transferCommissionToGreenT
};
