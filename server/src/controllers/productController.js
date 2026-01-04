const Product = require('../models/Product');
const Homemaker = require('../models/Homemaker');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Product Controller
 * 
 * Handles product discovery, search, and reviews
 * SEO-friendly with rich filtering options
 */

/**
 * Get all products with filters
 * GET /api/products
 */
exports.getProducts = async (req, res) => {
    const {
        page = 1,
        limit = 20,
        category,
        region,
        isVegetarian,
        isVegan,
        isGlutenFree,
        minPrice,
        maxPrice,
        sortBy = 'rating'
    } = req.query;

    const query = {
        status: 'active',
        isDeleted: false
    };

    // Apply filters
    if (category) query.category = category;
    if (region) query.region = region;
    if (isVegetarian !== undefined) query['dietary.isVegetarian'] = isVegetarian === 'true';
    if (isVegan === 'true') query['dietary.isVegan'] = true;
    if (isGlutenFree === 'true') query['dietary.isGlutenFree'] = true;

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
        case 'price_asc': sort = { price: 1 }; break;
        case 'price_desc': sort = { price: -1 }; break;
        case 'newest': sort = { createdAt: -1 }; break;
        case 'popular': sort = { 'stats.totalOrders': -1 }; break;
        default: sort = { 'rating.average': -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('homemakerId', 'kitchenName rating location.city')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Product.countDocuments(query)
    ]);

    res.status(200).json({
        success: true,
        data: {
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
};

/**
 * Search products
 * GET /api/products/search
 */
exports.searchProducts = async (req, res) => {
    const { q, page = 1, limit = 20, ...filters } = req.query;

    if (!q) {
        throw ApiError.badRequest('Search query is required');
    }

    const query = {
        $text: { $search: q },
        status: 'active',
        isDeleted: false
    };

    // Apply additional filters
    if (filters.category) query.category = filters.category;
    if (filters.isVegetarian === 'true') query['dietary.isVegetarian'] = true;

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query, { score: { $meta: 'textScore' } })
        .populate('homemakerId', 'kitchenName rating location.city')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    res.status(200).json({
        success: true,
        data: {
            products,
            query: q
        }
    });
};

/**
 * Get featured products (for homepage)
 * GET /api/products/featured
 */
exports.getFeaturedProducts = async (req, res) => {
    const products = await Product.find({
        isFeatured: true,
        status: 'active',
        isDeleted: false
    })
        .populate('homemakerId', 'kitchenName rating famousFor location.city')
        .sort({ 'rating.average': -1 })
        .limit(12)
        .lean();

    res.status(200).json({
        success: true,
        data: { products }
    });
};

/**
 * Get products by category
 * GET /api/products/category/:category
 */
exports.getByCategory = async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find({
        category,
        status: 'active',
        isDeleted: false
    })
        .populate('homemakerId', 'kitchenName rating location.city')
        .sort({ 'rating.average': -1, 'stats.totalOrders': -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    res.status(200).json({
        success: true,
        data: { products, category }
    });
};

/**
 * Get products by region
 * GET /api/products/region/:region
 */
exports.getByRegion = async (req, res) => {
    const { region } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find({
        region,
        status: 'active',
        isDeleted: false
    })
        .populate('homemakerId', 'kitchenName rating location.city')
        .sort({ 'rating.average': -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    res.status(200).json({
        success: true,
        data: { products, region }
    });
};

/**
 * Get single product by ID or slug
 * GET /api/products/:idOrSlug
 */
exports.getProduct = async (req, res) => {
    const { idOrSlug } = req.params;

    let product;

    // Check if it's a MongoDB ObjectId or a slug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(idOrSlug)
            .populate('homemakerId', 'kitchenName bio rating famousFor specialty location videoStory profileImage')
            .populate('reviews.userId', 'name avatar')
            .lean();
    } else {
        product = await Product.findOne({ slug: idOrSlug })
            .populate('homemakerId', 'kitchenName bio rating famousFor specialty location videoStory profileImage')
            .populate('reviews.userId', 'name avatar')
            .lean();
    }

    if (!product || product.isDeleted) {
        throw ApiError.notFound('Product not found');
    }

    // Get related products from same homemaker
    const relatedProducts = await Product.find({
        homemakerId: product.homemakerId._id,
        _id: { $ne: product._id },
        status: 'active',
        isDeleted: false
    })
        .limit(4)
        .lean();

    res.status(200).json({
        success: true,
        data: {
            product,
            relatedProducts
        }
    });
};

/**
 * Get products by homemaker
 * GET /api/products/homemaker/:homemakerId
 */
exports.getByHomemaker = async (req, res) => {
    const { homemakerId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find({
        homemakerId,
        status: 'active',
        isDeleted: false
    })
        .sort({ 'stats.totalOrders': -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    res.status(200).json({
        success: true,
        data: { products }
    });
};

/**
 * Add review to product
 * POST /api/products/:productId/review
 */
exports.addReview = async (req, res) => {
    const { productId } = req.params;
    const { rating, comment, images } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw ApiError.badRequest('Rating must be between 1 and 5');
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
        r => r.userId.toString() === req.user._id.toString()
    );

    if (existingReview) {
        throw ApiError.conflict('You have already reviewed this product');
    }

    // Add review
    await product.addReview(req.user._id, rating, comment, images);

    // Also update homemaker rating
    const homemaker = await Homemaker.findById(product.homemakerId);
    if (homemaker) {
        await homemaker.updateRating(rating);
    }

    res.status(201).json({
        success: true,
        message: 'Review added successfully'
    });
};
