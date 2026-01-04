// Emplacement: backend/src/routes/property.routes.js
const router = require('express').Router();
const { auth } = require('../middleware/auth');
const tenant = require('../middleware/tenant');
const rbac = require('../middleware/rbac');
const { validateProperty, validatePropertyTransfer } = require('../middleware/validate');
const {
    registerProperty,
    transferProperty,
    getProperty,
    getPropertyHistory,
    getPropertiesByOwner
} = require('../controllers/property.controller');

router.post('/register', auth, tenant, rbac, validateProperty, registerProperty);
router.post('/transfer', auth, tenant, rbac, validatePropertyTransfer, transferProperty);
router.get('/:id', auth, tenant, rbac, getProperty);
router.get('/:id/history', auth, tenant, rbac, getPropertyHistory);
router.get('/owner/:ownerId', auth, tenant, rbac, getPropertiesByOwner);

module.exports = router;
