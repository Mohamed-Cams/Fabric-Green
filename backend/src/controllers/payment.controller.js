// Emplacement: backend/src/controllers/payment.controller.js
const wave = require('../services/payment/wave.service');
const om = require('../services/payment/orangemoney.service');
const stripe = require('../services/payment/stripe.service');
const bank = require('../services/payment/bank.service');
const { COMMISSION_RATE } = require('../config/env');
const { recordPayment } = require('../utils/metrics');
const { auditLog } = require('../services/audit.service');
const logger = require('../utils/logger');

/**
 * Calculate commission (3% for Green T SARL)
 */
function calculateCommission(amountCfa) {
    return Math.round(amountCfa * COMMISSION_RATE);
}

/**
 * Process payment
 */
exports.processPayment = async (req, res) => {
    try {
        const { method, amountCfa, customer, description = 'Property transaction' } = req.body;

        const commission = calculateCommission(amountCfa);
        const total = amountCfa + commission;

        let providerResult;
        let commissionTransfer = null;

        // Process payment based on method
        switch (method) {
            case 'STRIPE':
                providerResult = await stripe.chargeVisa({
                    amountCfa: total,
                    customerEmail: customer.email,
                    description
                });
                break;

            case 'WAVE':
                providerResult = await wave.collectWave({
                    amountCfa: total,
                    customerPhone: customer.phone,
                    description
                });
                // Transfer commission immediately
                commissionTransfer = await wave.transferCommissionToGreenT({ commissionCfa: commission });
                break;

            case 'OM':
                providerResult = await om.collectOM({
                    amountCfa: total,
                    customerPhone: customer.phone,
                    description
                });
                // Transfer commission immediately
                commissionTransfer = await om.transferCommissionToGreenT({ commissionCfa: commission });
                break;

            case 'BANK':
                providerResult = await bank.recordBankTransfer({
                    amountCfa: total,
                    proofUrl: customer.proofUrl,
                    payerName: customer.name
                });
                break;

            default:
                return res.status(400).json({ error: 'Invalid payment method' });
        }

        // Record metrics
        recordPayment(method, req.tenant, amountCfa, commission);

        // Audit log
        await auditLog(req.tenant, req.user.id, 'PAYMENT', `${method}-${Date.now()}`, {
            method,
            amount: amountCfa,
            commission,
            total
        });

        logger.info(`Payment processed: ${method}, ${total} CFA (commission: ${commission} CFA)`);

        res.json({
            success: true,
            method,
            amountCfa,
            commission,
            total,
            commissionRate: COMMISSION_RATE,
            providerResult,
            commissionTransfer
        });
    } catch (error) {
        logger.error(`Payment processing error: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
