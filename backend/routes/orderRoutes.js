const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', orderController.getMyOrders);
router.post('/', orderController.createOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
