const Product = require('../models/Product');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Cart Controller
 * 
 * In-memory cart stored in user document or session
 * For simplicity, we'll use a Cart model or user subdocument
 * 
 * Note: For MVP, cart is stored client-side (localStorage)
 * This controller validates and processes cart operations
 */

// For MVP, we'll use a simple in-memory approach
// In production, consider Redis for session-based carts

/**
 * Get cart
 * GET /api/cart
 */
exports.getCart = async (req, res) => {
    // Cart is stored client-side, this validates products
    const { items = [] } = req.query;

    if (!items.length) {
        return res.status(200).json({
            success: true,
            data: { items: [], summary: { subtotal: 0, total: 0 } }
        });
    }

    // Parse items from query
    let cartItems;
    try {
        cartItems = JSON.parse(items);
    } catch (e) {
        throw ApiError.badRequest('Invalid cart format');
    }

    // Validate and enrich cart items
    const enrichedItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
        const product = await Product.findById(item.productId)
            .populate('homemakerId', 'kitchenName')
            .lean();

        if (product && product.status === 'active') {
            const price = product.discountedPrice || product.price;
            const itemTotal = price * item.quantity;

            enrichedItems.push({
                productId: product._id,
                name: product.name,
                image: product.images[0]?.url,
                price,
                originalPrice: product.price,
                quantity: item.quantity,
                subtotal: itemTotal,
                homemaker: {
                    id: product.homemakerId._id,
                    name: product.homemakerId.kitchenName
                },
                isAvailable: product.isAvailable,
                maxQuantity: product.stockLimitPerDay
            });

            subtotal += itemTotal;
        }
    }

    // Group by homemaker
    const groupedByHomemaker = enrichedItems.reduce((acc, item) => {
        const key = item.homemaker.id.toString();
        if (!acc[key]) {
            acc[key] = {
                homemaker: item.homemaker,
                items: []
            };
        }
        acc[key].items.push(item);
        return acc;
    }, {});

    res.status(200).json({
        success: true,
        data: {
            items: enrichedItems,
            groupedByHomemaker: Object.values(groupedByHomemaker),
            summary: {
                subtotal,
                itemCount: enrichedItems.reduce((sum, i) => sum + i.quantity, 0),
                homemakerCount: Object.keys(groupedByHomemaker).length
            }
        }
    });
};

/**
 * Add item to cart
 * POST /api/cart/add
 */
exports.addToCart = async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId)
        .populate('homemakerId', 'kitchenName isActive isVacationMode')
        .lean();

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    if (product.status !== 'active' || !product.isAvailable) {
        throw ApiError.badRequest('Product is not available');
    }

    if (product.homemakerId.isVacationMode || !product.homemakerId.isActive) {
        throw ApiError.badRequest('This kitchen is currently not accepting orders');
    }

    if (quantity > product.stockLimitPerDay) {
        throw ApiError.badRequest(`Maximum ${product.stockLimitPerDay} units per order`);
    }

    const price = product.discountedPrice || product.price;

    res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: {
            item: {
                productId: product._id,
                name: product.name,
                image: product.images[0]?.url,
                price,
                quantity,
                homemaker: {
                    id: product.homemakerId._id,
                    name: product.homemakerId.kitchenName
                }
            }
        }
    });
};

/**
 * Update item quantity
 * PATCH /api/cart/item/:itemId
 */
exports.updateQuantity = async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
        throw ApiError.badRequest('Quantity must be at least 1');
    }

    const product = await Product.findById(itemId);

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    if (quantity > product.stockLimitPerDay) {
        throw ApiError.badRequest(`Maximum ${product.stockLimitPerDay} units per order`);
    }

    res.status(200).json({
        success: true,
        message: 'Quantity updated',
        data: { productId: itemId, quantity }
    });
};

/**
 * Remove item from cart
 * DELETE /api/cart/item/:itemId
 */
exports.removeItem = async (req, res) => {
    const { itemId } = req.params;

    res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: { productId: itemId }
    });
};

/**
 * Clear cart
 * DELETE /api/cart/clear
 */
exports.clearCart = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Cart cleared'
    });
};

/**
 * Apply discount code
 * POST /api/cart/discount
 */
exports.applyDiscount = async (req, res) => {
    const { code, subtotal } = req.body;

    // Mock discount codes for MVP
    const discounts = {
        'WELCOME10': { type: 'percent', value: 10, minOrder: 200 },
        'FLAT50': { type: 'flat', value: 50, minOrder: 500 },
        'FIRST20': { type: 'percent', value: 20, minOrder: 300, firstOrderOnly: true }
    };

    const discount = discounts[code.toUpperCase()];

    if (!discount) {
        throw ApiError.badRequest('Invalid discount code');
    }

    if (subtotal < discount.minOrder) {
        throw ApiError.badRequest(`Minimum order of ₹${discount.minOrder} required for this code`);
    }

    if (discount.firstOrderOnly && !req.user.isFirstOrder) {
        throw ApiError.badRequest('This code is only valid for first orders');
    }

    let discountAmount;
    if (discount.type === 'percent') {
        discountAmount = Math.round(subtotal * (discount.value / 100));
    } else {
        discountAmount = discount.value;
    }

    res.status(200).json({
        success: true,
        message: 'Discount applied',
        data: {
            code,
            discountAmount,
            discountType: discount.type,
            discountValue: discount.value
        }
    });
};

/**
 * Get cart summary
 * GET /api/cart/summary
 */
exports.getCartSummary = async (req, res) => {
    const { subtotal = 0, discountCode, isNeighborPickup = false } = req.query;

    const sub = Number(subtotal);
    const deliveryFee = isNeighborPickup === 'true' ? 0 : 25;
    const packagingFee = 10;

    // 5% prepaid discount
    const prepaidDiscount = Math.round(sub * 0.05);

    let codeDiscount = 0;
    if (discountCode) {
        // Apply discount logic here
    }

    const total = sub + deliveryFee + packagingFee - prepaidDiscount - codeDiscount;

    res.status(200).json({
        success: true,
        data: {
            subtotal: sub,
            deliveryFee,
            packagingFee,
            prepaidDiscount,
            codeDiscount,
            total,
            savings: prepaidDiscount + codeDiscount
        }
    });
};

/**
 * Validate cart before checkout
 * POST /api/cart/validate
 */
exports.validateCart = async (req, res) => {
    const { items, deliverySlot, deliveryDate } = req.body;

    const issues = [];
    const validItems = [];

    for (const item of items) {
        const product = await Product.findById(item.productId)
            .populate('homemakerId', 'isActive isVacationMode capacity')
            .lean();

        if (!product) {
            issues.push({ productId: item.productId, issue: 'Product not found' });
            continue;
        }

        if (product.status !== 'active' || !product.isAvailable) {
            issues.push({ productId: item.productId, name: product.name, issue: 'Product unavailable' });
            continue;
        }

        if (product.homemakerId.isVacationMode) {
            issues.push({ productId: item.productId, name: product.name, issue: 'Kitchen on vacation' });
            continue;
        }

        // Check stock
        const stockKey = deliverySlot.toLowerCase();
        if (product.currentStock[stockKey] + item.quantity > product.stockLimitPerDay) {
            issues.push({
                productId: item.productId,
                name: product.name,
                issue: `Only ${product.stockLimitPerDay - product.currentStock[stockKey]} left for this slot`
            });
            continue;
        }

        validItems.push(item);
    }

    res.status(200).json({
        success: true,
        data: {
            isValid: issues.length === 0,
            validItems,
            issues
        }
    });
};
