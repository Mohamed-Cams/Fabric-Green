// Emplacement: backend/src/config/fabric.js
const { Wallets, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const { FABRIC_WALLET, FABRIC_CONNECTIONS_DIR } = require('./env');
const logger = require('../utils/logger');

/**
 * Get Fabric contract for a specific tenant
 * @param {string} tenant - Tenant identifier (e.g., 'dakar', 'thies')
 * @param {string} chaincodeName - Name of the chaincode (default: 'property')
 * @returns {Promise<{gateway: Gateway, contract: Contract}>}
 */
async function getContract(tenant, chaincodeName = 'property') {
    try {
        // Load connection profile
        const ccpPath = path.resolve(FABRIC_CONNECTIONS_DIR, `${tenant}.json`);

        if (!fs.existsSync(ccpPath)) {
            throw new Error(`Connection profile not found for tenant: ${tenant}`);
        }

        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Load wallet
        const walletPath = path.resolve(FABRIC_WALLET);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check for identity
        const identity = await wallet.get('appUser');
        if (!identity) {
            throw new Error('Missing identity "appUser" in wallet. Please enroll the user first.');
        }

        // Create gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'appUser',
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get network and contract
        const network = await gateway.getNetwork(`channel-${tenant}`);
        const contract = network.getContract(chaincodeName);

        logger.info(`Connected to Fabric network for tenant: ${tenant}, chaincode: ${chaincodeName}`);

        return { gateway, contract };
    } catch (error) {
        logger.error(`Error connecting to Fabric: ${error.message}`);
        throw error;
    }
}

/**
 * Submit a transaction to the blockchain
 * @param {string} tenant - Tenant identifier
 * @param {string} contractName - Contract name (e.g., 'PropertyContract')
 * @param {string} functionName - Function name
 * @param {Array} args - Function arguments
 * @returns {Promise<any>}
 */
async function submitTransaction(tenant, contractName, functionName, ...args) {
    const { gateway, contract } = await getContract(tenant);

    try {
        const result = await contract.submitTransaction(`${contractName}:${functionName}`, ...args);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
}

/**
 * Evaluate a transaction (query) on the blockchain
 * @param {string} tenant - Tenant identifier
 * @param {string} contractName - Contract name
 * @param {string} functionName - Function name
 * @param {Array} args - Function arguments
 * @returns {Promise<any>}
 */
async function evaluateTransaction(tenant, contractName, functionName, ...args) {
    const { gateway, contract } = await getContract(tenant);

    try {
        const result = await contract.evaluateTransaction(`${contractName}:${functionName}`, ...args);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
}

module.exports = {
    getContract,
    submitTransaction,
    evaluateTransaction
};
