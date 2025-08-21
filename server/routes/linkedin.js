const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Content = require('../models/Content');
const Advocacy = require('../models/Advocacy');
const linkedinService = require('../services/linkedinService');
const { checkAuth } = require('../middleware/auth');

// Route to handle LinkedIn OAuth callback at the frontend path
// This matches the redirect URI configured in LinkedIn app and frontend
router.get('/auth/linkedin/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      console.log('❌ Missing OAuth parameters:', { code: !!code, state: !!state });
      return res.status(400).json({ 
        error: 'Missing required parameters: code and state' 
      });
    }

    console.log('🔐 LinkedIn OAuth callback received at /auth/linkedin/callback');
    console.log('📝 Code:', code.substring(0, 10) + '...');
    console.log('🔒 State:', state.substring(0, 20) + '...');

    // Decode state to get employeeId and timestamp
    const stateData = Buffer.from(state, 'base64').toString();
    const [employeeId, timestamp] = stateData.split('-');
    
    if (!employeeId) {
      console.log('❌ Invalid state parameter - employee ID not found');
      return res.status(400).json({ 
        error: 'Invalid state parameter - employee ID not found' 
      });
    }

    console.log('✅ Employee ID extracted from state:', employeeId);

    // Exchange authorization code for access token
    console.log('🔄 Exchanging authorization code for tokens...');
    const tokenResponse = await linkedinService.exchangeCodeForTokens(code);
    console.log('✅ Token exchange successful:', {
      hasAccessToken: !!tokenResponse.access_token,
      hasRefreshToken: !!tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in
    });
    
    // Get the real profile ID using the access token
    let profileId;
    try {
      console.log('🔍 Attempting to get user info from LinkedIn...');
      const userInfo = await linkedinService.getUserInfo(tokenResponse.access_token);
      console.log('📊 Full user info response:', userInfo);
      
      if (userInfo && userInfo.sub) {
        profileId = userInfo.sub;
        console.log('✅ Got real profile ID from LinkedIn API:', profileId);
      } else {
        console.log('⚠️ User info missing sub field:', userInfo);
        throw new Error('LinkedIn API response missing profile ID (sub field)');
      }
    } catch (error) {
      console.log('❌ Could not get user info from LinkedIn API:', error.message);
      
      // Handle specific LinkedIn API errors
      if (error.message.includes('403') || error.message.includes('product permissions')) {
        console.log('🚨 LinkedIn app requires product approval');
        return res.status(403).json({
          error: 'LinkedIn app requires "Sign In with LinkedIn using OpenID Connect" product approval. Please contact administrator.'
        });
      }
      
      if (error.message.includes('401') || error.message.includes('token revoked')) {
        console.log('🚨 LinkedIn token revoked or invalid');
        return res.status(401).json({
          error: 'LinkedIn authentication failed. Please try again or contact support.'
        });
      }
      
      throw error; // Re-throw other errors
    }
    
    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      console.error('❌ Employee not found for ID:', employeeId);
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log('✅ Found employee:', employee.firstName, employee.lastName);

    // Check if employee already has a valid LinkedIn connection
    if (employee.socialNetworks.linkedin.isConnected && 
        employee.socialNetworks.linkedin.accessToken && 
        employee.socialNetworks.linkedin.profileId && 
        !employee.socialNetworks.linkedin.profileId.startsWith('temp_') &&
        !employee.socialNetworks.linkedin.profileId.startsWith('linkedin_')) {
      console.log('⚠️ Employee already has a valid LinkedIn connection');
      return res.json({ 
        success: true, 
        message: 'LinkedIn already connected',
        profile: { profileUrl: employee.socialNetworks.linkedin.profileUrl },
        employee: {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          linkedinProfile: employee.socialNetworks.linkedin.profileUrl
        }
      });
    }

    // Update employee LinkedIn connection with OAuth 2.0 data
    const linkedinData = {
      profileUrl: `https://linkedin.com/in/${profileId}`,
      profileId: profileId,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiry: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
      isConnected: true,
      isPendingApproval: false,
      lastSync: new Date(),
      permissions: ['openid', 'profile', 'w_member_social', 'email'],
      networkStats: {
        connections: 0,
        followers: 0,
        lastUpdated: new Date()
      }
    };
    
    console.log('💾 Saving LinkedIn data to employee:', {
      employeeId: employee._id,
      profileId: linkedinData.profileId,
      hasAccessToken: !!linkedinData.accessToken,
      profileUrl: linkedinData.profileUrl
    });
    
    employee.socialNetworks.linkedin = linkedinData;
    await employee.save();
    
    console.log('✅ LinkedIn connection saved successfully');
    
    // Return success response
    res.json({ 
      success: true, 
      message: 'LinkedIn connected successfully',
      profile: { profileUrl: linkedinData.profileUrl },
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        linkedinProfile: linkedinData.profileUrl
      }
    });
    
  } catch (error) {
    console.error('💥 LinkedIn OAuth callback error:', error);
    
    // Return error response
    res.status(500).json({ 
      error: 'LinkedIn authentication failed', 
      message: error.message 
    });
  }
});

// OAuth 2.0: LinkedIn connection callback (POST for frontend)
router.post('/oauth/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code || !state) {
      return res.status(400).json({ 
        error: 'Missing required parameters: code and state' 
      });
    }

    // Decode state to get employeeId and timestamp
    const stateData = Buffer.from(state, 'base64').toString();
    const [employeeId, timestamp] = stateData.split('-');
    
    if (!employeeId) {
      return res.status(400).json({ 
        error: 'Invalid state parameter - employee ID not found' 
      });
    }

    console.log('OAuth callback received:', { code: code.substring(0, 10) + '...', state, employeeId });

    // Exchange authorization code for access token
    const tokenResponse = await linkedinService.exchangeCodeForTokens(code);
    console.log('✅ Token exchange successful:', {
      hasAccessToken: !!tokenResponse.access_token,
      hasRefreshToken: !!tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in
    });
    
    // Get the real profile ID using the access token
    let profileId;
    try {
      console.log('🔍 Attempting to get user info from LinkedIn...');
      const userInfo = await linkedinService.getUserInfo(tokenResponse.access_token);
      console.log('📊 Full user info response:', userInfo);
      
      if (userInfo && userInfo.sub) {
        profileId = userInfo.sub;
        console.log('✅ Got real profile ID from LinkedIn API:', profileId);
      } else {
        console.log('⚠️ User info missing sub field:', userInfo);
        console.log('💡 This should not happen with openid profile scope');
        console.log('💡 The scope only allows posting content, not reading profile data');
        
        // Use a more descriptive temporary ID for minimal scope
        profileId = `linkedin_${employeeId}_${Date.now()}`;
        console.log('🔄 Using descriptive temporary profile ID:', profileId);
        console.log('💡 This ID will work for content sharing but not for profile display');
      }
    } catch (error) {
      console.log('⚠️ Could not get user info from LinkedIn API');
      console.log('💡 This should not happen with openid profile scope');
      console.log('💡 The scope only allows posting content, not reading profile data');
      console.log('Error details:', error.message);
      
      // Use a more descriptive temporary ID for minimal scope
      profileId = `linkedin_${employeeId}_${Date.now()}`;
      console.log('🔄 Using descriptive temporary profile ID:', profileId);
      console.log('💡 This ID will work for content sharing but not for profile display');
    }
    
    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      console.error('Employee not found for ID:', employeeId);
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log('Found employee:', employee.firstName, employee.lastName);

    // Check if employee already has a valid LinkedIn connection
    if (employee.socialNetworks.linkedin.isConnected && 
        employee.socialNetworks.linkedin.accessToken && 
        employee.socialNetworks.linkedin.profileId && 
        !employee.socialNetworks.linkedin.profileId.startsWith('temp_') &&
        !employee.socialNetworks.linkedin.profileId.startsWith('linkedin_')) {
      console.log('⚠️ Employee already has a valid LinkedIn connection');
      return res.json({ 
        success: true, 
        message: 'LinkedIn already connected',
        profile: { profileUrl: employee.socialNetworks.linkedin.profileUrl },
        employee: {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          linkedinProfile: employee.socialNetworks.linkedin.profileUrl
        }
      });
    }

    // Update employee LinkedIn connection with OAuth 2.0 data
    const linkedinData = {
      profileUrl: `https://linkedin.com/in/${profileId}`,
      profileId: profileId,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiry: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
      isConnected: true,
      isPendingApproval: false, // LinkedIn product approval status
      lastSync: new Date(),
      permissions: ['openid', 'profile', 'w_member_social', 'email'],
      networkStats: {
        connections: 0, // Will be updated later
        followers: 0,
        lastUpdated: new Date()
      }
    };
    
    console.log('💾 Saving LinkedIn data to employee:', {
      employeeId: employee._id,
      profileId: linkedinData.profileId,
      hasAccessToken: !!linkedinData.accessToken,
      profileUrl: linkedinData.profileUrl
    });
    
    employee.socialNetworks.linkedin = linkedinData;
    
    await employee.save();
    
    res.json({ 
      success: true, 
      message: 'LinkedIn connected successfully via OAuth 2.0',
      profile: { profileUrl: `https://linkedin.com/in/${profileId}` }, // Return a placeholder profile
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        linkedinProfile: `https://linkedin.com/in/${profileId}`
      }
    });
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      error: 'Failed to complete LinkedIn OAuth connection',
      details: error.message 
    });
  }
});

// Get OAuth 2.0 authorization URL for an employee (temporarily without auth for testing)
router.get('/oauth/authorize/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    console.log('OAuth authorization request:', {
      requestedEmployeeId: employeeId,
      note: 'Authentication temporarily disabled for testing'
    });
    
    // Temporarily disable authentication checks for testing
    // TODO: Re-enable authentication in production

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Generate OAuth 2.0 authorization URL with correct scopes
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    const scope = 'openid profile w_member_social email'; // Match LinkedIn app configuration
    const state = Buffer.from(`${employeeId}-${Date.now()}`).toString('base64');
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    res.json({ 
      authUrl,
      state,
      employeeId,
      message: 'Use this URL to authorize LinkedIn access'
    });
    
  } catch (error) {
    console.error('OAuth authorization URL error:', error);
    res.status(500).json({ error: 'Failed to generate OAuth authorization URL' });
  }
});

// Disconnect LinkedIn account
router.post('/disconnect/:employeeId', checkAuth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    console.log('LinkedIn disconnect request:', {
      requestedEmployeeId: employeeId,
      authenticatedEmployeeId: req.employee._id.toString(),
      authenticatedEmployeeRole: req.employee.role,
      isAdmin: req.employee.role === 'admin',
      isOwnAccount: req.employee._id.toString() === employeeId
    });
    
    // Check if user can disconnect this employee's LinkedIn
    if (req.employee.role !== 'admin' && req.employee._id.toString() !== employeeId) {
      return res.status(403).json({ 
        error: 'Can only disconnect your own LinkedIn account',
        details: {
          requested: employeeId,
          authenticated: req.employee._id.toString(),
          role: req.employee.role
        }
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Clear LinkedIn connection data
    employee.socialNetworks.linkedin = {
      profileUrl: '',
      profileId: '',
      accessToken: '',
      refreshToken: '',
      tokenExpiry: null,
      isConnected: false,
      lastSync: null,
      permissions: [],
      networkStats: {
        connections: 0,
        followers: 0,
        lastUpdated: null
      }
    };
    
    await employee.save();
    
    res.json({ 
      success: true, 
      message: 'LinkedIn disconnected successfully',
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName
      }
    });
    
  } catch (error) {
    console.error('LinkedIn disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect LinkedIn account' });
  }
});

// Get LinkedIn connection status for all employees (admin only)
router.get('/status', checkAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.employee.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const employees = await Employee.find({}, {
      firstName: 1,
      lastName: 1,
      role: 1,
      department: 1,
      'socialNetworks.linkedin': 1
    });

    const linkedinStatus = employees.map(emp => ({
      employeeId: emp._id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      role: emp.role,
      department: emp.department,
      linkedin: {
        isConnected: emp.socialNetworks.linkedin.isConnected,
        profileUrl: emp.socialNetworks.linkedin.profileUrl,
        profileId: emp.socialNetworks.linkedin.profileId,
        lastSync: emp.socialNetworks.linkedin.lastSync,
        tokenExpiry: emp.socialNetworks.linkedin.tokenExpiry,
        permissions: emp.socialNetworks.linkedin.permissions,
        networkStats: emp.socialNetworks.linkedin.networkStats
      }
    }));

    res.json({ 
      linkedinStatus,
      totalEmployees: employees.length,
      connectedCount: linkedinStatus.filter(s => s.linkedin.isConnected).length
    });
    
  } catch (error) {
    console.error('LinkedIn status error:', error);
    res.status(500).json({ error: 'Failed to get LinkedIn connection status' });
  }
});

// Get current employee's LinkedIn connection status
router.get('/my-status', checkAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;
    
    const employee = await Employee.findById(employeeId, {
      'socialNetworks.linkedin': 1
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const linkedinStatus = {
      isConnected: employee.socialNetworks.linkedin.isConnected,
      profileUrl: employee.socialNetworks.linkedin.profileUrl,
      profileId: employee.socialNetworks.linkedin.profileId,
      lastSync: employee.socialNetworks.linkedin.lastSync,
      tokenExpiry: employee.socialNetworks.linkedin.tokenExpiry,
      permissions: employee.socialNetworks.linkedin.permissions,
      networkStats: employee.socialNetworks.linkedin.networkStats
    };

    res.json({ linkedinStatus });
    
  } catch (error) {
    console.error('LinkedIn my-status error:', error);
    res.status(500).json({ error: 'Failed to get LinkedIn connection status' });
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

    // Check if content was shared recently (within 1 hour) - but only if it was actually successful
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentShare = await Advocacy.findOne({
      employee: employeeId,
      content: contentId,
      platform: 'linkedin',
      createdAt: { $gte: oneHourAgo },
      'shareUrl': { $exists: true, $ne: '' } // Only count as "shared" if it has a valid share URL
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
    console.log('🔄 Attempting to share content to LinkedIn...');
    console.log('Employee LinkedIn data:', {
      profileId: employee.socialNetworks.linkedin.profileId,
      hasAccessToken: !!employee.socialNetworks.linkedin.accessToken,
      tokenExpiry: employee.socialNetworks.linkedin.tokenExpiry
    });
    console.log('Post content:', postContent);
    
    const authorUrn = `urn:li:person:${employee.socialNetworks.linkedin.profileId}`;
    console.log('🔗 Author URN being used:', authorUrn);
    console.log('🔍 Profile ID type and value:', {
      type: typeof employee.socialNetworks.linkedin.profileId,
      value: employee.socialNetworks.linkedin.profileId,
      isUndefined: employee.socialNetworks.linkedin.profileId === undefined,
      isNull: employee.socialNetworks.linkedin.profileId === null,
      isEmpty: employee.socialNetworks.linkedin.profileId === ''
    });
    
    const linkedinResponse = await linkedinService.shareContent(
      employee.socialNetworks.linkedin.accessToken,
      authorUrn,
      postContent
    );

    console.log('✅ LinkedIn sharing response:', linkedinResponse);

    // Validate that LinkedIn actually created the post
    if (!linkedinResponse || !linkedinResponse.id) {
      console.error('❌ LinkedIn response missing post ID:', linkedinResponse);
      throw new Error('LinkedIn API returned success but no post ID. Post may not have been created.');
    }

    console.log('✅ LinkedIn post created successfully with ID:', linkedinResponse.id);

    // Record advocacy activity
    const advocacy = new Advocacy({
      employee: employeeId,
      content: contentId,
      platform: 'linkedin',
      shareText: postContent,
      shareUrl: `https://www.linkedin.com/feed/update/${linkedinResponse.id}`,
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0
      },
      points: {
        basePoints: 25,
        engagementBonus: 0,
        viralBonus: 0,
        totalPoints: 25
      },
      aiInsights: {
        optimalTiming: true,
        audienceMatch: 50,
        contentRelevance: 75,
        networkLeverage: 60
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