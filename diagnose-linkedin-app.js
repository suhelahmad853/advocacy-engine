const axios = require('axios');
require('dotenv').config();

async function diagnoseLinkedInApp() {
  console.log('🔍 LinkedIn App Configuration Diagnosis\n');
  
  // Check environment variables
  console.log('📋 Environment Configuration:');
  console.log('=====================================');
  console.log(`Client ID: ${process.env.LINKEDIN_CLIENT_ID ? '✅ Present' : '❌ Missing'}`);
  console.log(`Client Secret: ${process.env.LINKEDIN_CLIENT_SECRET ? '✅ Present' : '❌ Missing'}`);
  console.log(`Redirect URI: ${process.env.LINKEDIN_REDIRECT_URI ? '✅ Present' : '❌ Missing'}`);
  console.log('=====================================\n');
  
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    console.log('❌ Missing LinkedIn credentials in .env file');
    return;
  }
  
  // Test OAuth endpoints
  console.log('🔐 Testing OAuth Endpoints:');
  console.log('=====================================');
  
  try {
    // Test authorization URL generation
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&scope=w_member_social&state=test`;
    
    console.log('✅ Authorization URL generated successfully');
    console.log(`URL: ${authUrl.substring(0, 100)}...`);
    
    // Test if we can reach LinkedIn
    const linkedinResponse = await axios.get('https://www.linkedin.com', { timeout: 10000 });
    console.log('✅ LinkedIn.com is accessible');
    
  } catch (error) {
    console.log('❌ LinkedIn connectivity issue:', error.message);
  }
  
  console.log('=====================================\n');
  
  // Check common issues
  console.log('🚨 Common LinkedIn App Issues:');
  console.log('=====================================');
  console.log('1. App not approved for w_member_social scope');
  console.log('2. Redirect URI mismatch between app and .env');
  console.log('3. App status: Draft/Development mode');
  console.log('4. User account restrictions');
  console.log('5. App verification requirements');
  console.log('=====================================\n');
  
  // Recommendations
  console.log('💡 Recommendations to Fix:');
  console.log('=====================================');
  console.log('1. Go to LinkedIn Developer Console');
  console.log('2. Check app status and permissions');
  console.log('3. Verify redirect URI matches exactly');
  console.log('4. Ensure app is approved for w_member_social scope');
  console.log('5. Check if app needs verification');
  console.log('6. Try with a different LinkedIn account');
  console.log('=====================================\n');
  
  // Test token validation
  console.log('🧪 Testing Current Token:');
  console.log('=====================================');
  
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findOne({'socialNetworks.linkedin.accessToken': {$exists: true}});
    
    if (employee && employee.socialNetworks.linkedin.accessToken) {
      const token = employee.socialNetworks.linkedin.accessToken;
      console.log(`Token: ${token.substring(0, 20)}...`);
      
      // Test token with different endpoints
      try {
        const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Restli-Protocol-Version': '2.0.0'
          },
          timeout: 10000
        });
        console.log('✅ Token works with userinfo endpoint');
      } catch (error) {
        console.log('❌ Token failed with userinfo endpoint:', error.response?.data || error.message);
      }
      
      try {
        const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Restli-Protocol-Version': '2.0.0'
          },
          timeout: 10000
        });
        console.log('✅ Token works with /me endpoint');
      } catch (error) {
        console.log('❌ Token failed with /me endpoint:', error.response?.data || error.message);
      }
      
    } else {
      console.log('❌ No LinkedIn token found in database');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
  
  console.log('=====================================\n');
}

diagnoseLinkedInApp(); 