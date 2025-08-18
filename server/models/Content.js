const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // Basic Content Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // Content Classification
  type: {
    type: String,
    required: true,
    enum: ['company-news', 'job-opening', 'thought-leadership', 'product-launch', 'event', 'achievement', 'blog-post']
  },
  category: {
    type: String,
    required: true,
    enum: ['tech', 'business', 'marketing', 'sales', 'hr', 'general']
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Content Optimization
  targetAudience: [{
    type: String,
    enum: ['developers', 'designers', 'marketing', 'sales', 'hr', 'management', 'all']
  }],
  expertiseLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  platforms: [{
    type: String,
    enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'all'],
    default: ['all']
  }],
  
  // AI Personalization Data
  aiScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  personalizationFactors: {
    roleMatch: { type: Number, default: 0 },
    expertiseMatch: { type: Number, default: 0 },
    networkRelevance: { type: Number, default: 0 },
    timingScore: { type: Number, default: 0 }
  },
  
  // Content Performance
  performance: {
    totalShares: { type: Number, default: 0 },
    totalEngagements: { type: Number, default: 0 },
    totalReach: { type: Number, default: 0 },
    averageEngagementRate: { type: Number, default: 0 },
    viralScore: { type: Number, default: 0 }
  },
  
  // Sharing & Distribution
  sharingData: {
    isApproved: { type: Boolean, default: false },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    approvedAt: Date,
    autoShare: { type: Boolean, default: false },
    shareCount: { type: Number, default: 0 },
    lastSharedAt: Date
  },
  
  // Content Metadata
  metadata: {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    source: String,
    externalUrl: String,
    imageUrl: String,
    videoUrl: String,
    estimatedReadTime: Number,
    language: { type: String, default: 'en' }
  },
  
  // Scheduling & Timing
  scheduling: {
    publishDate: Date,
    expiryDate: Date,
    optimalSharingTimes: [{
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
      timeSlot: String, // "09:00", "12:00", "17:00"
      timezone: { type: String, default: 'UTC' }
    }],
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: String // "weekly", "monthly", "quarterly"
  },
  
  // Content Variations
  variations: [{
    platform: {
      type: String,
      enum: ['linkedin', 'twitter', 'facebook', 'instagram']
    },
    content: String,
    characterCount: Number,
    hashtags: [String],
    mentions: [String],
    callToAction: String
  }],
  
  // Analytics & Tracking
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    timeOnPage: { type: Number, default: 0 }
  },
  
  // Status & Lifecycle
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published', 'archived', 'expired'],
    default: 'draft'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: Date
}, {
  timestamps: true
});

// Virtual for content age
contentSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for engagement rate
contentSchema.virtual('engagementRate').get(function() {
  if (this.performance.totalReach === 0) return 0;
  return (this.performance.totalEngagements / this.performance.totalReach * 100).toFixed(2);
});

// Virtual for content score (AI + performance)
contentSchema.virtual('contentScore').get(function() {
  const aiWeight = 0.4;
  const performanceWeight = 0.6;
  
  const performanceScore = Math.min(
    (this.performance.totalEngagements / 100) + 
    (this.performance.viralScore / 10), 
    100
  );
  
  return Math.round(
    (this.aiScore * aiWeight) + (performanceScore * performanceWeight)
  );
});

// Method to update performance metrics
contentSchema.methods.updatePerformance = function(metrics) {
  if (metrics.shares) this.performance.totalShares += metrics.shares;
  if (metrics.engagements) this.performance.totalEngagements += metrics.engagements;
  if (metrics.reach) this.performance.totalReach += metrics.reach;
  
  // Update engagement rate
  if (this.performance.totalReach > 0) {
    this.performance.averageEngagementRate = 
      this.performance.totalEngagements / this.performance.totalReach;
  }
  
  // Update viral score
  this.performance.viralScore = Math.min(
    (this.performance.totalReach / 1000) + 
    (this.performance.totalEngagements / 100), 
    100
  );
  
  this.sharingData.lastSharedAt = new Date();
  return this.save();
};

// Method to calculate AI personalization score
contentSchema.methods.calculateAIScore = function(employee) {
  let score = 0;
  
  // Role match
  if (this.targetAudience.includes('all') || 
      this.targetAudience.includes(employee.role)) {
    score += 25;
  }
  
  // Expertise match
  if (this.expertiseLevel === 'all' || 
      (employee.expertise && employee.expertise.some(exp => 
        this.tags.includes(exp.toLowerCase())))) {
    score += 25;
  }
  
  // Network relevance
  const networkSize = (employee.socialNetworks.linkedin.connections || 0) + 
                     (employee.socialNetworks.twitter.followers || 0);
  if (networkSize > 500) score += 25;
  else if (networkSize > 100) score += 15;
  
  // Timing score (simplified)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  
  if (this.scheduling.optimalSharingTimes.some(time => 
    time.dayOfWeek === dayOfWeek && 
    (hour >= 9 && hour <= 17))) {
    score += 25;
  }
  
  this.aiScore = score;
  return score;
};

// Indexes for performance
contentSchema.index({ type: 1, category: 1 });
contentSchema.index({ 'sharingData.isApproved': 1 });
contentSchema.index({ status: 1 });
contentSchema.index({ 'scheduling.publishDate': 1 });
contentSchema.index({ aiScore: -1 });
contentSchema.index({ 'performance.totalShares': -1 });
contentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Content', contentSchema); 