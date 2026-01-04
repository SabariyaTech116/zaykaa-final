const mongoose = require('mongoose');

/**
 * Homemaker Schema - The heart of Zaykaa
 * 
 * Philosophy: Every homemaker is an entrepreneur. This model is designed to:
 * 1. Celebrate their identity with storytelling (bio, video, specialty)
 * 2. Give them complete control (capacity limits, vacation mode)
 * 3. Provide transparency (earnings, ratings breakdown)
 * 4. Ensure compliance (FSSAI verification)
 * 
 * "Empowering 10,000 homemakers to earn ₹15,000/month from their kitchen"
 */

const earningsSchema = new mongoose.Schema({
    period: { type: String, required: true }, // '2026-01', '2026-W01'
    amount: { type: Number, default: 0 },
    ordersCompleted: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    paidOut: { type: Boolean, default: false },
    paidOutDate: Date,
    transactionId: String
}, { _id: true });

const homemakerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Identity & Storytelling - The "Nani Factor"
    kitchenName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    profileImage: String,
    coverImage: String,

    // Video Stories - Trust building feature
    videoStory: {
        url: String,
        thumbnail: String,
        uploadedAt: Date
    },

    // What they're famous for
    specialty: [{
        type: String,
        trim: true
    }],
    famousFor: {
        type: String,
        maxlength: 100 // e.g., "Grandmother's recipe Ariselu"
    },

    // Categories they serve
    cuisineTypes: [{
        type: String,
        enum: ['South Indian', 'North Indian', 'Gujarati', 'Bengali', 'Maharashtrian',
            'Rajasthani', 'Kerala', 'Andhra', 'Street Food', 'Sweets', 'Pickles', 'Other']
    }],

    // Location for hyperlocal matching
    location: {
        address: String,
        city: { type: String, required: true, index: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true, index: true },
        coordinates: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: [Number] // [longitude, latitude]
        },
        serviceRadius: { type: Number, default: 10 } // km
    },

    // Slot-based delivery capacity - Key differentiator from Swiggy/Zomato
    capacity: {
        morningSlot: { type: Number, default: 20 },  // Max orders for 6AM-8AM
        eveningSlot: { type: Number, default: 20 },  // Max orders for 5PM-7PM
        currentMorningOrders: { type: Number, default: 0 },
        currentEveningOrders: { type: Number, default: 0 }
    },

    // Working days
    workingDays: {
        monday: { type: Boolean, default: true },
        tuesday: { type: Boolean, default: true },
        wednesday: { type: Boolean, default: true },
        thursday: { type: Boolean, default: true },
        friday: { type: Boolean, default: true },
        saturday: { type: Boolean, default: true },
        sunday: { type: Boolean, default: false }
    },

    // Ratings & Trust Signals
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 },
        breakdown: {
            five: { type: Number, default: 0 },
            four: { type: Number, default: 0 },
            three: { type: Number, default: 0 },
            two: { type: Number, default: 0 },
            one: { type: Number, default: 0 }
        }
    },

    // Hygiene & Quality - Critical for trust
    hygieneRating: {
        score: { type: Number, default: 0, min: 0, max: 100 },
        lastAuditDate: Date,
        certifications: [{
            name: String,
            expiryDate: Date
        }]
    },

    // FSSAI Compliance - Mandatory
    fssai: {
        licenseNumber: { type: String },
        licenseType: { type: String, enum: ['basic', 'state', 'central'] },
        validTill: Date,
        documentUrl: String,
        isVerified: { type: Boolean, default: false },
        verifiedAt: Date,
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },

    // ID Proof for KYC
    kyc: {
        documentType: { type: String, enum: ['aadhaar', 'pan', 'voter_id'] },
        documentNumber: String,
        documentUrl: String,
        isVerified: { type: Boolean, default: false }
    },

    // Bank Details for Payout
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        upiId: String,
        isVerified: { type: Boolean, default: false }
    },

    // Earnings Tracking - Transparency is empowerment
    totalEarnings: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    earningsHistory: [earningsSchema],

    // Order Statistics
    stats: {
        totalOrders: { type: Number, default: 0 },
        completedOrders: { type: Number, default: 0 },
        cancelledOrders: { type: Number, default: 0 },
        repeatCustomers: { type: Number, default: 0 }
    },

    // Status Controls
    isActive: { type: Boolean, default: false }, // Becomes true after verification
    isVacationMode: { type: Boolean, default: false },
    vacationTill: Date,

    // Verification workflow
    onboardingStatus: {
        type: String,
        enum: ['pending', 'documents_submitted', 'under_review', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: String,

    // Commission rate (can be personalized for top performers)
    commissionRate: { type: Number, default: 15, min: 0, max: 50 }, // percentage

    // Featured/Promoted status
    isFeatured: { type: Boolean, default: false },
    featuredTill: Date,

    // Badges/Achievements - Gamification for motivation
    badges: [{
        name: String,
        earnedAt: Date,
        icon: String
    }]

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Geospatial index for location-based search
homemakerSchema.index({ 'location.coordinates': '2dsphere' });
homemakerSchema.index({ 'location.city': 1, isActive: 1 });
homemakerSchema.index({ onboardingStatus: 1 });
homemakerSchema.index({ rating: -1 });

// Virtual: Check if accepting orders for morning slot
homemakerSchema.virtual('canAcceptMorningOrders').get(function () {
    return this.isActive &&
        !this.isVacationMode &&
        this.capacity.currentMorningOrders < this.capacity.morningSlot;
});

// Virtual: Check if accepting orders for evening slot
homemakerSchema.virtual('canAcceptEveningOrders').get(function () {
    return this.isActive &&
        !this.isVacationMode &&
        this.capacity.currentEveningOrders < this.capacity.eveningSlot;
});

// Method: Update rating when new review comes in
homemakerSchema.methods.updateRating = function (newRating) {
    const breakdown = this.rating.breakdown;
    const ratingKey = ['one', 'two', 'three', 'four', 'five'][newRating - 1];
    breakdown[ratingKey]++;

    this.rating.count++;

    // Recalculate average
    const total = breakdown.one * 1 + breakdown.two * 2 + breakdown.three * 3 +
        breakdown.four * 4 + breakdown.five * 5;
    this.rating.average = Math.round((total / this.rating.count) * 10) / 10;

    return this.save();
};

// Method: Reset daily capacity (called by cron job at midnight)
homemakerSchema.methods.resetDailyCapacity = function () {
    this.capacity.currentMorningOrders = 0;
    this.capacity.currentEveningOrders = 0;
    return this.save();
};

// Static: Find nearby homemakers
homemakerSchema.statics.findNearby = function (coordinates, maxDistance = 10000) {
    return this.find({
        'location.coordinates': {
            $near: {
                $geometry: { type: 'Point', coordinates },
                $maxDistance: maxDistance // meters
            }
        },
        isActive: true,
        isVacationMode: false
    }).populate('userId', 'name phone avatar');
};

// Static: Get top rated homemakers in a city
homemakerSchema.statics.getTopRated = function (city, limit = 10) {
    return this.find({
        'location.city': city,
        isActive: true,
        'rating.count': { $gte: 5 } // Minimum 5 reviews
    })
        .sort({ 'rating.average': -1 })
        .limit(limit)
        .populate('userId', 'name avatar');
};

module.exports = mongoose.model('Homemaker', homemakerSchema);
