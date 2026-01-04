// Emplacement: backend/src/middleware/validate.js
const { validationResult, body, param, query } = require('express-validator');

/**
 * Validation error handler
 */
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

/**
 * Property validation rules
 */
const validateProperty = [
    body('propertyId').notEmpty().isString().trim(),
    body('ownerId').notEmpty().isString().trim(),
    body('metadata').isObject(),
    handleValidationErrors
];

const validatePropertyTransfer = [
    body('propertyId').notEmpty().isString().trim(),
    body('newOwnerId').notEmpty().isString().trim(),
    body('transferDocHash').notEmpty().isString().trim(),
    handleValidationErrors
];

/**
 * Lease validation rules
 */
const validateLease = [
    body('leaseId').notEmpty().isString().trim(),
    body('propertyId').notEmpty().isString().trim(),
    body('landlordId').notEmpty().isString().trim(),
    body('tenantId').notEmpty().isString().trim(),
    body('rentAmountCfa').isNumeric().isFloat({ min: 0 }),
    body('frequency').isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']),
    body('startIso').isISO8601(),
    body('endIso').isISO8601(),
    handleValidationErrors
];

const validateRentPayment = [
    body('leaseId').notEmpty().isString().trim(),
    body('paymentId').notEmpty().isString().trim(),
    body('amountCfa').isNumeric().isFloat({ min: 0 }),
    body('method').isIn(['STRIPE', 'WAVE', 'OM', 'BANK']),
    body('customer').isObject(),
    handleValidationErrors
];

/**
 * Payment validation rules
 */
const validatePayment = [
    body('method').isIn(['STRIPE', 'WAVE', 'OM', 'BANK']),
    body('amountCfa').isNumeric().isFloat({ min: 0 }),
    body('customer').isObject(),
    handleValidationErrors
];

/**
 * Token validation rules
 */
const validateTokenMint = [
    body('propertyId').notEmpty().isString().trim(),
    body('tokenId').notEmpty().isString().trim(),
    body('totalShares').isNumeric().isInt({ min: 1 }),
    handleValidationErrors
];

const validateShareAllocation = [
    body('propertyId').notEmpty().isString().trim(),
    body('tokenId').notEmpty().isString().trim(),
    body('userId').notEmpty().isString().trim(),
    body('shares').isNumeric().isInt({ min: 1 }),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateProperty,
    validatePropertyTransfer,
    validateLease,
    validateRentPayment,
    validatePayment,
    validateTokenMint,
    validateShareAllocation
};
