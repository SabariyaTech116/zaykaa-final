require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const homemakerRoutes = require('./routes/homemakers');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

const app = express();

/**
 * ZAYKAA API Server
 * 
 * Production-ready Express server with:
 * - Security headers (Helmet)
 * - Rate limiting
 * - CORS configuration
 * - Request logging
 * - Centralized error handling
 */

// Connect to MongoDB
connectDB();

// ===================
// SECURITY MIDDLEWARE
// ===================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - prevent DDoS and brute force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 OTP requests per 15 minutes
    message: {
        success: false,
        message: 'Too many OTP requests. Please wait before trying again.'
    }
});
app.use('/api/auth/send-otp', authLimiter);

// ===================
// PARSING MIDDLEWARE
// ===================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ===================
// HEALTH CHECK
// ===================

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Zaykaa API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// ===================
// API ROUTES
// ===================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/homemakers', homemakerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// TODO: Add more routes
// app.use('/api/admin', adminRoutes);
// app.use('/api/delivery', deliveryRoutes);
// app.use('/api/payments', paymentRoutes);

// ===================
// ERROR HANDLING
// ===================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===================
// START SERVER
// ===================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🍛 ZAYKAA API Server                            ║
  ║   Empowering Homemakers, One Order at a Time      ║
  ║                                                   ║
  ╠═══════════════════════════════════════════════════╣
  ║   🚀 Server:     http://localhost:${PORT}            ║
  ║   📊 Environment: ${process.env.NODE_ENV || 'development'}                   ║
  ║   ⏰ Started:    ${new Date().toLocaleTimeString()}                       ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

module.exports = app;
