// Emplacement: backend/src/utils/metrics.js
const client = require('prom-client');

// Collect default metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Custom metrics
const paymentTotal = new client.Counter({
    name: 'payment_total_amount_cfa',
    help: 'Total payment amount in CFA',
    labelNames: ['method', 'tenant']
});

const paymentCommission = new client.Counter({
    name: 'payment_commission_cfa',
    help: 'Commission collected by Green T in CFA',
    labelNames: ['method', 'tenant']
});

const leasePayments = new client.Counter({
    name: 'lease_payment_total_cfa',
    help: 'Total lease payments in CFA',
    labelNames: ['tenant', 'method']
});

const leaseLatePayments = new client.Counter({
    name: 'lease_payment_late_total',
    help: 'Number of late lease payments',
    labelNames: ['tenant']
});

const activeLeases = new client.Gauge({
    name: 'lease_active_total',
    help: 'Number of active leases',
    labelNames: ['tenant']
});

const notificationsSent = new client.Counter({
    name: 'notification_sent_total',
    help: 'Total notifications sent',
    labelNames: ['channel', 'type']
});

/**
 * Record payment metrics
 */
function recordPayment(method, tenant, amountCfa, commissionCfa) {
    paymentTotal.inc({ method, tenant }, amountCfa);
    paymentCommission.inc({ method, tenant }, commissionCfa);
}

/**
 * Record lease payment metrics
 */
function recordLeasePayment(tenant, method, amountCfa, isLate = false) {
    leasePayments.inc({ tenant, method }, amountCfa);
    if (isLate) {
        leaseLatePayments.inc({ tenant }, 1);
    }
}

/**
 * Update active leases count
 */
function updateActiveLeases(tenant, count) {
    activeLeases.set({ tenant }, count);
}

/**
 * Record notification sent
 */
function recordNotification(channel, type) {
    notificationsSent.inc({ channel, type }, 1);
}

/**
 * Metrics endpoint handler
 */
async function metricsEndpoint(req, res) {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
}

module.exports = {
    recordPayment,
    recordLeasePayment,
    updateActiveLeases,
    recordNotification,
    metricsEndpoint
};
