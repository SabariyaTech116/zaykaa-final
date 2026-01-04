const mongoose = require('mongoose');

/**
 * Product Schema - Traditional snacks with modern attributes
 * 
 * Designed for:
 * 1. SEO - Rich attributes for search indexing
 * 2. Discovery - Tags, categories, dietary preferences
 * 3. Trust - FSSAI display, ingredient transparency
 * 4. Flexibility - Dynamic stock limits per day
 */

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    images: [String],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const productSchema = new mongoose.Schema({
    homemakerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homemaker',
        required: true,
        index: true
    },

    // Basic Info
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        index: 'text' // Text search
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    shortDescription: {
        type: String,
        maxlength: 150 // For cards/previews
    },

    // Story - The "Why" behind the recipe
    story: {
        type: String,
        maxlength: 500 // "This recipe has been in my family for 3 generations..."
    },

    // Pricing
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountedPrice: {
        type: Number,
        min: 0
    },
    unit: {
        type: String,
        default: 'piece', // piece, kg, 250g, pack
        enum: ['piece', 'kg', '500g', '250g', '100g', 'pack', 'box', 'dozen']
    },
    weight: {
        value: Number,
        unit: { type: String, enum: ['g', 'kg', 'ml', 'l'] }
    },

    // Category & Discovery
    category: {
        type: String,
        required: true,
        enum: ['Sweets', 'Savory', 'Pickles', 'Chutneys', 'Snacks', 'Breakfast',
            'Main Course', 'Desserts', 'Beverages', 'Festival Specials', 'Other'],
        index: true
    },
    subcategory: String,

    // Regional Identity - Key for nostalgia marketing
    region: {
        type: String,
        enum: ['Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra',
            'Gujarat', 'Rajasthan', 'Punjab', 'Bengal', 'Odisha', 'North Indian',
            'South Indian', 'Pan Indian', 'Other'],
        index: true
    },

    // Dietary Preferences - Critical for health-conscious consumers
    dietary: {
        isVegetarian: { type: Boolean, default: true },
        isVegan: { type: Boolean, default: false },
        isEggless: { type: Boolean, default: true },
        isGlutenFree: { type: Boolean, default: false },
        isJainFriendly: { type: Boolean, default: false }, // No onion/garlic
        isNutFree: { type: Boolean, default: false },
        isDairyFree: { type: Boolean, default: false },
        isOilFree: { type: Boolean, default: false },
        isSugarFree: { type: Boolean, default: false }
    },

    // Tags for search & filtering
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],

    // Search-friendly attributes
    searchKeywords: [{
        type: String,
        lowercase: true
    }],

    // Ingredients - Transparency builds trust
    ingredients: [{
        name: { type: String, required: true },
        isAllergen: { type: Boolean, default: false }
    }],
    allergenWarning: String, // "Contains: Nuts, Dairy"

    // Nutritional Info (optional but valuable)
    nutrition: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number,
        servingSize: String
    },

    // Shelf Life & Storage
    shelfLife: {
        days: { type: Number, required: true },
        instructions: String // "Store in airtight container"
    },
    storageType: {
        type: String,
        enum: ['room_temp', 'refrigerated', 'frozen'],
        default: 'room_temp'
    },

    // Images - High quality is non-negotiable
    images: [{
        url: { type: String, required: true },
        alt: String,
        isPrimary: { type: Boolean, default: false }
    }],
    video: {
        url: String,
        thumbnail: String
    },

    // Stock & Availability
    stockLimitPerDay: {
        type: Number,
        default: 20,
        min: 1
    },
    currentStock: {
        morning: { type: Number, default: 0 },
        evening: { type: Number, default: 0 }
    },
    isAvailable: { type: Boolean, default: true },
    availableSlots: {
        morning: { type: Boolean, default: true },
        evening: { type: Boolean, default: true }
    },

    // Preparation Time
    preparationTime: {
        type: Number, // in hours
        default: 24 // Made fresh, ready next day
    },

    // Ratings & Reviews
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    reviews: [reviewSchema],

    // Order Statistics
    stats: {
        totalOrders: { type: Number, default: 0 },
        totalQuantitySold: { type: Number, default: 0 },
        repeatOrderRate: { type: Number, default: 0 }, // percentage
        returnRate: { type: Number, default: 0 } // for QC flagging
    },

    // SEO & Marketing
    seo: {
        metaTitle: String,
        metaDescription: String
    },

    // Featured/Promoted
    isFeatured: { type: Boolean, default: false },
    featuredIn: [String], // ['Sunday Special', 'Festival Combos']

    // Status
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'active', 'inactive', 'out_of_stock'],
        default: 'pending_approval'
    },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for fast querying
productSchema.index({ name: 'text', description: 'text', 'searchKeywords': 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ 'dietary.isVegetarian': 1 });
productSchema.index({ region: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'rating.average': -1, 'stats.totalOrders': -1 });

// Virtual: Calculate discount percentage
productSchema.virtual('discountPercent').get(function () {
    if (this.discountedPrice && this.discountedPrice < this.price) {
        return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
    }
    return 0;
});

// Virtual: Get effective price
productSchema.virtual('effectivePrice').get(function () {
    return this.discountedPrice && this.discountedPrice < this.price
        ? this.discountedPrice
        : this.price;
});

// Virtual: Check if in stock for a slot
productSchema.virtual('isInStock').get(function () {
    return this.isAvailable &&
        this.status === 'active' &&
        (this.currentStock.morning < this.stockLimitPerDay ||
            this.currentStock.evening < this.stockLimitPerDay);
});

// Pre-save hook to generate slug
productSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') +
            '-' + this._id.toString().slice(-6);
    }
    next();
});

// Method: Reset daily stock
productSchema.methods.resetDailyStock = function () {
    this.currentStock.morning = 0;
    this.currentStock.evening = 0;
    return this.save();
};

// Method: Add review and update rating
productSchema.methods.addReview = async function (userId, rating, comment, images = []) {
    this.reviews.push({
        userId,
        rating,
        comment,
        images,
        isVerifiedPurchase: true
    });

    // Recalculate average
    const totalRating = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.rating.count = this.reviews.length;

    return this.save();
};

// Static: Search products with filters
productSchema.statics.search = async function (query, filters = {}) {
    const searchQuery = {};

    if (query) {
        searchQuery.$text = { $search: query };
    }

    if (filters.category) searchQuery.category = filters.category;
    if (filters.region) searchQuery.region = filters.region;
    if (filters.isVegetarian !== undefined) searchQuery['dietary.isVegetarian'] = filters.isVegetarian;
    if (filters.isVegan) searchQuery['dietary.isVegan'] = true;
    if (filters.isGlutenFree) searchQuery['dietary.isGlutenFree'] = true;
    if (filters.priceMin || filters.priceMax) {
        searchQuery.price = {};
        if (filters.priceMin) searchQuery.price.$gte = filters.priceMin;
        if (filters.priceMax) searchQuery.price.$lte = filters.priceMax;
    }

    searchQuery.status = 'active';
    searchQuery.isDeleted = false;

    return this.find(searchQuery)
        .populate('homemakerId', 'kitchenName rating location')
        .sort(filters.sortBy || { 'rating.average': -1 })
        .limit(filters.limit || 20)
        .skip(filters.skip || 0);
};

module.exports = mongoose.model('Product', productSchema);
