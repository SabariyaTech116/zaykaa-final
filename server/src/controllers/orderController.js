const Order = require('../models/Order');
const Product = require('../models/Product');
const Homemaker = require('../models/Homemaker');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Order Controller
 * 
 * Slot-based ordering system
 * Key feature: Morning (6-8 AM) and Evening (5-7 PM) delivery slots
 */

/**
 * Create new order
 * POST /api/orders
 */
exports.createOrder = async (req, res) => {
    const {
        items,
        deliveryAddress,
        deliverySlot,
        deliveryDate,
        appreciationNote,
        paymentMethod,
        useWallet,
        discountCode,
        isNeighborPickup,
        neighborDetails
    } = req.body;

    // Validate delivery date (must be tomorrow or later)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const requestedDate = new Date(deliveryDate);
    if (requestedDate < tomorrow) {
        throw ApiError.badRequest('Delivery date must be tomorrow or later');
    }

    // Calculate order details
    let subtotal = 0;
    const orderItems = [];
    const homemakerIds = new Set();

    for (const item of items) {
        const product = await Product.findById(item.productId).populate('homemakerId', 'kitchenName capacity');

        if (!product || product.status !== 'active') {
            throw ApiError.badRequest(`Product ${item.productId} is not available`);
        }

        // Check stock availability for the slot
        const stockKey = deliverySlot.toLowerCase();
        if (product.currentStock[stockKey] + item.quantity > product.stockLimitPerDay) {
            throw ApiError.badRequest(`${product.name} is out of stock for this slot`);
        }

        // Check homemaker capacity
        const homemaker = product.homemakerId;
        const capacityKey = `${stockKey}Slot`;
        const currentKey = `current${stockKey.charAt(0).toUpperCase() + stockKey.slice(1)}Orders`;

        if (homemaker.capacity[currentKey] >= homemaker.capacity[capacityKey]) {
            throw ApiError.badRequest(`${homemaker.kitchenName} is fully booked for this slot`);
        }

        const itemSubtotal = (product.discountedPrice || product.price) * item.quantity;

        orderItems.push({
            productId: product._id,
            homemakerId: product.homemakerId._id,
            name: product.name,
            quantity: item.quantity,
            priceAtPurchase: product.discountedPrice || product.price,
            subtotal: itemSubtotal,
            appreciationNote: item.appreciationNote
        });

        subtotal += itemSubtotal;
        homemakerIds.add(product.homemakerId._id.toString());
    }

    // Calculate pricing
    const deliveryFee = isNeighborPickup ? 0 : 25; // ₹25 delivery, free for neighbor pickup
    const packagingFee = 10;
    let discount = 0;

    // 5% prepaid discount
    const isPrepaid = paymentMethod !== 'cod';
    if (isPrepaid) {
        discount = Math.round(subtotal * 0.05);
    }

    // Apply wallet if requested
    let walletUsed = 0;
    if (useWallet && req.user.wallet.balance > 0) {
        walletUsed = Math.min(req.user.wallet.balance, subtotal - discount);
    }

    const total = subtotal + deliveryFee + packagingFee - discount - walletUsed;

    // Validate COD limit
    if (paymentMethod === 'cod' && total > 1000) {
        throw ApiError.badRequest('Cash on Delivery is only available for orders below ₹1000');
    }

    // Create slot display string
    const slotDisplayMap = {
        MORNING: '6 AM - 8 AM',
        EVENING: '5 PM - 7 PM'
    };
    const dateStr = requestedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
    const slotDisplay = `${dateStr}, ${slotDisplayMap[deliverySlot]}`;

    // Create order
    const order = new Order({
        customerId: req.user._id,
        items: orderItems,
        homemakers: Array.from(homemakerIds),
        pricing: {
            subtotal,
            deliveryFee,
            packagingFee,
            discount,
            walletUsed,
            total
        },
        isPrepaid,
        prepaidDiscount: isPrepaid ? discount : 0,
        delivery: {
            address: deliveryAddress,
            slot: deliverySlot,
            date: requestedDate,
            slotDisplay,
            isNeighborPickup,
            neighborDetails
        },
        appreciationNote,
        payment: {
            method: paymentMethod,
            status: paymentMethod === 'wallet' ? 'success' : 'pending'
        },
        isFirstOrder: req.user.isFirstOrder,
        isSamplerOrder: false
    });

    await order.save();

    // Update product stock
    for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { [`currentStock.${deliverySlot.toLowerCase()}`]: item.quantity }
        });
    }

    // Update homemaker capacity
    for (const homemakerId of homemakerIds) {
        const capacityField = deliverySlot === 'MORNING' ? 'capacity.currentMorningOrders' : 'capacity.currentEveningOrders';
        await Homemaker.findByIdAndUpdate(homemakerId, {
            $inc: { [capacityField]: 1 }
        });
    }

    // Deduct wallet if used
    if (walletUsed > 0) {
        await req.user.addWalletTransaction(walletUsed, 'debit', `Order ${order.orderId}`, order._id);
    }

    // Update user's first order status
    if (req.user.isFirstOrder) {
        await User.findByIdAndUpdate(req.user._id, {
            isFirstOrder: false,
            $inc: { orderCount: 1 }
        });
    } else {
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { orderCount: 1 }
        });
    }

    res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: {
            order: {
                orderId: order.orderId,
                total: order.pricing.total,
                slotDisplay: order.delivery.slotDisplay,
                status: order.status,
                paymentStatus: order.payment.status
            }
        }
    });
};

/**
 * Get user's orders
 * GET /api/orders/my
 */
exports.getMyOrders = async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const query = { customerId: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('items.productId', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Order.countDocuments(query)
    ]);

    res.status(200).json({
        success: true,
        data: {
            orders,
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
 * Get single order details
 * GET /api/orders/:orderId
 */
exports.getOrder = async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
        $or: [{ _id: orderId }, { orderId }],
        customerId: req.user._id
    })
        .populate('items.productId', 'name images')
        .populate('items.homemakerId', 'kitchenName')
        .lean();

    if (!order) {
        throw ApiError.notFound('Order not found');
    }

    res.status(200).json({
        success: true,
        data: { order }
    });
};

/**
 * Cancel order
 * POST /api/orders/:orderId/cancel
 */
exports.cancelOrder = async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
        $or: [{ _id: orderId }, { orderId }],
        customerId: req.user._id
    });

    if (!order) {
        throw ApiError.notFound('Order not found');
    }

    // Can only cancel if not yet cooking
    if (!['placed', 'confirmed'].includes(order.status)) {
        throw ApiError.badRequest('Order cannot be cancelled at this stage');
    }

    await order.cancelOrder(reason, 'customer');

    // Refund to wallet if paid
    if (order.payment.status === 'success') {
        await req.user.addWalletTransaction(
            order.pricing.total,
            'credit',
            `Refund for cancelled order ${order.orderId}`,
            order._id
        );
    }

    res.status(200).json({
        success: true,
        message: 'Order cancelled successfully. Refund will be credited to your wallet.'
    });
};

/**
 * Rate order
 * POST /api/orders/:orderId/rate
 */
exports.rateOrder = async (req, res) => {
    const { orderId } = req.params;
    const { overall, food, delivery, packaging, comment } = req.body;

    const order = await Order.findOne({
        $or: [{ _id: orderId }, { orderId }],
        customerId: req.user._id
    });

    if (!order) {
        throw ApiError.notFound('Order not found');
    }

    if (order.status !== 'delivered') {
        throw ApiError.badRequest('You can only rate delivered orders');
    }

    if (order.hasReviewed) {
        throw ApiError.conflict('You have already rated this order');
    }

    order.rating = {
        overall,
        food,
        delivery,
        packaging,
        comment,
        ratedAt: new Date()
    };
    order.hasReviewed = true;

    await order.save();

    // Update homemaker ratings
    for (const homemakerId of order.homemakers) {
        const homemaker = await Homemaker.findById(homemakerId);
        if (homemaker) {
            await homemaker.updateRating(food || overall);
        }
    }

    res.status(200).json({
        success: true,
        message: 'Thank you for your feedback!'
    });
};

/**
 * Reorder (quick repeat)
 * POST /api/orders/:orderId/reorder
 */
exports.reorder = async (req, res) => {
    const { orderId } = req.params;

    const previousOrder = await Order.findOne({
        $or: [{ _id: orderId }, { orderId }],
        customerId: req.user._id
    });

    if (!previousOrder) {
        throw ApiError.notFound('Order not found');
    }

    // Check if all products are still available
    const items = [];
    for (const item of previousOrder.items) {
        const product = await Product.findById(item.productId);
        if (product && product.status === 'active' && !product.isDeleted) {
            items.push({
                productId: item.productId,
                quantity: item.quantity
            });
        }
    }

    if (items.length === 0) {
        throw ApiError.badRequest('None of the items from this order are available');
    }

    res.status(200).json({
        success: true,
        message: 'Items added to cart for reorder',
        data: {
            items,
            unavailableCount: previousOrder.items.length - items.length
        }
    });
};

/**
 * Get tracking info
 * GET /api/orders/:orderId/track
 */
exports.trackOrder = async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
        $or: [{ _id: orderId }, { orderId }],
        customerId: req.user._id
    })
        .populate('delivery.partnerId', 'name phone')
        .select('status statusHistory delivery items');

    if (!order) {
        throw ApiError.notFound('Order not found');
    }

    res.status(200).json({
        success: true,
        data: {
            status: order.status,
            timeline: order.statusHistory,
            delivery: {
                slot: order.delivery.slotDisplay,
                partnerName: order.delivery.partnerName,
                partnerPhone: order.delivery.partnerPhone,
                status: order.delivery.status
            }
        }
    });
};

/**
 * Get available delivery slots
 * GET /api/orders/slots/available
 */
exports.getAvailableSlots = async (req, res) => {
    const slots = [];
    const today = new Date();

    // Generate slots for next 3 days
    for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const dateStr = date.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        slots.push({
            date: date.toISOString().split('T')[0],
            dateDisplay: dateStr,
            morning: {
                slot: 'MORNING',
                display: '6 AM - 8 AM',
                available: true // Would check capacity in production
            },
            evening: {
                slot: 'EVENING',
                display: '5 PM - 7 PM',
                available: true
            }
        });
    }

    res.status(200).json({
        success: true,
        data: { slots }
    });
};
