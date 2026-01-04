// Emplacement: backend/src/routes/payment.routes.js
const router = require('express').Router();
const { auth } = require('../middleware/auth');
const tenant = require('../middleware/tenant');
const rbac = require('../middleware/rbac');
const { paymentLimiter } = require('../middleware/rateLimit');
const { validatePayment } = require('../middleware/validate');
const { processPayment } = require('../controllers/payment.controller');

router.post('/pay', auth, tenant, rbac, paymentLimiter, validatePayment, processPayment);

module.exports = router;
