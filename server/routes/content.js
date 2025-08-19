const express = require('express');
const Content = require('../models/Content');
const router = express.Router();

// Get all approved content
router.get('/', async (req, res) => {
  try {
    const { category, type, limit = 20, page = 1 } = req.query;
    
    const query = { 'sharingData.isApproved': true, status: 'published' };
    if (category) query.category = category;
    if (type) query.type = type;
    
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    // Removed populate since content doesn't have authors assigned yet
    
    const total = await Content.countDocuments(query);
    
    res.json({
      content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('author', 'firstName lastName role department');
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json({ content });
    
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Create new content (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      content: contentText,
      type,
      category,
      tags,
      targetAudience,
      platforms,
      metadata
    } = req.body;
    
    const newContent = new Content({
      title,
      description,
      content: contentText,
      type,
      category,
      tags: tags || [],
      targetAudience: targetAudience || ['all'],
      platforms: platforms || ['all'],
      metadata: metadata || {},
      status: 'draft'
    });
    
    await newContent.save();
    
    res.status(201).json({
      message: 'Content created successfully',
      content: newContent
    });
    
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Update content
router.put('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Content updated successfully',
      content: updatedContent
    });
    
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Approve content for sharing
router.patch('/:id/approve', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    content.sharingData.isApproved = true;
    content.sharingData.approvedAt = new Date();
    content.status = 'published';
    
    await content.save();
    
    res.json({
      message: 'Content approved successfully',
      content
    });
    
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

// Get personalized content recommendations
router.get('/recommendations/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 10 } = req.query;
    
    // Get employee data (simplified - in real app, get from auth middleware)
    const Employee = require('../models/Employee');
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Get approved content
    const content = await Content.find({
      'sharingData.isApproved': true,
      status: 'published'
    }).limit(parseInt(limit));
    
    // Calculate AI scores for personalization
    const personalizedContent = content.map(item => {
      const aiScore = item.calculateAIScore(employee);
      return {
        ...item.toObject(),
        aiScore,
        personalizationScore: aiScore
      };
    });
    
    // Sort by personalization score
    personalizedContent.sort((a, b) => b.personalizationScore - a.personalizationScore);
    
    res.json({
      recommendations: personalizedContent.slice(0, parseInt(limit)),
      employee: {
        role: employee.role,
        expertise: employee.expertise,
        networkSize: (employee.socialNetworks.linkedin.connections || 0) + 
                    (employee.socialNetworks.twitter.followers || 0)
      }
    });
    
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get trending content
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, timeframe = '7d' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));
    
    const trendingContent = await Content.find({
      'sharingData.isApproved': true,
      status: 'published',
      createdAt: { $gte: daysAgo }
    })
    .sort({ 'performance.totalShares': -1, 'performance.totalEngagements': -1 })
    .limit(parseInt(limit))
    .populate('author', 'firstName lastName role');
    
    res.json({ trendingContent });
    
  } catch (error) {
    console.error('Get trending content error:', error);
    res.status(500).json({ error: 'Failed to get trending content' });
  }
});

module.exports = router; 