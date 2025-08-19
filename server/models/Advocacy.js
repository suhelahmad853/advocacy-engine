const mongoose = require('mongoose');

const advocacySchema = new mongoose.Schema({
  // Employee and Content Reference
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  
  // Sharing Activity
  platform: {
    type: String,
    required: true,
    enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'other']
  },
  shareUrl: String,
  shareText: String,
  shareTimestamp: {
    type: Date,
    default: Date.now
  },
  
  // Engagement Metrics
  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 }
  },
  
  // Performance Tracking
  performance: {
    engagementRate: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 },
    viralCoefficient: { type: Number, default: 0 },
    qualityScore: { type: Number, default: 0 }
  },
  
  // Gamification & Points
  points: {
    basePoints: { type: Number, default: 10 },
    engagementBonus: { type: Number, default: 0 },
    viralBonus: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 }
  },
  
  // AI Analysis
  aiInsights: {
    optimalTiming: { type: Boolean, default: false },
    audienceMatch: { type: Number, default: 0 },
    contentRelevance: { type: Number, default: 0 },
    networkLeverage: { type: Number, default: 0 }
  },
  
  // Business Impact
  businessImpact: {
    leadsGenerated: { type: Number, default: 0 },
    referralsGenerated: { type: Number, default: 0 },
    brandMentions: { type: Number, default: 0 },
    websiteTraffic: { type: Number, default: 0 }
  },
  
  
  // Status & Lifecycle
  status: {
    type: String,
    enum: ['shared', 'engaged', 'viral', 'expired', 'archived'],
    default: 'shared'
  },
  
  // Tracking & Analytics
  tracking: {
    isTracked: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
    updateFrequency: { type: String, default: 'hourly' },
    trackingErrors: [String]
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    location: String,
    device: String,
    browser: String
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Virtual for total engagement
advocacySchema.virtual('totalEngagement').get(function() {
  return this.engagement.likes + this.engagement.comments + this.engagement.shares;
});

// Virtual for engagement rate
advocacySchema.virtual('engagementRate').get(function() {
  if (this.engagement.reach === 0) return 0;
  return (this.totalEngagement / this.engagement.reach * 100).toFixed(2);
});

// Virtual for viral score
advocacySchema.virtual('viralScore').get(function() {
  const baseScore = this.engagement.shares * 2;
  const engagementScore = this.totalEngagement * 0.5;
  const reachScore = Math.min(this.engagement.reach / 100, 50);
  return Math.round(baseScore + engagementScore + reachScore);
});

// Pre-save middleware to calculate points
advocacySchema.pre('save', function(next) {
  // Calculate engagement bonus points
  this.points.engagementBonus = Math.floor(this.totalEngagement * 0.5);
  
  // Calculate viral bonus points
  if (this.engagement.reach > 1000) {
    this.points.viralBonus = Math.floor(this.engagement.reach / 100);
  }
  
  // Calculate total points
  this.points.totalPoints = this.points.basePoints + 
                           this.points.engagementBonus + 
                           this.points.viralBonus;
  
  // Update performance metrics
  if (this.engagement.reach > 0) {
    this.performance.engagementRate = this.engagementRate;
    this.performance.clickThroughRate = 
      (this.engagement.clicks / this.engagement.reach * 100).toFixed(2);
  }
  
  // Update viral coefficient
  if (this.engagement.reach > 0) {
    this.performance.viralCoefficient = 
      (this.engagement.shares / this.engagement.reach).toFixed(3);
  }
  
  // Update quality score
  this.performance.qualityScore = Math.min(
    (this.aiInsights.audienceMatch + 
     this.aiInsights.contentRelevance + 
     this.aiInsights.networkLeverage) / 3, 
    100
  );
  
  // Update status based on performance
  if (this.engagement.reach > 10000) {
    this.status = 'viral';
  } else if (this.totalEngagement > 100) {
    this.status = 'engaged';
  }
  
  next();
});

// Method to update engagement metrics
advocacySchema.methods.updateEngagement = function(metrics) {
  if (metrics.likes !== undefined) this.engagement.likes = metrics.likes;
  if (metrics.comments !== undefined) this.engagement.comments = metrics.comments;
  if (metrics.shares !== undefined) this.engagement.shares = metrics.shares;
  if (metrics.clicks !== undefined) this.engagement.clicks = metrics.clicks;
  if (metrics.reach !== undefined) this.engagement.reach = metrics.reach;
  if (metrics.impressions !== undefined) this.engagement.impressions = metrics.impressions;
  
  this.tracking.lastUpdated = new Date();
  return this.save();
};

// Method to calculate AI insights
advocacySchema.methods.calculateAIInsights = function() {
  // Audience match (simplified)
  this.aiInsights.audienceMatch = Math.min(
    (this.engagement.reach / 1000) * 100, 
    100
  );
  
  // Content relevance (based on engagement rate)
  this.aiInsights.contentRelevance = Math.min(
    this.performance.engagementRate * 10, 
    100
  );
  
  // Network leverage (based on viral coefficient)
  this.aiInsights.networkLeverage = Math.min(
    this.performance.viralCoefficient * 1000, 
    100
  );
  
  // Optimal timing (simplified - business hours)
  const shareHour = this.shareTimestamp.getHours();
  this.aiInsights.optimalTiming = shareHour >= 9 && shareHour <= 17;
  
  return this.save();
};

// Static method to get top performing advocacies
advocacySchema.statics.getTopPerformers = function(limit = 10) {
  return this.find()
    .sort({ 'points.totalPoints': -1 })
    .limit(limit)
    .populate('employee', 'firstName lastName role department')
    .populate('content', 'title type category');
};

// Static method to get advocacy analytics
advocacySchema.statics.getAnalytics = function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalShares: { $sum: 1 },
        totalEngagement: { $sum: { $add: ['$engagement.likes', '$engagement.comments', '$engagement.shares'] } },
        totalReach: { $sum: '$engagement.reach' },
        totalPoints: { $sum: '$points.totalPoints' },
        averageEngagementRate: { $avg: '$performance.engagementRate' }
      }
    }
  ]);
};

// Indexes for performance
advocacySchema.index({ employee: 1, createdAt: -1 });
advocacySchema.index({ content: 1, createdAt: -1 });
advocacySchema.index({ platform: 1, createdAt: -1 });
advocacySchema.index({ 'points.totalPoints': -1 });
advocacySchema.index({ status: 1, createdAt: -1 });
advocacySchema.index({ 'engagement.reach': -1 });

module.exports = mongoose.model('Advocacy', advocacySchema); 