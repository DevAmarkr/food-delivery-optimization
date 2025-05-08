const express = require('express');
const router = express.Router();
const { getDriverRoute, 
    loginOrCreateDriver, 
    acceptOrder,
    getActiveRoute,
     completeOrder, 
     getDeliveryHistory,
    rejectOrder } = require('../controller/driver');

router.get('/driver/:id/route', getDriverRoute);
router.post('/driver/login', loginOrCreateDriver);
router.post('/order/:id/accept', acceptOrder);
router.post('/driver/:id/active-route', getActiveRoute);
router.post('/order/:id/complete', completeOrder);
router.get('/driver/:id/history', getDeliveryHistory);
router.post('/order/:id/reject', rejectOrder);

module.exports = router;