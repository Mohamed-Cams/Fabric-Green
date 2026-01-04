// Emplacement: backend/src/app.js
const express = require('express');
const { applySecurityMiddleware } = require('./config/security');
const { metricsEndpoint } = require('./utils/metrics');
const logger = require('./utils/logger');

// Import routes
const propertyRoutes = require('./routes/property.routes');
const paymentRoutes = require('./routes/payment.routes');
const leaseRoutes = require('./routes/lease.routes');

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
applySecurityMiddleware(app);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Metrics endpoint
app.get('/metrics', metricsEndpoint);

// API routes
app.use('/api/properties', propertyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leases', leaseRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
