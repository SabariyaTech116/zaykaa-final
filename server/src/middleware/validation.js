const Joi = require('joi');

/**
 * Request Validation Middleware
 * 
 * Using Joi for robust input validation
 * Prevents injection attacks and ensures data integrity
 */

// Validation middleware factory
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, '')
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        req[property] = value;
        next();
    };
};

// Common validation schemas
const schemas = {
    // Phone number (Indian)
    phone: Joi.string()
        .pattern(/^[6-9]\d{9}$/)
        .message('Please enter a valid 10-digit Indian mobile number'),

    // OTP
    otp: Joi.string()
        .length(6)
        .pattern(/^\d+$/)
        .message('OTP must be 6 digits'),

    // MongoDB ObjectId
    objectId: Joi.string()
        .pattern(/^[a-fA-F0-9]{24}$/)
        .message('Invalid ID format'),

    // Pagination
    pagination: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    },

    // Address
    address: Joi.object({
        label: Joi.string().valid('home', 'work', 'other').default('home'),
        street: Joi.string().required().max(200),
        apartment: Joi.string().max(100),
        city: Joi.string().required().max(100),
        state: Joi.string().required().max(100),
        pincode: Joi.string().required().pattern(/^\d{6}$/).message('Pincode must be 6 digits'),
        lat: Joi.number().min(-90).max(90),
        long: Joi.number().min(-180).max(180),
        isDefault: Joi.boolean().default(false)
    })
};

// Auth validation schemas
const authSchemas = {
    sendOtp: Joi.object({
        phone: schemas.phone.required()
    }),

    verifyOtp: Joi.object({
        phone: schemas.phone.required(),
        otp: schemas.otp.required()
    }),

    updateProfile: Joi.object({
        name: Joi.string().max(100).trim(),
        email: Joi.string().email().lowercase()
    })
};

// Product validation schemas
const productSchemas = {
    create: Joi.object({
        name: Joi.string().required().max(100).trim(),
        description: Joi.string().required().max(1000),
        shortDescription: Joi.string().max(150),
        story: Joi.string().max(500),
        price: Joi.number().required().min(0),
        discountedPrice: Joi.number().min(0),
        unit: Joi.string().valid('piece', 'kg', '500g', '250g', '100g', 'pack', 'box', 'dozen'),
        category: Joi.string().required().valid(
            'Sweets', 'Savory', 'Pickles', 'Chutneys', 'Snacks', 'Breakfast',
            'Main Course', 'Desserts', 'Beverages', 'Festival Specials', 'Other'
        ),
        region: Joi.string().valid(
            'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra',
            'Gujarat', 'Rajasthan', 'Punjab', 'Bengal', 'Odisha', 'North Indian',
            'South Indian', 'Pan Indian', 'Other'
        ),
        dietary: Joi.object({
            isVegetarian: Joi.boolean(),
            isVegan: Joi.boolean(),
            isEggless: Joi.boolean(),
            isGlutenFree: Joi.boolean(),
            isJainFriendly: Joi.boolean(),
            isNutFree: Joi.boolean(),
            isDairyFree: Joi.boolean()
        }),
        tags: Joi.array().items(Joi.string().max(50)).max(10),
        ingredients: Joi.array().items(Joi.object({
            name: Joi.string().required().max(100),
            isAllergen: Joi.boolean()
        })),
        shelfLife: Joi.object({
            days: Joi.number().required().min(1),
            instructions: Joi.string().max(200)
        }).required(),
        stockLimitPerDay: Joi.number().min(1).default(20)
    }),

    search: Joi.object({
        q: Joi.string().max(100),
        category: Joi.string(),
        region: Joi.string(),
        isVegetarian: Joi.boolean(),
        isVegan: Joi.boolean(),
        minPrice: Joi.number().min(0),
        maxPrice: Joi.number().min(0),
        sortBy: Joi.string().valid('price_asc', 'price_desc', 'rating', 'newest'),
        ...schemas.pagination
    })
};

// Order validation schemas
const orderSchemas = {
    create: Joi.object({
        items: Joi.array().items(Joi.object({
            productId: schemas.objectId.required(),
            quantity: Joi.number().integer().min(1).required(),
            appreciationNote: Joi.string().max(250)
        })).min(1).required(),

        deliveryAddress: schemas.address.required(),

        deliverySlot: Joi.string().valid('MORNING', 'EVENING').required(),
        deliveryDate: Joi.date().iso().min('now').required(),

        appreciationNote: Joi.string().max(250),

        paymentMethod: Joi.string().valid(
            'razorpay', 'upi', 'card', 'netbanking', 'wallet', 'cod'
        ).required(),

        useWallet: Joi.boolean().default(false),
        discountCode: Joi.string().max(20),

        isNeighborPickup: Joi.boolean(),
        neighborDetails: Joi.object({
            name: Joi.string().max(100),
            phone: schemas.phone,
            address: Joi.string().max(200)
        })
    }),

    updateStatus: Joi.object({
        status: Joi.string().valid(
            'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'
        ).required(),
        note: Joi.string().max(200)
    })
};

// Homemaker validation schemas
const homemakerSchemas = {
    register: Joi.object({
        kitchenName: Joi.string().required().max(100).trim(),
        bio: Joi.string().max(500),
        specialty: Joi.array().items(Joi.string().max(50)).max(5),
        famousFor: Joi.string().max(100),
        cuisineTypes: Joi.array().items(Joi.string().valid(
            'South Indian', 'North Indian', 'Gujarati', 'Bengali', 'Maharashtrian',
            'Rajasthani', 'Kerala', 'Andhra', 'Street Food', 'Sweets', 'Pickles', 'Other'
        )),
        location: Joi.object({
            address: Joi.string().max(200),
            city: Joi.string().required().max(100),
            state: Joi.string().required().max(100),
            pincode: Joi.string().required().pattern(/^\d{6}$/),
            lat: Joi.number(),
            long: Joi.number()
        }).required(),
        capacity: Joi.object({
            morningSlot: Joi.number().min(1).max(100).default(20),
            eveningSlot: Joi.number().min(1).max(100).default(20)
        })
    }),

    updateCapacity: Joi.object({
        morningSlot: Joi.number().min(0).max(100),
        eveningSlot: Joi.number().min(0).max(100)
    })
};

module.exports = {
    validate,
    schemas,
    authSchemas,
    productSchemas,
    orderSchemas,
    homemakerSchemas
};
