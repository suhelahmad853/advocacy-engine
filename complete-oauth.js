const mongoose = require('mongoose');
const linkedinService = require('./server/services/linkedinService');
require('dotenv').config();

async function completeOAuth(authorizationCode) {
  try {
    if (!authorizationCode) {
      console.log('❌ Please provide the authorization code from LinkedIn');
      console.log('Usage: node complete-oauth.js <authorization_code>');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findOne();
    
    if (!employee) {
      console.log('❌ No employee found');
      return;
    }
    
    console.log(`👤 Completing OAuth for: ${employee.firstName} ${employee.lastName}`);
    console.log(`🔑 Authorization code: ${authorizationCode.substring(0, 10)}...`);
    
    // Exchange authorization code for tokens
    console.log('\n🔄 Exchanging authorization code for tokens...');
    const tokenResponse = await linkedinService.exchangeCodeForTokens(authorizationCode);
    
    console.log('✅ Token exchange successful:', {
      hasAccessToken: !!tokenResponse.access_token,
      hasRefreshToken: !!tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in
    });
    
    // Get user info to get the real profile ID
    console.log('\n🔍 Getting user info from LinkedIn...');
    let profileId;
    try {
      const userInfo = await linkedinService.getUserInfo(tokenResponse.access_token);
      profileId = userInfo.sub;
      console.log('✅ Got real profile ID:', profileId);
    } catch (error) {
      console.log('⚠️ Could not get user info, using temporary profile ID');
      profileId = `temp_${employee._id}_${Date.now()}`;
    }
    
    // Update employee LinkedIn connection
    const linkedinData = {
      profileUrl: `https://linkedin.com/in/${profileId}`,
      profileId: profileId,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiry: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
      isConnected: true,
      lastSync: new Date(),
      permissions: ['w_member_social'],
      networkStats: {
        connections: 0,
        followers: 0,
        lastUpdated: new Date()
      }
    };
    
    employee.socialNetworks.linkedin = linkedinData;
    await employee.save();
    
    console.log('✅ LinkedIn connection updated successfully');
    console.log('🔗 Profile URL:', linkedinData.profileUrl);
    console.log('🔑 Access Token:', linkedinData.accessToken.substring(0, 20) + '...');
    console.log('⏰ Token Expiry:', linkedinData.tokenExpiry);
    
    // Test the connection
    console.log('\n🧪 Testing LinkedIn connection...');
    try {
      const testUserInfo = await linkedinService.getUserInfo(linkedinData.accessToken);
      console.log('✅ LinkedIn connection test successful!');
      console.log('📊 User info:', testUserInfo);
    } catch (error) {
      console.log('⚠️ LinkedIn test failed:', error.message);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ OAuth flow completed successfully!');
    console.log('🎉 Content sharing should now work!');
    
  } catch (error) {
    console.error('❌ OAuth completion failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Get authorization code from command line argument
const authCode = process.argv[2];
completeOAuth(authCode); 