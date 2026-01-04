// Emplacement: backend/src/routes/lease.routes.js
const router = require('express').Router();
const { auth } = require('../middleware/auth');
const tenant = require('../middleware/tenant');
const rbac = require('../middleware/rbac');
const { validateLease, validateRentPayment } = require('../middleware/validate');
const {
    createLease,
    payRent,
    getLeaseStatus,
    closeLease
} = require('../controllers/lease.controller');

router.post('/create', auth, tenant, rbac, validateLease, createLease);
router.post('/pay', auth, tenant, rbac, validateRentPayment, payRent);
router.get('/:id', auth, tenant, rbac, getLeaseStatus);
router.post('/close', auth, tenant, rbac, closeLease);

module.exports = router;
