const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, homemakerAuth } = require('../middleware/auth');
const { validate, homemakerSchemas } = require('../middleware/validation');
const homemakerController = require('../controllers/homemakerController');

/**
 * Homemaker Routes
 * 
 * Public: Browse homemakers, view profiles
 * Protected: Homemaker dashboard operations
 */

// ==================
// PUBLIC ROUTES
// ==================

// Get all homemakers (browse feed)
router.get(
    '/',
    asyncHandler(homemakerController.getHomemakers)
);

// Get featured homemakers
router.get(
    '/featured',
    asyncHandler(homemakerController.getFeatured)
);

// Get nearby homemakers (location-based)
router.get(
    '/nearby',
    asyncHandler(homemakerController.getNearby)
);

// Get homemaker by ID (public profile)
router.get(
    '/:id',
    asyncHandler(homemakerController.getHomemaker)
);

// ==================
// PROTECTED ROUTES (Homemaker Dashboard)
// ==================

// Register as homemaker
router.post(
    '/register',
    authenticate,
    validate(homemakerSchemas.register),
    asyncHandler(homemakerController.register)
);

// Get own dashboard data
router.get(
    '/dashboard/overview',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.getDashboard)
);

// Get orders for homemaker
router.get(
    '/dashboard/orders',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.getOrders)
);

// Update order item status (Accept -> Cooking -> Ready)
router.patch(
    '/dashboard/orders/:orderId/items/:itemId',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.updateOrderItemStatus)
);

// Get earnings
router.get(
    '/dashboard/earnings',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.getEarnings)
);

// ==================
// KITCHEN MANAGEMENT
// ==================

// Get own products (My Kitchen)
router.get(
    '/kitchen/products',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.getMyProducts)
);

// Add new product
router.post(
    '/kitchen/products',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.addProduct)
);

// Update product
router.patch(
    '/kitchen/products/:productId',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.updateProduct)
);

// Toggle product availability
router.patch(
    '/kitchen/products/:productId/toggle',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.toggleProductAvailability)
);

// Delete product
router.delete(
    '/kitchen/products/:productId',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.deleteProduct)
);

// Update capacity limits
router.patch(
    '/kitchen/capacity',
    authenticate,
    homemakerAuth,
    validate(homemakerSchemas.updateCapacity),
    asyncHandler(homemakerController.updateCapacity)
);

// Toggle vacation mode
router.patch(
    '/kitchen/vacation',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.toggleVacation)
);

// Update profile
router.patch(
    '/profile',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.updateProfile)
);

// Upload video story
router.post(
    '/profile/video',
    authenticate,
    homemakerAuth,
    asyncHandler(homemakerController.uploadVideoStory)
);

module.exports = router;
