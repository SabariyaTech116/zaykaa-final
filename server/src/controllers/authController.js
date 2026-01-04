const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService');

/**
 * Auth Controller
 * 
 * OTP-based authentication for Zaykaa
 * Phone is the primary identifier (Indian market standard)
 */

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
exports.sendOtp = async (req, res) => {
    const { phone } = req.body;

    // Generate Secure OTP
    const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
        user = new User({ phone });
    }

    // Check OTP attempts (rate limiting)
    if (user.otp && user.otp.attempts >= 5) {
        const timeSinceLastAttempt = Date.now() - new Date(user.otp.expiresAt).getTime() + 10 * 60 * 1000;
        if (timeSinceLastAttempt < 30 * 60 * 1000) { // 30 min lockout
            throw ApiError.tooManyRequests('Too many OTP attempts. Please try again later.');
        }
    }

    // Hash OTP for Security
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = {
        code: hashedOtp, // Store hash, not plain text
        expiresAt: otpExpiry,
        attempts: (user.otp?.attempts || 0) + 1
    };

    await user.save();

    // 1. Console Log (Always for Dev)
    if (process.env.NODE_ENV === 'development') {
        console.log(`📱 OTP for ${phone}: ${otp}`);
    }

    // 2. Email OTP (If user has email)
    if (user.email) {
        // Run in background to not block response
        emailService.sendOTP(user.email, otp, user.name || 'User').catch(err => console.error('Background Email Error:', err));
    }

    // 3. SMS (TODO: Integrate Twilio/Firebase)
    // await smsService.send(phone, otp);

    res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
            phone,
            expiresIn: '10 minutes',
            // Only in development show OTP in response for easier testing
            ...(process.env.NODE_ENV === 'development' && { otp })
        }
    });
};

/**
 * Verify OTP and login/register
 * POST /api/auth/verify-otp
 */
exports.verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
        throw ApiError.notFound('User not found. Please request a new OTP.');
    }

    if (!user.otp || !user.otp.code) {
        throw ApiError.badRequest('No OTP found. Please request a new OTP.');
    }

    if (new Date() > user.otp.expiresAt) {
        throw ApiError.badRequest('OTP has expired. Please request a new OTP.');
    }

    // Verify Hash
    const isValid = await bcrypt.compare(otp, user.otp.code);

    if (!isValid) {
        user.otp.attempts++;
        await user.save();
        throw ApiError.badRequest('Invalid OTP. Please try again.');
    }

    // OTP verified successfully
    const isNewUser = !user.isPhoneVerified;

    user.isPhoneVerified = true;
    user.otp = undefined; // Clear OTP
    user.lastLogin = new Date();

    // Mark first order status for new users (for sampler offer)
    if (isNewUser) {
        user.isFirstOrder = true;
        user.orderCount = 0;
    }

    await user.save();

    // Generate tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
        success: true,
        message: isNewUser ? 'Registration successful' : 'Login successful',
        data: {
            token,
            refreshToken,
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                role: user.role,
                isNewUser,
                isFirstOrder: user.isFirstOrder,
                wallet: {
                    balance: user.wallet.balance
                }
            }
        }
    });
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select('-otp -__v');

    res.status(200).json({
        success: true,
        data: { user }
    });
};

/**
 * Update profile
 * PATCH /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    // If email is changed, maybe we should verify it? 
    // For now, simpler update. 
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
    });
};

/**
 * Add address
 * POST /api/auth/address
 */
exports.addAddress = async (req, res) => {
    const user = await User.findById(req.user._id);

    const newAddress = req.body;

    // If this is the first address or marked as default, update other addresses
    if (newAddress.isDefault || user.addresses.length === 0) {
        user.addresses.forEach(addr => addr.isDefault = false);
        newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: { addresses: user.addresses }
    });
};

/**
 * Update address
 * PATCH /api/auth/address/:addressId
 */
exports.updateAddress = async (req, res) => {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(addressId);

    if (!address) {
        throw ApiError.notFound('Address not found');
    }

    // Update fields
    Object.assign(address, req.body);

    // Handle default address
    if (req.body.isDefault) {
        user.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: { addresses: user.addresses }
    });
};

/**
 * Delete address
 * DELETE /api/auth/address/:addressId
 */
exports.deleteAddress = async (req, res) => {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(addressId);

    if (!address) {
        throw ApiError.notFound('Address not found');
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If deleted address was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        data: { addresses: user.addresses }
    });
};

/**
 * Logout
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
    // With JWT, logout is handled client-side by removing token
    // For enhanced security, we could maintain a token blacklist in Redis

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};
