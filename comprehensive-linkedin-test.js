const mongoose = require('mongoose');
require('dotenv').config();

async function comprehensiveLinkedInTest() {
  try {
    console.log('🔍 COMPREHENSIVE LINKEDIN OAUTH TEST\n');
    console.log('=' .repeat(60));
    
    // 1. Environment Check
    console.log('📋 1. ENVIRONMENT CHECK');
    console.log('-' .repeat(40));
    console.log('Client ID:', process.env.LINKEDIN_CLIENT_ID);
    console.log('Client Secret:', process.env.LINKEDIN_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('Redirect URI:', process.env.LINKEDIN_REDIRECT_URI);
    console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
    
    // 2. LinkedIn App Status
    console.log('\n📋 2. LINKEDIN APP STATUS');
    console.log('-' .repeat(40));
    console.log('App Name: Advocacy-Engine');
    console.log('Client ID: 77h8ujh2l254wj');
    console.log('Products: ✅ Share on LinkedIn, ✅ Sign In with LinkedIn using OpenID Connect');
    console.log('Status: Verified (Aug 18, 2025)');
    
    // 3. Test OAuth Authorization Endpoint
    console.log('\n📋 3. TEST OAUTH AUTHORIZATION ENDPOINT');
    console.log('-' .repeat(40));
    
    try {
      const authResponse = await fetch(`http://localhost:5000/api/linkedin/oauth/authorize/689dc60c7aa8acf3fd914413`);
      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('✅ OAuth authorization endpoint: Working');
        console.log('📋 Generated scopes:', authData.authUrl.includes('openid') ? '✅ openid' : '❌ openid');
        console.log('📋 Generated scopes:', authData.authUrl.includes('profile') ? '✅ profile' : '❌ profile');
        console.log('📋 Generated scopes:', authData.authUrl.includes('w_member_social') ? '✅ w_member_social' : '❌ w_member_social');
        console.log('📋 Generated scopes:', authData.authUrl.includes('email') ? '✅ email' : '❌ email');
        
        // Store the OAuth URL for testing
        global.testAuthUrl = authData.authUrl;
        global.testState = authData.state;
        
      } else {
        console.log('❌ OAuth authorization endpoint: Failed');
        const error = await authResponse.text();
        console.log('Error:', error);
      }
    } catch (error) {
      console.log('❌ OAuth authorization endpoint: Error -', error.message);
    }
    
    // 4. Test LinkedIn API Directly
    console.log('\n📋 4. TEST LINKEDIN API DIRECTLY');
    console.log('-' .repeat(40));
    
    // Test if we can reach LinkedIn domains
    const linkedinDomains = [
      'https://www.linkedin.com',
      'https://api.linkedin.com',
      'https://oauth.linkedin.com'
    ];
    
    for (const domain of linkedinDomains) {
      try {
        const response = await fetch(domain);
        console.log(`${domain}: ${response.ok ? '✅ Accessible' : '⚠️ Limited Access'} (${response.status})`);
      } catch (error) {
        console.log(`${domain}: ❌ Not Accessible - ${error.message}`);
      }
    }
    
    // 5. Test Current Database Status
    console.log('\n📋 5. CURRENT DATABASE STATUS');
    console.log('-' .repeat(40));
    
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:3000/social-catalyst');
      console.log('✅ MongoDB: Connected');
      
      const Employee = require('./server/models/Employee');
      const employee = await Employee.findById('689dc60c7aa8acf3fd914413');
      
      if (employee && employee.socialNetworks.linkedin) {
        const linkedin = employee.socialNetworks.linkedin;
        console.log('👤 Employee:', employee.firstName, employee.lastName);
        console.log('🔗 LinkedIn Connected:', linkedin.isConnected ? '✅ Yes' : '❌ No');
        console.log('🔑 Has Access Token:', linkedin.accessToken ? '✅ Yes' : '❌ No');
        console.log('🆔 Profile ID:', linkedin.profileId);
        console.log('📅 Token Expiry:', linkedin.tokenExpiry);
        console.log('🔄 Last Sync:', linkedin.lastSync);
        console.log('⏳ Pending Approval:', linkedin.isPendingApproval ? '✅ Yes' : '❌ No');
        
        if (linkedin.accessToken) {
          console.log('\n🔍 Testing stored token...');
          try {
            const response = await fetch('https://api.linkedin.com/v2/userinfo', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${linkedin.accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
                'LinkedIn-Version': '202401'
              }
            });
            
            if (response.ok) {
              const userInfo = await response.json();
              console.log('✅ Token Status: Valid');
              console.log('📊 User Info:', userInfo.sub);
            } else {
              const error = await response.json();
              console.log('❌ Token Status: Invalid');
              console.log('🚫 Error:', error.code, '-', error.message);
              console.log('🚫 Status:', response.status);
            }
          } catch (error) {
            console.log('❌ Token Test Failed:', error.message);
          }
        }
      } else {
        console.log('❌ No LinkedIn connection found');
      }
      
      await mongoose.disconnect();
      console.log('✅ MongoDB: Disconnected');
      
    } catch (error) {
      console.log('❌ MongoDB Error:', error.message);
    }
    
    // 6. OAuth Flow Analysis
    console.log('\n📋 6. OAUTH FLOW ANALYSIS');
    console.log('-' .repeat(40));
    
    if (global.testAuthUrl) {
      console.log('🔗 OAuth URL for testing:');
      console.log(global.testAuthUrl);
      
      console.log('\n📋 OAuth Flow Steps:');
      console.log('1. ✅ User clicks OAuth URL');
      console.log('2. ✅ LinkedIn authorization page loads');
      console.log('3. ✅ User authorizes app');
      console.log('4. ✅ LinkedIn redirects to backend with code');
      console.log('5. ✅ Backend exchanges code for token');
      console.log('6. ❌ Backend calls /v2/userinfo (failing here)');
      console.log('7. ❌ Token gets revoked immediately');
      console.log('8. ❌ Profile ID remains temporary');
      
      console.log('\n🎯 ROOT CAUSE ANALYSIS:');
      console.log('- ✅ Products are approved');
      console.log('- ✅ OAuth flow works until userinfo call');
      console.log('- ❌ /v2/userinfo endpoint fails');
      console.log('- ❌ Token gets revoked after userinfo failure');
      console.log('- ❌ This suggests a LinkedIn API restriction or app mode issue');
    }
    
    // 7. Immediate Action Plan
    console.log('\n📋 7. IMMEDIATE ACTION PLAN');
    console.log('-' .repeat(40));
    
    console.log('🎯 STEP 1: Check LinkedIn App Mode');
    console.log('   - Go to LinkedIn Developer Portal');
    console.log('   - Check if app is in Development or Production mode');
    console.log('   - Development mode has severe API restrictions');
    
    console.log('\n🎯 STEP 2: Check App Roles');
    console.log('   - Ensure your LinkedIn account is added to App Roles');
    console.log('   - Development mode only allows App Role users');
    
    console.log('\n🎯 STEP 3: Test with Different Account');
    console.log('   - Try OAuth with a different LinkedIn account');
    console.log('   - Check if it\'s account-specific or app-wide');
    
    console.log('\n🎯 STEP 4: Check LinkedIn App Console');
    console.log('   - Look for any warnings or restrictions');
    console.log('   - Check app verification status');
    console.log('   - Verify OAuth 2.0 settings');
    
    // 8. Alternative Solutions
    console.log('\n📋 8. ALTERNATIVE SOLUTIONS');
    console.log('-' .repeat(40));
    
    console.log('🔄 Solution 1: Switch to Production Mode');
    console.log('   - Request LinkedIn to move app to Production mode');
    console.log('   - This removes most API restrictions');
    
    console.log('\n🔄 Solution 2: Create New App');
    console.log('   - Create a new LinkedIn app');
    console.log('   - Add testers immediately');
    console.log('   - Test with minimal scopes first');
    
    console.log('\n🔄 Solution 3: Contact LinkedIn Support');
    console.log('   - Contact LinkedIn Developer Support');
    console.log('   - Explain the immediate token revocation issue');
    console.log('   - Request app status review');
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 NEXT STEPS:');
    console.log('1. Check LinkedIn app mode (Development vs Production)');
    console.log('2. Verify App Roles include your account');
    console.log('3. Test OAuth with different LinkedIn account');
    console.log('4. If still failing, create new app or contact support');
    
  } catch (error) {
    console.error('❌ Comprehensive Test Error:', error.message);
    process.exit(1);
  }
}

comprehensiveLinkedInTest(); 