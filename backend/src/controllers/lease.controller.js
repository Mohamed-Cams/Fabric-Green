// Emplacement: backend/src/controllers/lease.controller.js
const { getContract } = require('../config/fabric');
const { auditLog } = require('../services/audit.service');
const { recordLeasePayment } = require('../utils/metrics');
const { sendLatePaymentNotification } = require('../services/notification.service');
const wave = require('../services/payment/wave.service');
const om = require('../services/payment/orangemoney.service');
const stripe = require('../services/payment/stripe.service');
const { COMMISSION_RATE } = require('../config/env');
const logger = require('../utils/logger');

function calculateCommission(amountCfa) {
    return Math.round(amountCfa * COMMISSION_RATE);
}

/**
 * Create a new lease
 */
exports.createLease = async (req, res) => {
    try {
        const { leaseId, propertyId, landlordId, tenantId, rentAmountCfa, frequency, startIso, endIso } = req.body;
        const { gateway, contract } = await getContract(req.tenant);

        const result = await contract.submitTransaction(
            'LeaseContract:createLease',
            leaseId,
            propertyId,
            landlordId,
            tenantId,
            String(rentAmountCfa),
            frequency,
            startIso,
            endIso
        );

        await auditLog(req.tenant, req.user.id, 'CREATE_LEASE', leaseId);
        gateway.disconnect();

        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        logger.error(`Create lease error: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Pay rent
 */
exports.payRent = async (req, res) => {
    try {
        const { leaseId, paymentId, amountCfa, method, customer } = req.body;

        const commission = calculateCommission(amountCfa);
        const total = amountCfa + commission;

        // Process payment
        let providerResult;
        let commissionTransfer = null;

        switch (method) {
            case 'STRIPE':
                providerResult = await stripe.chargeVisa({
                    amountCfa: total,
                    customerEmail: customer.email,
                    description: `Rent payment for lease ${leaseId}`
                });
                break;

            case 'WAVE':
                providerResult = await wave.collectWave({
                    amountCfa: total,
                    customerPhone: customer.phone,
                    description: `Rent payment for lease ${leaseId}`
                });
                commissionTransfer = await wave.transferCommissionToGreenT({ commissionCfa: commission });
                break;

            case 'OM':
                providerResult = await om.collectOM({
                    amountCfa: total,
                    customerPhone: customer.phone,
                    description: `Rent payment for lease ${leaseId}`
                });
                commissionTransfer = await om.transferCommissionToGreenT({ commissionCfa: commission });
                break;

            case 'BANK':
                providerResult = { status: 'PENDING', total };
                break;

            default:
                return res.status(400).json({ error: 'Invalid payment method' });
        }

        // Record payment on blockchain
        const { gateway, contract } = await getContract(req.tenant);
        const result = await contract.submitTransaction(
            'LeaseContract:payRent',
            leaseId,
            paymentId,
            String(amountCfa),
            new Date().toISOString()
        );

        // Record metrics
        recordLeasePayment(req.tenant, method, amountCfa, false);

        await auditLog(req.tenant, req.user.id, 'PAY_RENT', leaseId, { paymentId, amount: amountCfa });
        gateway.disconnect();

        res.json({
            leasePayment: JSON.parse(result.toString()),
            providerResult,
            commissionTransfer,
            commission
        });
    } catch (error) {
        logger.error(`Pay rent error: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get lease status
 */
exports.getLeaseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { gateway, contract } = await getContract(req.tenant);

        const result = await contract.evaluateTransaction(
            'LeaseContract:leaseStatus',
            id
        );

        gateway.disconnect();
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        logger.error(`Get lease status error: ${error.message}`);
        res.status(404).json({ error: error.message });
    }
};

/**
 * Close a lease
 */
exports.closeLease = async (req, res) => {
    try {
        const { leaseId } = req.body;
        const { gateway, contract } = await getContract(req.tenant);

        const result = await contract.submitTransaction(
            'LeaseContract:closeLease',
            leaseId
        );

        await auditLog(req.tenant, req.user.id, 'CLOSE_LEASE', leaseId);
        gateway.disconnect();

        res.json(JSON.parse(result.toString()));
    } catch (error) {
        logger.error(`Close lease error: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
