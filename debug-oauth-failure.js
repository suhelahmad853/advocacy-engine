const mongoose = require('mongoose');
require('dotenv').config();

async function debugOAuthFailure() {
  try {
    console.log('🔍 DEBUGGING LINKEDIN OAUTH FAILURE\n');
    console.log('=' .repeat(60));
    
    // Check environment variables
    console.log('🔧 Environment Variables Check:');
    console.log(`LinkedIn Client ID: ${process.env.LINKEDIN_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`LinkedIn Client Secret: ${process.env.LINKEDIN_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    console.log(`Server URL: ${process.env.SERVER_URL || 'http://localhost:5000'}`);
    
    // Check MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('\n✅ Connected to MongoDB');
    
    // Check employee data
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findById('689dc60c7aa8acf3fd914413');
    
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }
    
    console.log(`\n👤 Employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`🔗 LinkedIn Connected: ${employee.socialNetworks.linkedin.isConnected}`);
    console.log(`🆔 Profile ID: ${employee.socialNetworks.linkedin.profileId || 'None'}`);
    console.log(`🔑 Access Token: ${employee.socialNetworks.linkedin.accessToken ? 'Present' : 'Missing'}`);
    console.log(`🔄 Refresh Token: ${employee.socialNetworks.linkedin.refreshToken ? 'Present' : 'Missing'}`);
    console.log(`📅 Token Expiry: ${employee.socialNetworks.linkedin.tokenExpiry || 'None'}`);
    console.log(`🔒 Permissions: ${employee.socialNetworks.linkedin.permissions?.join(', ') || 'None'}`);
    
    // Check if there are any recent OAuth attempts
    console.log('\n📊 Recent OAuth Activity:');
    if (employee.socialNetworks.linkedin.lastSync) {
      console.log(`Last Sync: ${employee.socialNetworks.linkedin.lastSync}`);
    }
    
    // Test LinkedIn app connectivity
    console.log('\n🌐 Testing LinkedIn App Connectivity:');
    
    try {
      // Test 1: Check if we can reach LinkedIn OAuth endpoints
      console.log('🔍 Test 1: Checking LinkedIn OAuth endpoints...');
      
      const oauthResponse = await fetch('https://www.linkedin.com/oauth/v2/authorization', {
        method: 'GET',
        headers: {
          'User-Agent': 'SocialCatalyst/1.0'
        }
      });
      
      if (oauthResponse.ok) {
        console.log('✅ LinkedIn OAuth endpoint accessible');
      } else {
        console.log(`❌ LinkedIn OAuth endpoint error: ${oauthResponse.status}`);
      }
      
      // Test 2: Check if we can reach LinkedIn API
      console.log('🔍 Test 2: Checking LinkedIn API endpoints...');
      
      const apiResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'GET',
        headers: {
          'User-Agent': 'SocialCatalyst/1.0'
        }
      });
      
      if (apiResponse.status === 401) {
        console.log('✅ LinkedIn API endpoint accessible (401 expected without auth)');
      } else if (apiResponse.ok) {
        console.log('✅ LinkedIn API endpoint accessible');
      } else {
        console.log(`❌ LinkedIn API endpoint error: ${apiResponse.status}`);
      }
      
    } catch (error) {
      console.log('❌ Network connectivity issue:', error.message);
    }
    
    // Generate test OAuth URL
    console.log('\n🔗 Test OAuth URL Generation:');
    
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.SERVER_URL || 'http://localhost:5000'}/api/linkedin/oauth/callback`;
    const scope = 'openid profile w_member_social email';
    const state = `test_${Date.now()}`;
    
    if (clientId) {
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
      
      console.log('✅ OAuth URL generated successfully');
      console.log(`🔗 Test Auth URL: ${authUrl.substring(0, 100)}...`);
      console.log(`📋 Redirect URI: ${redirectUri}`);
      console.log(`🔒 Scopes: ${scope}`);
      console.log(`🎯 State: ${state}`);
      
      // Check if redirect URI matches what's configured in LinkedIn app
      console.log('\n⚠️  IMPORTANT: Verify these settings in your LinkedIn Developer Console:');
      console.log(`1. Redirect URLs should include: ${redirectUri}`);
      console.log(`2. App should have these products approved:`);
      console.log(`   - Sign In with LinkedIn using OpenID Connect`);
      console.log(`   - Share on LinkedIn`);
      console.log(`3. App should be in Production mode OR you should be in App Roles`);
      
    } else {
      console.log('❌ Cannot generate OAuth URL - missing CLIENT_ID');
    }
    
    // Check for common OAuth failure patterns
    console.log('\n🚨 Common OAuth Failure Patterns:');
    
    if (!employee.socialNetworks.linkedin.isConnected) {
      console.log('❌ Employee LinkedIn connection is false');
      console.log('💡 This suggests OAuth callback never completed successfully');
    }
    
    if (!employee.socialNetworks.linkedin.accessToken) {
      console.log('❌ No access token stored');
      console.log('💡 This confirms token exchange failed');
    }
    
    if (employee.socialNetworks.linkedin.profileId && 
        employee.socialNetworks.linkedin.profileId.startsWith('linkedin_')) {
      console.log('⚠️  Temporary profile ID detected');
      console.log('💡 This suggests getUserInfo failed during OAuth callback');
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Check LinkedIn Developer Console App Roles');
    console.log('2. Verify redirect URI matches exactly');
    console.log('3. Ensure all required products are approved');
    console.log('4. Try switching to Production mode if in Development');
    console.log('5. Check browser console for JavaScript errors during OAuth');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Debug Error:', error.message);
    process.exit(1);
  }
}

debugOAuthFailure(); 