// Emplacement: backend/src/services/payment/wave.service.js
const axios = require('axios');
const { WAVE_API_KEY, WAVE_API_URL, GREEN_T_WAVE_ACCOUNT } = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Collect payment via Wave Senegal
 * @param {number} amountCfa - Amount in CFA francs
 * @param {string} customerPhone - Customer phone number
 * @param {string} description - Payment description
 * @returns {Promise<object>} Payment result
 */
async function collectWave({ amountCfa, customerPhone, description }) {
    if (!WAVE_API_KEY) {
        throw new Error('Wave API is not configured. Please set WAVE_API_KEY environment variable.');
    }

    try {
        // Note: This is a placeholder implementation
        // Adapt to actual Wave API documentation
        const response = await axios.post(`${WAVE_API_URL}/collect`, {
            amount: amountCfa,
            phone: customerPhone,
            description,
            currency: 'XOF'
        }, {
            headers: {
                'Authorization': `Bearer ${WAVE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        logger.info(`Wave payment collected: ${amountCfa} CFA from ${customerPhone}`);
        return response.data;
    } catch (error) {
        logger.error(`Wave payment error: ${error.message}`);
        throw new Error(`Wave payment failed: ${error.message}`);
    }
}

/**
 * Transfer commission to Green T SARL Wave account
 * @param {number} commissionCfa - Commission amount in CFA
 * @returns {Promise<object>} Transfer result
 */
async function transferCommissionToGreenT({ commissionCfa }) {
    if (!WAVE_API_KEY || !GREEN_T_WAVE_ACCOUNT) {
        logger.warn('Wave commission transfer not configured');
        return { status: 'SKIPPED', reason: 'Not configured' };
    }

    try {
        const response = await axios.post(`${WAVE_API_URL}/transfer`, {
            amount: commissionCfa,
            to: GREEN_T_WAVE_ACCOUNT,
            description: 'Commission Green T SARL 3%',
            currency: 'XOF'
        }, {
            headers: {
                'Authorization': `Bearer ${WAVE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        logger.info(`Wave commission transferred: ${commissionCfa} CFA to Green T`);
        return response.data;
    } catch (error) {
        logger.error(`Wave commission transfer error: ${error.message}`);
        throw new Error(`Wave commission transfer failed: ${error.message}`);
    }
}

module.exports = {
    collectWave,
    transferCommissionToGreenT
};
