const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Content = require('../models/Content');
const Advocacy = require('../models/Advocacy');
const linkedinService = require('../services/linkedinService');

// Simple auth middleware - using existing pattern
const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    // Use JWT verification
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const employee = await Employee.findById(decoded.employeeId).select('-password');
    
    if (!employee) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.employee = employee;
    next();
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Connect LinkedIn account
router.post('/connect', checkAuth, async (req, res) => {
  try {
    const { accessToken } = req.body;
    const employeeId = req.employee.id;

    // Validate LinkedIn token
    const isValid = await linkedinService.validateToken(accessToken);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid LinkedIn access token' });
    }

    // Get LinkedIn user info
    const userInfo = await linkedinService.getUserInfo(accessToken);
    
    // Update employee LinkedIn connection
    await Employee.findByIdAndUpdate(employeeId, {
      'socialNetworks.linkedin.isConnected': true,
      'socialNetworks.linkedin.profileUrl': userInfo.profile || `https://linkedin.com/in/${userInfo.sub}`,
      'socialNetworks.linkedin.accessToken': accessToken,
      'socialNetworks.linkedin.profileId': userInfo.sub
    });

    res.json({ 
      message: 'LinkedIn connected successfully',
      profile: userInfo 
    });
  } catch (error) {
    console.error('LinkedIn connect error:', error);
    res.status(500).json({ error: 'Failed to connect LinkedIn' });
  }
});

// Disconnect LinkedIn account
router.post('/disconnect', checkAuth, async (req, res) => {
  try {
    const employeeId = req.employee.id;
    
    await Employee.findByIdAndUpdate(employeeId, {
      'socialNetworks.linkedin.isConnected': false,
      'socialNetworks.linkedin.profileUrl': null,
      'socialNetworks.linkedin.accessToken': null,
      'socialNetworks.linkedin.profileId': null
    });

    res.json({ message: 'LinkedIn disconnected successfully' });
  } catch (error) {
    console.error('LinkedIn disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect LinkedIn' });
  }
});

// Share content to LinkedIn
router.post('/share', checkAuth, async (req, res) => {
  try {
    const { contentId, customMessage } = req.body;
    const employeeId = req.employee.id;

    // Get employee with LinkedIn connection
    const employee = await Employee.findById(employeeId);
    if (!employee.socialNetworks.linkedin.isConnected) {
      return res.status(400).json({ error: 'LinkedIn not connected. Please connect your account first.' });
    }

    // Get content to share
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (!content.sharingData?.isApproved) {
      return res.status(400).json({ error: 'Content is not approved for sharing' });
    }

    // Check if content was shared recently (within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentShare = await Advocacy.findOne({
      employee: employeeId,
      content: contentId,
      platform: 'linkedin',
      createdAt: { $gte: oneHourAgo }
    });

    if (recentShare) {
      return res.status(429).json({ 
        error: 'Content shared recently. Please wait at least 1 hour before sharing again.',
        nextShareTime: new Date(recentShare.createdAt.getTime() + 60 * 60 * 1000)
      });
    }

    // Prepare LinkedIn post content
    let postContent = content.title;
    if (content.description) {
      postContent += '\n\n' + content.description;
    }
    if (customMessage) {
      postContent = customMessage + '\n\n' + postContent;
    }

    // Add company hashtags and call-to-action
    postContent += '\n\n#SocialCatalyst #EmployeeAdvocacy #Innovation';
    if (content.tags && content.tags.length > 0) {
      postContent += '\n' + content.tags.map(tag => `#${tag}`).join(' ');
    }

    // Share to LinkedIn
    const linkedinResponse = await linkedinService.shareContent(
      employee.socialNetworks.linkedin.accessToken,
      `urn:li:person:${employee.socialNetworks.linkedin.profileId}`,
      postContent
    );

    // Record advocacy activity
    const advocacy = new Advocacy({
      employee: employeeId,
      content: contentId,
      platform: 'linkedin',
      shareDetails: {
        message: postContent,
        linkedinPostId: linkedinResponse.id
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0
      },
      gamification: {
        points: 25,
        bonus: 0
      },
      aiInsights: {
        optimalTiming: new Date(),
        reachPotential: 'high',
        engagementPrediction: 'medium'
      }
    });

    await advocacy.save();

    // Update employee points
    await employee.addPoints(25);

    // Update content performance
    await content.updatePerformance({ shares: 1 });

    res.json({
      message: 'Content shared to LinkedIn successfully',
      postId: linkedinResponse.id,
      advocacy: advocacy,
      pointsEarned: 25
    });

  } catch (error) {
    console.error('LinkedIn share error:', error);
    
    // Return more specific error information
    if (error.message) {
      res.status(500).json({ 
        error: 'Failed to share content to LinkedIn',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      res.status(500).json({ error: 'Failed to share content to LinkedIn' });
    }
  }
});

// Test LinkedIn sharing without auth (for debugging)
router.post('/test-share', async (req, res) => {
  try {
    console.log('🧪 Test LinkedIn sharing endpoint called');
    
    const { contentId, customMessage } = req.body;
    console.log('Content ID:', contentId);
    console.log('Custom Message:', customMessage);
    
    // Get content
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    console.log('Content found:', content.title);
    
    // Get first employee with LinkedIn
    const employee = await Employee.findOne({ 'socialNetworks.linkedin.isConnected': true });
    if (!employee) {
      return res.status(400).json({ error: 'No employee with LinkedIn connection found' });
    }
    console.log('Employee found:', employee.firstName, employee.lastName);
    
    // Test LinkedIn API
    const userInfo = await linkedinService.getUserInfo(employee.socialNetworks.linkedin.accessToken);
    console.log('LinkedIn API test successful');
    
    // Test sharing
    const postContent = `Test post: ${content.title}\n\n${content.description}\n\n#SocialCatalyst #EmployeeAdvocacy #Innovation`;
    const shareResult = await linkedinService.shareContent(
      employee.socialNetworks.linkedin.accessToken,
      `urn:li:person:${employee.socialNetworks.linkedin.profileId}`,
      postContent
    );
    
    console.log('LinkedIn sharing successful:', shareResult.id);
    
    res.json({
      message: 'Test LinkedIn sharing successful',
      postId: shareResult.id,
      content: content.title,
      employee: employee.firstName
    });
    
  } catch (error) {
    console.error('Test LinkedIn sharing error:', error);
    res.status(500).json({ 
      error: 'Test LinkedIn sharing failed',
      details: error.message,
      stack: error.stack
    });
  }
});

// Get LinkedIn connection status
router.get('/status', checkAuth, async (req, res) => {
  try {
    const employeeId = req.employee.id;
    const employee = await Employee.findById(employeeId).select('socialNetworks.linkedin');
    
    res.json({
      isConnected: employee.socialNetworks.linkedin.isConnected,
      profileId: employee.socialNetworks.linkedin.profileId,
      profileUrl: employee.socialNetworks.linkedin.profileUrl
    });
  } catch (error) {
    console.error('LinkedIn status error:', error);
    res.status(500).json({ error: 'Failed to get LinkedIn status' });
  }
});

// Get LinkedIn sharing history
router.get('/history', checkAuth, async (req, res) => {
  try {
    const employeeId = req.employee.id;
    
    const history = await Advocacy.find({
      employee: employeeId,
      platform: 'linkedin'
    })
    .populate('content', 'title description type category')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({ history });
  } catch (error) {
    console.error('LinkedIn history error:', error);
    res.status(500).json({ error: 'Failed to get LinkedIn history' });
  }
});

module.exports = router; 