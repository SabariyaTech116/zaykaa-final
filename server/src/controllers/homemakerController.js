const Homemaker = require('../models/Homemaker');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Homemaker Controller
 * 
 * Handles public browsing and homemaker dashboard operations
 * Focus: Empowering homemakers with simple, intuitive controls
 */

// ==================
// PUBLIC ENDPOINTS
// ==================

/**
 * Get all homemakers (browse feed)
 * GET /api/homemakers
 */
exports.getHomemakers = async (req, res) => {
    const { page = 1, limit = 20, city, specialty } = req.query;

    const query = {
        isActive: true,
        isVacationMode: false,
        onboardingStatus: 'approved'
    };

    if (city) query['location.city'] = new RegExp(city, 'i');
    if (specialty) query.specialty = { $in: [specialty] };

    const skip = (Number(page) - 1) * Number(limit);

    const homemakers = await Homemaker.find(query)
        .populate('userId', 'name avatar')
        .select('kitchenName famousFor specialty rating location.city profileImage videoStory capacity')
        .sort({ 'rating.average': -1, 'stats.totalOrders': -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    // Add next available slot info
    const homemakersWithSlots = homemakers.map(h => ({
        ...h,
        nextSlot: h.capacity.currentMorningOrders < h.capacity.morningSlot
            ? 'Tomorrow Morning (6-8 AM)'
            : h.capacity.currentEveningOrders < h.capacity.eveningSlot
                ? 'Tomorrow Evening (5-7 PM)'
                : 'Fully Booked'
    }));

    res.status(200).json({
        success: true,
        data: { homemakers: homemakersWithSlots }
    });
};

/**
 * Get featured homemakers
 * GET /api/homemakers/featured
 */
exports.getFeatured = async (req, res) => {
    const homemakers = await Homemaker.find({
        isFeatured: true,
        isActive: true,
        isVacationMode: false
    })
        .populate('userId', 'name avatar')
        .select('kitchenName famousFor specialty rating location.city profileImage videoStory')
        .sort({ 'rating.average': -1 })
        .limit(10)
        .lean();

    res.status(200).json({
        success: true,
        data: { homemakers }
    });
};

/**
 * Get nearby homemakers
 * GET /api/homemakers/nearby
 */
exports.getNearby = async (req, res) => {
    const { lat, long, radius = 10 } = req.query;

    if (!lat || !long) {
        throw ApiError.badRequest('Latitude and longitude are required');
    }

    const homemakers = await Homemaker.findNearby(
        [Number(long), Number(lat)],
        Number(radius) * 1000 // Convert km to meters
    );

    res.status(200).json({
        success: true,
        data: { homemakers }
    });
};

/**
 * Get homemaker by ID
 * GET /api/homemakers/:id
 */
exports.getHomemaker = async (req, res) => {
    const { id } = req.params;

    const homemaker = await Homemaker.findById(id)
        .populate('userId', 'name avatar phone')
        .lean();

    if (!homemaker || !homemaker.isActive) {
        throw ApiError.notFound('Homemaker not found');
    }

    // Get homemaker's products
    const products = await Product.find({
        homemakerId: id,
        status: 'active',
        isDeleted: false
    })
        .sort({ 'stats.totalOrders': -1 })
        .lean();

    res.status(200).json({
        success: true,
        data: {
            homemaker,
            products,
            canAcceptMorning: homemaker.capacity.currentMorningOrders < homemaker.capacity.morningSlot,
            canAcceptEvening: homemaker.capacity.currentEveningOrders < homemaker.capacity.eveningSlot
        }
    });
};

// ==================
// HOMEMAKER REGISTRATION
// ==================

/**
 * Register as homemaker
 * POST /api/homemakers/register
 */
exports.register = async (req, res) => {
    // Check if already a homemaker
    const existing = await Homemaker.findOne({ userId: req.user._id });

    if (existing) {
        throw ApiError.conflict('You are already registered as a homemaker');
    }

    const homemaker = new Homemaker({
        userId: req.user._id,
        ...req.body,
        onboardingStatus: 'pending'
    });

    await homemaker.save();

    // Update user role
    await User.findByIdAndUpdate(req.user._id, { role: 'homemaker' });

    res.status(201).json({
        success: true,
        message: 'Registration submitted. We will review and approve within 24-48 hours.',
        data: { homemaker }
    });
};

// ==================
// DASHBOARD ENDPOINTS
// ==================

/**
 * Get dashboard overview
 * GET /api/homemakers/dashboard/overview
 */
exports.getDashboard = async (req, res) => {
    const homemaker = req.homemaker;

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
        'items.homemakerId': homemaker._id,
        createdAt: { $gte: today }
    });

    const pendingOrders = await Order.countDocuments({
        'items.homemakerId': homemaker._id,
        status: { $in: ['placed', 'confirmed', 'processing'] }
    });

    res.status(200).json({
        success: true,
        data: {
            kitchenName: homemaker.kitchenName,
            isActive: homemaker.isActive,
            isVacationMode: homemaker.isVacationMode,
            onboardingStatus: homemaker.onboardingStatus,
            rating: homemaker.rating,
            capacity: homemaker.capacity,
            stats: {
                todayOrders,
                pendingOrders,
                totalOrders: homemaker.stats.totalOrders,
                totalEarnings: homemaker.totalEarnings,
                pendingPayout: homemaker.pendingPayout
            }
        }
    });
};

/**
 * Get orders for homemaker
 * GET /api/homemakers/dashboard/orders
 */
exports.getOrders = async (req, res) => {
    const { status, slot, date } = req.query;

    const orders = await Order.getHomemakerOrders(
        req.homemaker._id,
        status,
        slot,
        date || new Date()
    );

    // Filter to only show items for this homemaker
    const formattedOrders = orders.map(order => ({
        ...order.toObject(),
        items: order.items.filter(
            item => item.homemakerId.toString() === req.homemaker._id.toString()
        )
    }));

    res.status(200).json({
        success: true,
        data: { orders: formattedOrders }
    });
};

/**
 * Update order item status
 * PATCH /api/homemakers/dashboard/orders/:orderId/items/:itemId
 */
exports.updateOrderItemStatus = async (req, res) => {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const validStatuses = ['accepted', 'cooking', 'packed', 'ready'];

    if (!validStatuses.includes(status)) {
        throw ApiError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw ApiError.notFound('Order not found');
    }

    const item = order.items.id(itemId);

    if (!item) {
        throw ApiError.notFound('Item not found');
    }

    // Verify ownership
    if (item.homemakerId.toString() !== req.homemaker._id.toString()) {
        throw ApiError.forbidden('You can only update your own items');
    }

    await order.updateItemStatus(itemId, status, req.user._id);

    res.status(200).json({
        success: true,
        message: `Item status updated to ${status}`
    });
};

/**
 * Get earnings
 * GET /api/homemakers/dashboard/earnings
 */
exports.getEarnings = async (req, res) => {
    const homemaker = req.homemaker;

    // Get this week's earnings
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyOrders = await Order.find({
        'items.homemakerId': homemaker._id,
        status: 'delivered',
        createdAt: { $gte: startOfWeek }
    });

    const weeklyEarnings = weeklyOrders.reduce((total, order) => {
        const homemakerItems = order.items.filter(
            item => item.homemakerId.toString() === homemaker._id.toString()
        );
        return total + homemakerItems.reduce((sum, item) => sum + item.subtotal, 0);
    }, 0);

    // Calculate commission
    const commission = (weeklyEarnings * homemaker.commissionRate) / 100;
    const netEarnings = weeklyEarnings - commission;

    // Get best selling products
    const productStats = await Order.aggregate([
        { $match: { 'items.homemakerId': homemaker._id, status: 'delivered' } },
        { $unwind: '$items' },
        { $match: { 'items.homemakerId': homemaker._id } },
        { $group: { _id: '$items.productId', totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subtotal' } } },
        { $sort: { totalQty: -1 } },
        { $limit: 5 }
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalEarnings: homemaker.totalEarnings,
            pendingPayout: homemaker.pendingPayout,
            thisWeek: {
                gross: weeklyEarnings,
                commission,
                net: netEarnings,
                ordersCompleted: weeklyOrders.length
            },
            earningsHistory: homemaker.earningsHistory.slice(-6),
            topProducts: productStats
        }
    });
};

// ==================
// KITCHEN MANAGEMENT
// ==================

/**
 * Get my products
 * GET /api/homemakers/kitchen/products
 */
exports.getMyProducts = async (req, res) => {
    const products = await Product.find({
        homemakerId: req.homemaker._id,
        isDeleted: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: { products }
    });
};

/**
 * Add new product
 * POST /api/homemakers/kitchen/products
 */
exports.addProduct = async (req, res) => {
    const product = new Product({
        homemakerId: req.homemaker._id,
        ...req.body,
        status: 'pending_approval'
    });

    await product.save();

    res.status(201).json({
        success: true,
        message: 'Product added. It will be visible after approval.',
        data: { product }
    });
};

/**
 * Update product
 * PATCH /api/homemakers/kitchen/products/:productId
 */
exports.updateProduct = async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({
        _id: productId,
        homemakerId: req.homemaker._id
    });

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    Object.assign(product, req.body);
    await product.save();

    res.status(200).json({
        success: true,
        message: 'Product updated',
        data: { product }
    });
};

/**
 * Toggle product availability
 * PATCH /api/homemakers/kitchen/products/:productId/toggle
 */
exports.toggleProductAvailability = async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({
        _id: productId,
        homemakerId: req.homemaker._id
    });

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.status(200).json({
        success: true,
        message: `Product is now ${product.isAvailable ? 'available' : 'unavailable'}`,
        data: { isAvailable: product.isAvailable }
    });
};

/**
 * Delete product
 * DELETE /api/homemakers/kitchen/products/:productId
 */
exports.deleteProduct = async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({
        _id: productId,
        homemakerId: req.homemaker._id
    });

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    // Soft delete
    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();

    res.status(200).json({
        success: true,
        message: 'Product deleted'
    });
};

/**
 * Update capacity limits
 * PATCH /api/homemakers/kitchen/capacity
 */
exports.updateCapacity = async (req, res) => {
    const { morningSlot, eveningSlot } = req.body;

    if (morningSlot !== undefined) {
        req.homemaker.capacity.morningSlot = morningSlot;
    }
    if (eveningSlot !== undefined) {
        req.homemaker.capacity.eveningSlot = eveningSlot;
    }

    await req.homemaker.save();

    res.status(200).json({
        success: true,
        message: 'Capacity updated',
        data: { capacity: req.homemaker.capacity }
    });
};

/**
 * Toggle vacation mode
 * PATCH /api/homemakers/kitchen/vacation
 */
exports.toggleVacation = async (req, res) => {
    const { vacationTill } = req.body;

    req.homemaker.isVacationMode = !req.homemaker.isVacationMode;

    if (req.homemaker.isVacationMode && vacationTill) {
        req.homemaker.vacationTill = new Date(vacationTill);
    } else {
        req.homemaker.vacationTill = undefined;
    }

    await req.homemaker.save();

    res.status(200).json({
        success: true,
        message: req.homemaker.isVacationMode
            ? 'Vacation mode enabled. You will not receive new orders.'
            : 'Vacation mode disabled. You are now accepting orders.',
        data: { isVacationMode: req.homemaker.isVacationMode }
    });
};

/**
 * Update profile
 * PATCH /api/homemakers/profile
 */
exports.updateProfile = async (req, res) => {
    const allowedFields = ['kitchenName', 'bio', 'specialty', 'famousFor', 'cuisineTypes', 'workingDays'];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            req.homemaker[field] = req.body[field];
        }
    });

    await req.homemaker.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated',
        data: { homemaker: req.homemaker }
    });
};

/**
 * Upload video story
 * POST /api/homemakers/profile/video
 */
exports.uploadVideoStory = async (req, res) => {
    const { url, thumbnail } = req.body;

    req.homemaker.videoStory = {
        url,
        thumbnail,
        uploadedAt: new Date()
    };

    await req.homemaker.save();

    res.status(200).json({
        success: true,
        message: 'Video story uploaded',
        data: { videoStory: req.homemaker.videoStory }
    });
};
