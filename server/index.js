const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const employeeRoutes = require('./routes/employees');
const advocacyRoutes = require('./routes/advocacy');
const analyticsRoutes = require('./routes/analytics');
const linkedinRoutes = require('./routes/linkedin');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// LinkedIn OAuth callback route (must be at root level to match redirect URI)
app.get('/auth/linkedin/callback', async (req, res) => {
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

    // Import required modules for this route
    const linkedinService = require('./services/linkedinService');
    const Employee = require('./models/Employee');

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/advocacy', advocacyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/linkedin', linkedinRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Social Catalyst API',
    version: '1.0.0'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Social Catalyst API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app; 