const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  // Basic Information
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Professional Information
  role: {
    type: String,
    required: true,
    enum: ['developer', 'designer', 'marketing', 'sales', 'hr', 'management', 'other']
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  expertise: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  
  // Social Media & Network
  socialNetworks: {
    linkedin: {
      profileUrl: String,
      profileId: String,
      accessToken: String,
      refreshToken: String,        // NEW: For OAuth 2.0 token refresh
      tokenExpiry: Date,          // NEW: Token expiration timestamp
      connections: Number,
      followers: Number,
      isConnected: { type: Boolean, default: false },
      lastSync: { type: Date, default: Date.now },  // NEW: Last profile sync
      permissions: [String],      // NEW: Granted OAuth permissions
      networkStats: {             // NEW: Network metrics
        connections: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now }
      }
    },
    twitter: {
      username: String,
      followers: Number,
      isConnected: { type: Boolean, default: false }
    },
    facebook: {
      profileUrl: String,
      friends: Number,
      isConnected: { type: Boolean, default: false }
    }
  },
  
  // Advocacy & Gamification
  advocacyProfile: {
    isActive: { type: Boolean, default: true },
    joinDate: { type: Date, default: Date.now },
    totalPoints: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    achievements: [{
      type: String,
      earnedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Content Preferences
  contentPreferences: {
    categories: [{
      type: String,
      enum: ['tech', 'business', 'company-news', 'job-openings', 'thought-leadership', 'events']
    }],
    platforms: [{
      type: String,
      enum: ['linkedin', 'twitter', 'facebook', 'instagram']
    }],
    postingFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'as-needed'],
      default: 'weekly'
    }
  },
  
  // Performance Metrics
  metrics: {
    totalShares: { type: Number, default: 0 },
    totalEngagements: { type: Number, default: 0 },
    totalReach: { type: Number, default: 0 },
    successfulReferrals: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  
  // Settings & Preferences
  settings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    autoShare: { type: Boolean, default: false },
    privacyLevel: {
      type: String,
      enum: ['public', 'team-only', 'private'],
      default: 'team-only'
    }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for total influence score
employeeSchema.virtual('influenceScore').get(function() {
  const linkedinScore = (this.socialNetworks.linkedin.connections || 0) * 0.5;
  const twitterScore = (this.socialNetworks.twitter.followers || 0) * 0.3;
  const advocacyScore = this.advocacyProfile.totalPoints * 0.2;
  return Math.round(linkedinScore + twitterScore + advocacyScore);
});

// Pre-save middleware to hash password
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add points
employeeSchema.methods.addPoints = function(points, reason) {
  this.advocacyProfile.totalPoints += points;
  this.metrics.lastActivity = new Date();
  
  // Level up logic
  const newLevel = Math.floor(this.advocacyProfile.totalPoints / 100) + 1;
  if (newLevel > this.advocacyProfile.level) {
    this.advocacyProfile.level = newLevel;
  }
  
  return this.save();
};

// Method to add achievement
employeeSchema.methods.addAchievement = function(achievement) {
  if (!this.advocacyProfile.achievements.includes(achievement)) {
    this.advocacyProfile.achievements.push(achievement);
    return this.save();
  }
  return Promise.resolve(this);
};

// Indexes for performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ 'advocacyProfile.isActive': 1 });
employeeSchema.index({ 'advocacyProfile.totalPoints': -1 });
employeeSchema.index({ 'metrics.lastActivity': -1 });

module.exports = mongoose.model('Employee', employeeSchema); 