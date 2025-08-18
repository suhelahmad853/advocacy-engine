const express = require('express');
const Advocacy = require('../models/Advocacy');
const Employee = require('../models/Employee');
const Content = require('../models/Content');
const router = express.Router();

// Record content sharing activity
router.post('/share', async (req, res) => {
  try {
    const { employeeId, contentId, platform, shareText, shareUrl } = req.body;
    
    // Validate employee and content
    const employee = await Employee.findById(employeeId);
    const content = await Content.findById(contentId);
    
    if (!employee || !content) {
      return res.status(404).json({ error: 'Employee or content not found' });
    }
    
    // Create advocacy record
    const advocacy = new Advocacy({
      employee: employeeId,
      content: contentId,
      platform,
      shareText,
      shareUrl,
      shareTimestamp: new Date()
    });
    
    await advocacy.save();
    
    // Update employee metrics
    employee.metrics.totalShares += 1;
    employee.metrics.lastActivity = new Date();
    await employee.save();
    
    // Update content performance
    content.performance.totalShares += 1;
    content.sharingData.shareCount += 1;
    await content.save();
    
    // Add points to employee
    await employee.addPoints(10, 'content_share');
    
    res.status(201).json({
      message: 'Content shared successfully',
      advocacy,
      pointsEarned: 10
    });
    
  } catch (error) {
    console.error('Share content error:', error);
    res.status(500).json({ error: 'Failed to share content' });
  }
});

// Get employee advocacy history
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    const advocacies = await Advocacy.find({ employee: employeeId })
      .sort({ shareTimestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('content', 'title type category')
      .populate('employee', 'firstName lastName');
    
    const total = await Advocacy.countDocuments({ employee: employeeId });
    
    res.json({
      advocacies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get employee advocacy error:', error);
    res.status(500).json({ error: 'Failed to fetch advocacy history' });
  }
});

// Update engagement metrics for advocacy
router.put('/:id/engagement', async (req, res) => {
  try {
    const { id } = req.params;
    const { likes, comments, shares, clicks, reach, impressions } = req.body;
    
    const advocacy = await Advocacy.findById(id);
    if (!advocacy) {
      return res.status(404).json({ error: 'Advocacy record not found' });
    }
    
    // Update engagement metrics
    const metrics = {};
    if (likes !== undefined) metrics.likes = likes;
    if (comments !== undefined) metrics.comments = comments;
    if (shares !== undefined) metrics.shares = shares;
    if (clicks !== undefined) metrics.clicks = clicks;
    if (reach !== undefined) metrics.reach = reach;
    if (impressions !== undefined) metrics.impressions = impressions;
    
    await advocacy.updateEngagement(metrics);
    
    // Update employee metrics
    const employee = await Employee.findById(advocacy.employee);
    if (employee) {
      employee.metrics.totalEngagements += (likes || 0) + (comments || 0) + (shares || 0);
      employee.metrics.totalReach += reach || 0;
      await employee.save();
    }
    
    // Update content performance
    const content = await Content.findById(advocacy.content);
    if (content) {
      await content.updatePerformance({
        engagements: (likes || 0) + (comments || 0) + (shares || 0),
        reach: reach || 0
      });
    }
    
    res.json({
      message: 'Engagement metrics updated successfully',
      advocacy
    });
    
  } catch (error) {
    console.error('Update engagement error:', error);
    res.status(500).json({ error: 'Failed to update engagement metrics' });
  }
});

// Get top performing advocacies
router.get('/top-performers', async (req, res) => {
  try {
    const { limit = 10, timeframe = 'month' } = req.query;
    
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
    
    const topPerformers = await Advocacy.find(query)
      .sort({ 'points.totalPoints': -1 })
      .limit(parseInt(limit))
      .populate('employee', 'firstName lastName role department')
      .populate('content', 'title type category');
    
    res.json({ topPerformers, timeframe });
    
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
});

// Get advocacy analytics
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await Advocacy.getAnalytics(startDate, endDate);
    
    // Get additional metrics
    const totalEmployees = await Employee.countDocuments({ 'advocacyProfile.isActive': true });
    const activeAdvocates = await Advocacy.distinct('employee', {
      shareTimestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const analyticsData = {
      ...analytics[0],
      totalEmployees,
      activeAdvocates: activeAdvocates.length,
      participationRate: ((activeAdvocates.length / totalEmployees) * 100).toFixed(2)
    };
    
    res.json({ analytics: analyticsData });
    
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get platform-specific analytics
router.get('/analytics/platforms', async (req, res) => {
  try {
    const platformStats = await Advocacy.aggregate([
      {
        $group: {
          _id: '$platform',
          totalShares: { $sum: 1 },
          totalEngagement: { $sum: { $add: ['$engagement.likes', '$engagement.comments', '$engagement.shares'] } },
          totalReach: { $sum: '$engagement.reach' },
          averagePoints: { $avg: '$points.totalPoints' }
        }
      },
      { $sort: { totalShares: -1 } }
    ]);
    
    res.json({ platformStats });
    
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
});

module.exports = router; 