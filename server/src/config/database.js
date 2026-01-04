const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 * 
 * Best Practices from Scale:
 * 1. Connection pooling for concurrent requests
 * 2. Retry logic for transient failures
 * 3. Read preference for read-heavy operations
 * 4. Index creation warnings off in production
 */

const connectDB = async () => {
    try {
        const options = {
            // Connection pool size - adjust based on expected concurrent connections
            maxPoolSize: 10,
            minPoolSize: 2,

            // Timeouts
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,

            // Retry writes for resilience
            retryWrites: true,

            // Write concern for data safety
            w: 'majority',

            // Read preference - can be adjusted for read replicas
            // readPreference: 'secondaryPreferred', // Use for read-heavy with replicas
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
