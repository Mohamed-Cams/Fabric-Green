// Emplacement: backend/src/controllers/property.controller.js
const { getContract } = require('../config/fabric');
const { auditLog } = require('../services/audit.service');
const logger = require('../utils/logger');

/**
 * Register a new property
 */
exports.registerProperty = async (req, res) => {
    try {
        const { propertyId, ownerId, metadata } = req.body;
        const { gateway, contract } = await getContract(req.tenant);

        const result = await contract.submitTransaction(
            'PropertyContract:registerProperty',
            propertyId,
            ownerId,
            JSON.stringify(metadata)
        );

        await auditLog(req.tenant, req.user.id, 'REGISTER_PROPERTY', propertyId);
        gateway.disconnect();

        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        logger.error(`Register property error: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Transfer property ownership
 */
exports.transferProperty = async (req, res) => {
    try {
        const { propertyId, newOwnerId, transferDocHash } = req.body;
        const { gateway, contract } = await getContract(req.tenant);

        const result = await contract.submitTransaction(
            'PropertyContract:transferProperty',
            propertyId,
            newOwnerId,
            transferDocHash
        );

        await auditLog(req.tenant, req.user.id, 'TRANSFER_PROPERTY', propertyId, { newOwnerId });
        gateway.disconnect();

        res.json(JSON.parse(result.toString()));
    } catch (error) {
        logger.error(`Transfer property error: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get property by ID
 */
exports.getProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { gateway, contract } = await getContract(req.tenant);

        const result = await contract.evaluateTransaction(
            'PropertyContract:getProperty',
            id
        );

        gateway.disconnect();
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        logger.error(`Get property error: ${error.message}`);
        res.status(404).json({ error: error.message });
    }
};

/**
 * Get property history
 */
exports.getPropertyHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { gateway, contract } = await getContract(req.tenant);

        const result = await contract.evaluateTransaction(
            'PropertyContract:getPropertyHistory',
            id
        );

        gateway.disconnect();
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        logger.error(`Get property history error: ${error.message}`);
        res.status(404).json({ error: error.message });
    }
};

/**
 * Query properties by owner
 */
exports.getPropertiesByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { gateway, contract } = await getContract(req.tenant);

        const result = await contract.evaluateTransaction(
            'PropertyContract:queryPropertiesByOwner',
            ownerId
        );

        gateway.disconnect();
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        logger.error(`Query properties by owner error: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
