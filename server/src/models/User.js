const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema - Core user model supporting multiple roles
 * Designed for RBAC: Customer, Homemaker, Admin, Delivery Partner
 * 
 * Philosophy: Every homemaker is first a user, then elevated to homemaker role
 * This empowers them - they're not just "vendors", they're valued community members
 */

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  street: { type: String, required: true },
  apartment: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true, index: true },
  lat: { type: Number },
  long: { type: Number },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v); // Indian mobile number validation
      },
      message: 'Please enter a valid 10-digit Indian mobile number'
    }
  },
  email: {
    type: String,
    lowercase: true,
    sparse: true,
    index: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  avatar: String,
  
  // Role-Based Access Control
  role: {
    type: String,
    enum: ['customer', 'homemaker', 'admin', 'delivery', 'corporate'],
    default: 'customer'
  },
  
  // For Corporate B2B users
  gstDetails: {
    gstNumber: String,
    companyName: String,
    billingAddress: addressSchema
  },
  
  addresses: [addressSchema],
  
  // Wallet for quick checkout & refunds
  wallet: {
    balance: { type: Number, default: 0, min: 0 },
    transactions: [{
      amount: Number,
      type: { type: String, enum: ['credit', 'debit'] },
      description: String,
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  
  // For new user welcome offers
  orderCount: { type: Number, default: 0 },
  isFirstOrder: { type: Boolean, default: true },
  
  // Subscription status for "Monthly Munch Box"
  subscription: {
    isActive: { type: Boolean, default: false },
    plan: String,
    nextDelivery: Date,
    preferences: [String] // e.g., ['Vegan', 'South Indian']
  },
  
  // OTP & Auth
  otp: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 }
  },
  
  // Account status
  isActive: { type: Boolean, default: true },
  isPhoneVerified: { type: Boolean, default: false },
  lastLogin: Date,
  
  // For delivery partners
  deliveryDetails: {
    vehicleType: String,
    vehicleNumber: String,
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      lat: Number,
      long: Number,
      updatedAt: Date
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance at scale
userSchema.index({ 'addresses.pincode': 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.name || `User ${this.phone.slice(-4)}`;
});

// Method to add wallet transaction
userSchema.methods.addWalletTransaction = async function(amount, type, description, orderId = null) {
  if (type === 'debit' && this.wallet.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  
  this.wallet.transactions.push({ amount, type, description, orderId });
  this.wallet.balance += type === 'credit' ? amount : -amount;
  
  return this.save();
};

// Method to get default address
userSchema.methods.getDefaultAddress = function() {
  const defaultAddr = this.addresses.find(addr => addr.isDefault);
  return defaultAddr || this.addresses[0] || null;
};

// Static method to find users by pincode (for logistics grouping)
userSchema.statics.findByPincode = function(pincode) {
  return this.find({ 'addresses.pincode': pincode, isActive: true });
};

module.exports = mongoose.model('User', userSchema);
