const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, optionalAuth } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

/**
 * Cart Routes
 * 
 * Supports both authenticated and guest carts
 * Guest carts are stored in session/localStorage on frontend
 */

// Get cart (authenticated)
router.get(
    '/',
    authenticate,
    asyncHandler(cartController.getCart)
);

// Add item to cart
router.post(
    '/add',
    authenticate,
    asyncHandler(cartController.addToCart)
);

// Update item quantity
router.patch(
    '/item/:itemId',
    authenticate,
    asyncHandler(cartController.updateQuantity)
);

// Remove item from cart
router.delete(
    '/item/:itemId',
    authenticate,
    asyncHandler(cartController.removeItem)
);

// Clear cart
router.delete(
    '/clear',
    authenticate,
    asyncHandler(cartController.clearCart)
);

// Apply discount code
router.post(
    '/discount',
    authenticate,
    asyncHandler(cartController.applyDiscount)
);

// Get cart summary (pricing breakdown)
router.get(
    '/summary',
    authenticate,
    asyncHandler(cartController.getCartSummary)
);

// Validate cart (check availability before checkout)
router.post(
    '/validate',
    authenticate,
    asyncHandler(cartController.validateCart)
);

module.exports = router;
