// Emplacement: backend/src/server.js
const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');
const { testConnection, syncDatabase } = require('./config/db');
const { initTracing } = require('./utils/otel');
const logger = require('./utils/logger');

// Initialize OpenTelemetry tracing
if (NODE_ENV === 'production') {
    initTracing();
}

/**
 * Start the server
 */
async function startServer() {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            logger.warn('Database connection failed, but continuing...');
        }

        // Sync database (development only)
        if (NODE_ENV === 'development') {
            await syncDatabase();
        }

        // Start HTTP server
        const server = app.listen(PORT, () => {
            logger.info(`🚀 GreenLand Fabric Backend running on port ${PORT}`);
            logger.info(`📊 Environment: ${NODE_ENV}`);
            logger.info(`📈 Metrics available at http://localhost:${PORT}/metrics`);
            logger.info(`❤️  Health check at http://localhost:${PORT}/health`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT signal received: closing HTTP server');
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
}

startServer();
