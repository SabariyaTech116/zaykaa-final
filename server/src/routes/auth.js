const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { validate, authSchemas } = require('../middleware/validation');
const authController = require('../controllers/authController');

/**
 * Auth Routes
 * 
 * OTP-based authentication for Indian market
 * Phone number is primary identifier
 */

// Rate Limiting
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 OTP requests per windowMs
    message: {
        success: false,
        message: 'Too many OTP requests from this IP, please try again after 15 minutes'
    }
});

const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit verify attempts
    message: {
        success: false,
        message: 'Too many verification attempts, please try again later'
    }
});

// Send OTP to phone number
router.post(
    '/send-otp',
    otpLimiter,
    validate(authSchemas.sendOtp),
    asyncHandler(authController.sendOtp)
);

// Verify OTP and login/register
router.post(
    '/verify-otp',
    verifyLimiter,
    validate(authSchemas.verifyOtp),
    asyncHandler(authController.verifyOtp)
);

// Get current user profile
router.get(
    '/me',
    authenticate,
    asyncHandler(authController.getMe)
);

// Update profile
router.patch(
    '/profile',
    authenticate,
    validate(authSchemas.updateProfile),
    asyncHandler(authController.updateProfile)
);

// Add address
router.post(
    '/address',
    authenticate,
    asyncHandler(authController.addAddress)
);

// Update address
router.patch(
    '/address/:addressId',
    authenticate,
    asyncHandler(authController.updateAddress)
);

// Delete address
router.delete(
    '/address/:addressId',
    authenticate,
    asyncHandler(authController.deleteAddress)
);

// Logout (invalidate token - optional with JWT)
router.post(
    '/logout',
    authenticate,
    asyncHandler(authController.logout)
);

module.exports = router;
