const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    // Authentication Fields
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false, // Don't include password by default in queries
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // User Role
    role: {
      type: String,
      enum: ['buyer', 'vendor', 'admin'],
      default: 'buyer',
    },

    // Basic Profile Information
    firstName: {
      type: String,
      required: [true, 'Please provide your first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide your last name'],
      trim: true,
    },
    phone: {
      type: String,
      validate: {
        validator: function (val) {
          return !val || validator.isMobilePhone(val);
        },
        message: 'Please provide a valid phone number',
      },
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
    },

    // Vendor Information (Only for vendors)
    vendor: {
      businessName: {
        type: String,
        sparse: true,
      },
      businessRegistration: {
        type: String,
        sparse: true,
      },
      registrationNumber: {
        type: String,
        unique: true,
        sparse: true,
      },
      businessType: {
        type: String,
        enum: ['individual', 'partnership', 'company', 'corporation'],
        default: 'individual',
      },
      taxId: {
        type: String,
        sparse: true,
      },
      businessLicense: {
        type: String,
        sparse: true,
      },
      yearsInBusiness: {
        type: Number,
        min: 0,
      },
      websiteUrl: {
        type: String,
        validate: {
          validator: function (val) {
            return !val || validator.isURL(val);
          },
          message: 'Please provide a valid website URL',
        },
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
      verificationDate: Date,
      verificationDocuments: [
        {
          documentType: String, // e.g., 'business_license', 'tax_id', 'registration'
          documentUrl: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      categories: [
        {
          type: String, // Product categories vendor sells
        },
      ],
      commissionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 15,
      },
      bankAccount: {
        bankName: String,
        accountHolderName: String,
        accountNumber: String,
        routingNumber: String,
        accountType: {
          type: String,
          enum: ['checking', 'savings'],
        },
      },
    },

    // Address Information
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      isDefault: {
        type: Boolean,
        default: false,
      },
    },

    // Shipping Addresses (for buyers)
    shippingAddresses: [
      {
        label: {
          type: String,
          enum: ['home', 'work', 'other'],
          default: 'home',
        },
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        phone: String,
        isDefault: Boolean,
      },
    ],

    // Account Settings
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    activityLog: [
      {
        action: String,
        description: String,
        ipAddress: String,
        userAgent: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Preferences
    preferences: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: true,
      },
      orderNotifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de'],
      },
      currency: {
        type: String,
        default: 'USD',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'deleted', 'archived'],
      default: 'active',
    },
    suspensionReason: String,
    suspensionDate: Date,
    deletedAt: Date,

    // Statistics
    stats: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
      productsSold: {
        type: Number,
        default: 0,
      },
      totalSalesRevenue: {
        type: Number,
        default: 0,
      },
    },

    // Wishlist and Favorites
    favoriteProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    favoriteVendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'vendor.verificationStatus': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password middleware
userSchema.pre('save', async function (next) {
  // Only hash if password has been modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Delete passwordConfirm field after hashing
    this.passwordConfirm = undefined;

    next();
  } catch (error) {
    next(error);
  }
});

// Update passwordChangedAt on save (if password was modified)
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure JWT is issued after password change
  next();
});

// Update updatedAt timestamp on every save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after JWT issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = require('crypto').randomBytes(32).toString('hex');

  // Hash token before saving to database
  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = require('crypto').randomBytes(32).toString('hex');

  this.emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Instance method to log activity
userSchema.methods.logActivity = function (action, description, ipAddress, userAgent) {
  this.activityLog.push({
    action,
    description,
    ipAddress,
    userAgent,
    timestamp: new Date(),
  });

  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.twoFactorSecret;
  delete userObject.activityLog;

  return userObject;
};

// Query middleware to exclude deleted users by default
userSchema.pre(/^find/, function (next) {
  if (!this.options._recursed) {
    this.find({ accountStatus: { $ne: 'deleted' } });
  }
  next();
});

// Query middleware to exclude inactive users (optional)
userSchema.pre(/^find/, function (next) {
  if (this.options.includeInactive !== true) {
    this.find({ isActive: true });
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
