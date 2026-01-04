// Emplacement: backend/src/config/db.js
const { Sequelize } = require('sequelize');
const { DB_URL, NODE_ENV } = require('./env');
const logger = require('../utils/logger');

const sequelize = new Sequelize(DB_URL, {
    dialect: 'postgres',
    logging: NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
});

/**
 * Test database connection
 */
async function testConnection() {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');
        return true;
    } catch (error) {
        logger.error('Unable to connect to database:', error);
        return false;
    }
}

/**
 * Sync database models
 */
async function syncDatabase(options = {}) {
    try {
        await sequelize.sync(options);
        logger.info('Database synchronized');
    } catch (error) {
        logger.error('Database sync error:', error);
        throw error;
    }
}

module.exports = {
    sequelize,
    testConnection,
    syncDatabase
};
