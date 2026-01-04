const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, productSchemas } = require('../middleware/validation');
const productController = require('../controllers/productController');

/**
 * Product Routes
 * 
 * Public: Browse, search, view products
 * Protected: Review products (authenticated users)
 */

// Get all products with filters (public)
router.get(
    '/',
    optionalAuth,
    validate(productSchemas.search, 'query'),
    asyncHandler(productController.getProducts)
);

// Search products (public)
router.get(
    '/search',
    optionalAuth,
    validate(productSchemas.search, 'query'),
    asyncHandler(productController.searchProducts)
);

// Get featured products (for homepage)
router.get(
    '/featured',
    optionalAuth,
    asyncHandler(productController.getFeaturedProducts)
);

// Get products by category
router.get(
    '/category/:category',
    optionalAuth,
    asyncHandler(productController.getByCategory)
);

// Get products by region
router.get(
    '/region/:region',
    optionalAuth,
    asyncHandler(productController.getByRegion)
);

// Get single product by ID or slug (public)
router.get(
    '/:idOrSlug',
    optionalAuth,
    asyncHandler(productController.getProduct)
);

// Get products by homemaker (public)
router.get(
    '/homemaker/:homemakerId',
    optionalAuth,
    asyncHandler(productController.getByHomemaker)
);

// Add review to product (authenticated)
router.post(
    '/:productId/review',
    authenticate,
    asyncHandler(productController.addReview)
);

module.exports = router;
