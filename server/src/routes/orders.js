const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { validate, orderSchemas } = require('../middleware/validation');
const orderController = require('../controllers/orderController');

/**
 * Order Routes
 * 
 * All routes require authentication
 * Slot-based delivery model
 */

// Create new order
router.post(
    '/',
    authenticate,
    validate(orderSchemas.create),
    asyncHandler(orderController.createOrder)
);

// Get user's orders
router.get(
    '/my',
    authenticate,
    asyncHandler(orderController.getMyOrders)
);

// Get single order details
router.get(
    '/:orderId',
    authenticate,
    asyncHandler(orderController.getOrder)
);

// Cancel order
router.post(
    '/:orderId/cancel',
    authenticate,
    asyncHandler(orderController.cancelOrder)
);

// Rate order
router.post(
    '/:orderId/rate',
    authenticate,
    asyncHandler(orderController.rateOrder)
);

// Reorder (quick repeat)
router.post(
    '/:orderId/reorder',
    authenticate,
    asyncHandler(orderController.reorder)
);

// Get tracking info
router.get(
    '/:orderId/track',
    authenticate,
    asyncHandler(orderController.trackOrder)
);

// Get available delivery slots
router.get(
    '/slots/available',
    authenticate,
    asyncHandler(orderController.getAvailableSlots)
);

module.exports = router;
