const express = require('express');
const Employee = require('../models/Employee');
const Content = require('../models/Content');
const Advocacy = require('../models/Advocacy');
const router = express.Router();

// Get overall platform analytics
router.get('/overview', async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    const dateFilter = {};
    if (timeframe === 'week') {
      dateFilter.$gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'quarter') {
      dateFilter.$gte = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    }
    
    // Get employee statistics
    const totalEmployees = await Employee.countDocuments({ 'advocacyProfile.isActive': true });
    const activeEmployees = await Employee.countDocuments({
      'advocacyProfile.isActive': true,
      'metrics.lastActivity': dateFilter
    });
    
    // Get content statistics
    const totalContent = await Content.countDocuments({ 'sharingData.isApproved': true });
    const publishedContent = await Content.countDocuments({ 
      'sharingData.isApproved': true,
      status: 'published'
    });
    
    // Get advocacy statistics
    const advocacyQuery = {};
    if (Object.keys(dateFilter).length > 0) {
      advocacyQuery.shareTimestamp = dateFilter;
    }
    
    const totalShares = await Advocacy.countDocuments(advocacyQuery);
    const totalEngagements = await Advocacy.aggregate([
      { $match: advocacyQuery },
      {
        $group: {
          _id: null,
          total: { $sum: { $add: ['$engagement.likes', '$engagement.comments', '$engagement.shares'] } }
        }
      }
    ]);
    
    const totalReach = await Advocacy.aggregate([
      { $match: advocacyQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$engagement.reach' }
        }
      }
    ]);
    
    // Calculate ROI metrics
    const participationRate = ((activeEmployees / totalEmployees) * 100).toFixed(2);
    const averageEngagementRate = totalReach[0]?.total > 0 ? 
      ((totalEngagements[0]?.total || 0) / totalReach[0].total * 100).toFixed(2) : 0;
    
    const overview = {
      timeframe,
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        participationRate: parseFloat(participationRate)
      },
      content: {
        total: totalContent,
        published: publishedContent,
        approvalRate: ((publishedContent / totalContent) * 100).toFixed(2)
      },
      advocacy: {
        totalShares: totalShares,
        totalEngagements: totalEngagements[0]?.total || 0,
        totalReach: totalReach[0]?.total || 0,
        averageEngagementRate: parseFloat(averageEngagementRate)
      },
      roi: {
        reachAmplification: totalReach[0]?.total > 0 ? 
          ((totalReach[0].total / (totalEmployees * 500)) * 100).toFixed(2) : 0,
        costSavings: 'Calculated based on external recruitment costs'
      }
    };
    
    res.json({ overview });
    
  } catch (error) {
    console.error('Get overview analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch overview analytics' });
  }
});

// Get employee performance analytics
router.get('/employees', async (req, res) => {
  try {
    const { sortBy = 'totalPoints', limit = 20 } = req.query;
    
    const sortOptions = {
      totalPoints: { 'advocacyProfile.totalPoints': -1 },
      engagement: { 'metrics.totalEngagements': -1 },
      reach: { 'metrics.totalReach': -1 },
      shares: { 'metrics.totalShares': -1 }
    };
    
    const topPerformers = await Employee.find({ 'advocacyProfile.isActive': true })
      .sort(sortOptions[sortBy] || sortOptions.totalPoints)
      .limit(parseInt(limit))
      .select('firstName lastName role department advocacyProfile metrics socialNetworks');
    
    // Calculate department performance
    const departmentStats = await Employee.aggregate([
      { $match: { 'advocacyProfile.isActive': true } },
      {
        $group: {
          _id: '$department',
          employeeCount: { $sum: 1 },
          totalPoints: { $sum: '$advocacyProfile.totalPoints' },
          totalShares: { $sum: '$metrics.totalShares' },
          totalEngagements: { $sum: '$metrics.totalEngagements' },
          totalReach: { $sum: '$metrics.totalReach' }
        }
      },
      {
        $addFields: {
          averagePoints: { $divide: ['$totalPoints', '$employeeCount'] },
          averageShares: { $divide: ['$totalShares', '$employeeCount'] }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);
    
    res.json({
      topPerformers,
      departmentStats,
      sortBy
    });
    
  } catch (error) {
    console.error('Get employee analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch employee analytics' });
  }
});

// Get content performance analytics
router.get('/content', async (req, res) => {
  try {
    const { timeframe = 'month', limit = 20 } = req.query;
    
    const dateFilter = {};
    if (timeframe === 'week') {
      dateFilter.$gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get top performing content
    const topContent = await Content.find({
      'sharingData.isApproved': true,
      status: 'published'
    })
    .sort({ 'performance.totalShares': -1, 'performance.totalEngagements': -1 })
    .limit(parseInt(limit))
    .populate('author', 'firstName lastName role');
    
    // Get content by category performance
    const categoryStats = await Content.aggregate([
      { $match: { 'sharingData.isApproved': true, status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalShares: { $sum: '$performance.totalShares' },
          totalEngagements: { $sum: '$performance.totalEngagements' },
          totalReach: { $sum: '$performance.totalReach' },
          averageEngagementRate: { $avg: '$performance.averageEngagementRate' }
        }
      },
      { $sort: { totalShares: -1 } }
    ]);
    
    // Get content by type performance
    const typeStats = await Content.aggregate([
      { $match: { 'sharingData.isApproved': true, status: 'published' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalShares: { $sum: '$performance.totalShares' },
          totalEngagements: { $sum: '$performance.totalEngagements' },
          totalReach: { $sum: '$performance.totalReach' }
        }
      },
      { $sort: { totalShares: -1 } }
    ]);
    
    res.json({
      topContent,
      categoryStats,
      typeStats,
      timeframe
    });
    
  } catch (error) {
    console.error('Get content analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch content analytics' });
  }
});

// Get platform-specific analytics
router.get('/platforms', async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    const dateFilter = {};
    if (timeframe === 'week') {
      dateFilter.$gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const query = {};
    if (Object.keys(dateFilter).length > 0) {
      query.shareTimestamp = dateFilter;
    }
    
    const platformStats = await Advocacy.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$platform',
          totalShares: { $sum: 1 },
          totalEngagement: { $sum: { $add: ['$engagement.likes', '$engagement.comments', '$engagement.shares'] } },
          totalReach: { $sum: '$engagement.reach' },
          totalClicks: { $sum: '$engagement.clicks' },
          averagePoints: { $avg: '$points.totalPoints' },
          viralContent: {
            $sum: {
              $cond: [{ $gte: ['$engagement.reach', 1000] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          engagementRate: {
            $cond: [
              { $gt: ['$totalReach', 0] },
              { $multiply: [{ $divide: ['$totalEngagement', '$totalReach'] }, 100] },
              0
            ]
          },
          clickThroughRate: {
            $cond: [
              { $gt: ['$totalReach', 0] },
              { $multiply: [{ $divide: ['$totalClicks', '$totalReach'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { totalShares: -1 } }
    ]);
    
    res.json({ platformStats, timeframe });
    
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
});

// Get business impact analytics
router.get('/business-impact', async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    const dateFilter = {};
    if (timeframe === 'week') {
      dateFilter.$gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const query = {};
    if (Object.keys(dateFilter).length > 0) {
      query.shareTimestamp = dateFilter;
    }
    
    // Get business impact metrics
    const businessImpact = await Advocacy.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: '$businessImpact.leadsGenerated' },
          totalReferrals: { $sum: '$businessImpact.referralsGenerated' },
          totalBrandMentions: { $sum: '$businessImpact.brandMentions' },
          totalWebsiteTraffic: { $sum: '$businessImpact.websiteTraffic' }
        }
      }
    ]);
    
    // Calculate estimated cost savings
    const totalReferrals = businessImpact[0]?.totalReferrals || 0;
    const estimatedCostSavings = totalReferrals * 50000; // ₹50K per external hire
    
    const impact = {
      timeframe,
      metrics: businessImpact[0] || {
        totalLeads: 0,
        totalReferrals: 0,
        totalBrandMentions: 0,
        totalWebsiteTraffic: 0
      },
      costSavings: {
        estimatedSavings: estimatedCostSavings,
        externalHireCost: 50000,
        totalReferrals
      },
      roi: {
        recruitmentEfficiency: totalReferrals > 0 ? 'Improved' : 'Baseline',
        brandVisibility: 'Enhanced through employee networks',
        leadGeneration: 'Amplified through social sharing'
      }
    };
    
    res.json({ businessImpact: impact });
    
  } catch (error) {
    console.error('Get business impact error:', error);
    res.status(500).json({ error: 'Failed to fetch business impact analytics' });
  }
});

module.exports = router; 