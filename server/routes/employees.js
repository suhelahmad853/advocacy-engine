const express = require('express');
const Employee = require('../models/Employee');
const router = express.Router();

// Get all employees (for leaderboards)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, sortBy = 'totalPoints' } = req.query;
    
    const sortOptions = {
      totalPoints: { 'advocacyProfile.totalPoints': -1 },
      level: { 'advocacyProfile.level': -1 },
      engagement: { 'metrics.totalEngagements': -1 },
      reach: { 'metrics.totalReach': -1 }
    };
    
    const employees = await Employee.find({ 'advocacyProfile.isActive': true })
      .sort(sortOptions[sortBy] || sortOptions.totalPoints)
      .limit(parseInt(limit))
      .select('firstName lastName role department advocacyProfile metrics socialNetworks');
    
    res.json({ employees });
    
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeframe = 'month', limit = 20 } = req.query;
    
    const dateFilter = {};
    if (timeframe === 'week') {
      dateFilter.$gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const leaderboard = await Employee.aggregate([
      { $match: { 'advocacyProfile.isActive': true } },
      {
        $addFields: {
          recentPoints: {
            $cond: {
              if: { $gte: ['$metrics.lastActivity', dateFilter.$gte] },
              then: '$advocacyProfile.totalPoints',
              else: 0
            }
          }
        }
      },
      { $sort: { recentPoints: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          role: 1,
          department: 1,
          totalPoints: '$advocacyProfile.totalPoints',
          level: '$advocacyProfile.level',
          achievements: '$advocacyProfile.achievements',
          recentActivity: '$metrics.lastActivity'
        }
      }
    ]);
    
    res.json({ leaderboard, timeframe });
    
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select('-password');
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ employee });
    
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Update employee profile
router.put('/:id', async (req, res) => {
  try {
    const { expertise, skills, socialNetworks, contentPreferences } = req.body;
    
    const updateData = {};
    if (expertise) updateData.expertise = expertise;
    if (skills) updateData.skills = skills;
    if (socialNetworks) updateData.socialNetworks = socialNetworks;
    if (contentPreferences) updateData.contentPreferences = contentPreferences;
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({
      message: 'Employee updated successfully',
      employee
    });
    
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Get employee achievements
router.get('/:id/achievements', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select('advocacyProfile.achievements advocacyProfile.totalPoints advocacyProfile.level');
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({
      achievements: employee.advocacyProfile.achievements,
      totalPoints: employee.advocacyProfile.totalPoints,
      level: employee.advocacyProfile.level
    });
    
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get employee statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select('metrics advocacyProfile socialNetworks');
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const stats = {
      totalShares: employee.metrics.totalShares,
      totalEngagements: employee.metrics.totalEngagements,
      totalReach: employee.metrics.totalReach,
      totalPoints: employee.advocacyProfile.totalPoints,
      level: employee.advocacyProfile.level,
      networkSize: (employee.socialNetworks.linkedin.connections || 0) + 
                  (employee.socialNetworks.twitter.followers || 0),
      influenceScore: employee.influenceScore
    };
    
    res.json({ stats });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router; 