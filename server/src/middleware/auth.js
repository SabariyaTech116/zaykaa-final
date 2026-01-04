const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * 
 * JWT-based auth with role checking
 * Designed for RBAC across Customer, Homemaker, Admin, Delivery
 */

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-otp -__v');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

// Optional authentication - continues if no token
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-otp -__v');

        if (user && user.isActive) {
            req.user = user;
        }
    } catch (error) {
        // Silent fail - user will be undefined
    }

    next();
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Homemaker-specific middleware - also attaches homemaker profile
const homemakerAuth = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'homemaker') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Homemaker role required.'
            });
        }

        const Homemaker = require('../models/Homemaker');
        const homemaker = await Homemaker.findOne({ userId: req.user._id });

        if (!homemaker) {
            return res.status(404).json({
                success: false,
                message: 'Homemaker profile not found.'
            });
        }

        req.homemaker = homemaker;
        next();
    } catch (error) {
        console.error('Homemaker auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization error.'
        });
    }
};

// Admin-only middleware
const adminAuth = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '90d' }
    );
};

module.exports = {
    authenticate,
    optionalAuth,
    authorize,
    homemakerAuth,
    adminAuth,
    generateToken,
    generateRefreshToken
};
