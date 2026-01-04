// Emplacement: backend/src/utils/logger.js
const pino = require('pino');
const { NODE_ENV } = require('../config/env');

const logger = pino({
    level: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug'),
    transport: NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined
});

module.exports = logger;
