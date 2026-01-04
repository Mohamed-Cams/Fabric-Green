// Emplacement: backend/src/services/payment/stripe.service.js
const Stripe = require('stripe');
const { STRIPE_KEY } = require('../../config/env');
const logger = require('../../utils/logger');

const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY) : null;

/**
 * Charge payment via Stripe (Visa)
 * @param {number} amountCfa - Amount in CFA francs
 * @param {string} customerEmail - Customer email
 * @param {string} description - Payment description
 * @returns {Promise<object>} Payment intent
 */
async function chargeVisa({ amountCfa, customerEmail, description }) {
    if (!stripe) {
        throw new Error('Stripe is not configured. Please set STRIPE_KEY environment variable.');
    }

    try {
        const amountXof = Math.round(amountCfa * 100); // Stripe uses smallest currency unit (centimes)

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountXof,
            currency: 'xof',
            receipt_email: customerEmail,
            description,
            metadata: {
                platform: 'GreenLand Fabric',
                provider: 'Green T SARL'
            }
        });

        logger.info(`Stripe payment created: ${paymentIntent.id} for ${amountCfa} CFA`);
        return paymentIntent;
    } catch (error) {
        logger.error(`Stripe payment error: ${error.message}`);
        throw new Error(`Stripe payment failed: ${error.message}`);
    }
}

/**
 * Confirm payment intent
 */
async function confirmPayment(paymentIntentId, paymentMethodId) {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId
        });

        return paymentIntent;
    } catch (error) {
        logger.error(`Stripe confirm error: ${error.message}`);
        throw error;
    }
}

module.exports = {
    chargeVisa,
    confirmPayment
};
