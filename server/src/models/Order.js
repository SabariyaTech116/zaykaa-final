const mongoose = require('mongoose');

/**
 * Order Schema - The transaction backbone
 * 
 * Key Features:
 * 1. Slot-based delivery (Morning 6-8AM / Evening 5-7PM)
 * 2. Multi-vendor support with split order handling
 * 3. Appreciation notes ("Less spicy please")
 * 4. Status machine for homemaker workflow
 * 5. Payment tracking with Razorpay integration
 */

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    homemakerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homemaker',
        required: true
    },
    name: String, // Snapshot at order time
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtPurchase: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'cooking', 'packed', 'ready'],
        default: 'pending'
    },
    appreciationNote: String // Per-item note to chef
}, { _id: true });

const orderSchema = new mongoose.Schema({
    // Order ID for display (ZYK-2026010001)
    orderId: {
        type: String,
        unique: true,
        index: true
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Items grouped for multi-vendor handling
    items: [orderItemSchema],

    // Homemakers involved in this order (for quick lookup)
    homemakers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homemaker'
    }],

    // Pricing breakdown
    pricing: {
        subtotal: { type: Number, required: true },
        deliveryFee: { type: Number, default: 0 },
        packagingFee: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountCode: String,
        walletUsed: { type: Number, default: 0 },
        taxes: { type: Number, default: 0 },
        total: { type: Number, required: true }
    },

    // Prepaid discount (5% off as per PRD)
    isPrepaid: { type: Boolean, default: true },
    prepaidDiscount: { type: Number, default: 0 },

    // Delivery Information - Slot-based model
    delivery: {
        address: {
            street: String,
            apartment: String,
            city: String,
            state: String,
            pincode: { type: String, index: true },
            lat: Number,
            long: Number
        },
        slot: {
            type: String,
            enum: ['MORNING', 'EVENING'],
            required: true
        },
        date: {
            type: Date,
            required: true,
            index: true
        },
        slotDisplay: String, // "Tomorrow 6 AM - 8 AM"

        // Community Leader feature (if picking from neighbor)
        isNeighborPickup: { type: Boolean, default: false },
        neighborDetails: {
            name: String,
            phone: String,
            address: String
        },

        // Delivery partner assignment
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        partnerName: String,
        partnerPhone: String,

        // Tracking
        status: {
            type: String,
            enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
            default: 'pending'
        },
        deliveredAt: Date,
        proofOfDelivery: String, // Photo URL

        // OTP for secure delivery
        otp: String
    },

    // Overall Order Status
    status: {
        type: String,
        enum: ['placed', 'confirmed', 'processing', 'ready', 'out_for_delivery',
            'delivered', 'cancelled', 'refunded'],
        default: 'placed',
        index: true
    },

    // Status timeline for tracking
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String
    }],

    // Appreciation Note (global for order)
    appreciationNote: {
        type: String,
        maxlength: 250
    },

    // Payment Information
    payment: {
        method: {
            type: String,
            enum: ['razorpay', 'phonepe', 'upi', 'card', 'netbanking', 'wallet', 'cod'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
            default: 'pending'
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        transactionId: String,
        paidAt: Date,
        refundId: String,
        refundedAt: Date,
        refundAmount: Number
    },

    // Order Type
    orderType: {
        type: String,
        enum: ['regular', 'subscription', 'bulk_b2b', 'sampler'],
        default: 'regular'
    },

    // For B2B orders
    corporateDetails: {
        companyName: String,
        gstNumber: String,
        invoiceRequired: Boolean
    },

    // For subscription orders
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },

    // For sampler/first-order offers
    isSamplerOrder: { type: Boolean, default: false },
    isFirstOrder: { type: Boolean, default: false },

    // Rating & Review
    rating: {
        overall: Number,
        food: Number,
        delivery: Number,
        packaging: Number,
        comment: String,
        ratedAt: Date
    },
    hasReviewed: { type: Boolean, default: false },

    // Cancellation
    cancellation: {
        reason: String,
        cancelledBy: { type: String, enum: ['customer', 'homemaker', 'admin', 'system'] },
        cancelledAt: Date,
        refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] }
    },

    // Support
    supportTicketId: String,
    hasIssue: { type: Boolean, default: false },

    // Metadata
    source: {
        type: String,
        enum: ['web', 'app', 'admin'],
        default: 'web'
    },
    userAgent: String,
    ipAddress: String

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ 'delivery.date': 1, 'delivery.slot': 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'homemakers': 1 });
orderSchema.index({ 'payment.status': 1 });

// Pre-save: Generate order ID
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderId) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.constructor.countDocuments({
            createdAt: {
                $gte: new Date(date.setHours(0, 0, 0, 0)),
                $lt: new Date(date.setHours(23, 59, 59, 999))
            }
        });
        this.orderId = `ZYK-${dateStr}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Pre-save: Add status to history
orderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date()
        });
    }
    next();
});

// Virtual: Get number of homemakers involved
orderSchema.virtual('homemakerCount').get(function () {
    return [...new Set(this.items.map(item => item.homemakerId.toString()))].length;
});

// Virtual: Check if multi-vendor order
orderSchema.virtual('isMultiVendor').get(function () {
    return this.homemakerCount > 1;
});

// Method: Update item status (for homemaker dashboard)
orderSchema.methods.updateItemStatus = async function (itemId, newStatus, updatedBy) {
    const item = this.items.id(itemId);
    if (!item) throw new Error('Item not found');

    item.status = newStatus;

    // Check if all items from same homemaker are ready
    const homemakerItems = this.items.filter(i =>
        i.homemakerId.toString() === item.homemakerId.toString()
    );
    const allReady = homemakerItems.every(i => i.status === 'ready');

    // If all items from all homemakers are ready, update order status
    const allOrderItemsReady = this.items.every(i => i.status === 'ready');
    if (allOrderItemsReady) {
        this.status = 'ready';
        this.statusHistory.push({
            status: 'ready',
            timestamp: new Date(),
            updatedBy
        });
    }

    return this.save();
};

// Method: Cancel order
orderSchema.methods.cancelOrder = async function (reason, cancelledBy) {
    if (['delivered', 'cancelled', 'refunded'].includes(this.status)) {
        throw new Error('Cannot cancel order in current status');
    }

    this.status = 'cancelled';
    this.cancellation = {
        reason,
        cancelledBy,
        cancelledAt: new Date(),
        refundStatus: this.payment.status === 'success' ? 'pending' : null
    };

    return this.save();
};

// Static: Get orders for homemaker dashboard
orderSchema.statics.getHomemakerOrders = function (homemakerId, status, slot, date) {
    const query = {
        'items.homemakerId': homemakerId
    };

    if (status) query.status = status;
    if (slot) query['delivery.slot'] = slot;
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query['delivery.date'] = { $gte: startOfDay, $lte: endOfDay };
    }

    return this.find(query)
        .populate('customerId', 'name phone')
        .sort({ 'delivery.date': 1, 'delivery.slot': 1 });
};

// Static: Get delivery partner orders
orderSchema.statics.getDeliveryPartnerOrders = function (partnerId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.find({
        'delivery.partnerId': partnerId,
        'delivery.date': { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['ready', 'out_for_delivery'] }
    })
        .populate('customerId', 'name phone')
        .sort({ 'delivery.slot': 1 });
};

module.exports = mongoose.model('Order', orderSchema);
