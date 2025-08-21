const mongoose = require('mongoose');
require('dotenv').config();

async function checkLinkedInAppConfig() {
  try {
    console.log('🔍 LINKEDIN APP CONFIGURATION CHECK\n');
    console.log('=' .repeat(60));
    
    // 1. Environment Variables
    console.log('📋 1. ENVIRONMENT VARIABLES');
    console.log('-' .repeat(40));
    console.log('LINKEDIN_CLIENT_ID:', process.env.LINKEDIN_CLIENT_ID);
    console.log('LINKEDIN_CLIENT_SECRET:', process.env.LINKEDIN_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('LINKEDIN_REDIRECT_URI:', process.env.LINKEDIN_REDIRECT_URI);
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
    
    // 2. LinkedIn App Status
    console.log('\n📋 2. LINKEDIN APP STATUS');
    console.log('-' .repeat(40));
    console.log('App Name: Advocacy-Engine');
    console.log('Client ID: 77h8ujh2l254wj');
    console.log('App Type: Standalone app');
    console.log('Status: Verified (Aug 18, 2025)');
    console.log('App Type: Software Development; 1-10 employees');
    
    // 3. OAuth Configuration
    console.log('\n📋 3. OAUTH CONFIGURATION');
    console.log('-' .repeat(40));
    console.log('Redirect URI: http://localhost:3000/auth/linkedin/callback');
    console.log('Scopes: openid, profile, w_member_social, email');
    console.log('Token TTL: 2 months (5184000 seconds)');
    
    // 4. Generate OAuth URL with correct scopes
    console.log('\n📋 4. OAUTH URL WITH CORRECT SCOPES');
    console.log('-' .repeat(40));
    
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    const scope = 'openid profile w_member_social email';
    const state = Buffer.from(`config-check-${Date.now()}`).toString('base64');
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    console.log('🔗 OAuth URL:', authUrl);
    console.log('📋 Scopes:', scope);
    console.log('🔑 State:', state);
    
    // 5. LinkedIn App Console Instructions
    console.log('\n📋 5. LINKEDIN APP CONSOLE CHECKS');
    console.log('-' .repeat(40));
    console.log('🚨 CRITICAL CHECKS REQUIRED:');
    console.log('1. Go to: https://www.linkedin.com/developers/apps/77h8ujh2l254wj');
    console.log('2. Check App Roles section:');
    console.log('   - Add your LinkedIn account as Owner/Admin/Developer/Tester');
    console.log('   - Development mode apps only allow App Role users to authenticate');
    console.log('3. Check OAuth 2.0 settings:');
    console.log('   - Verify redirect URI matches exactly');
    console.log('   - Check if app is in Development or Production mode');
    console.log('4. Check for any warnings or restrictions');
    console.log('5. Verify app verification status');
    
    // 6. Test OAuth Endpoints
    console.log('\n📋 6. TEST OAUTH ENDPOINTS');
    console.log('-' .repeat(40));
    
    try {
      // Test OAuth authorization endpoint
      const authResponse = await fetch(`http://localhost:5000/api/linkedin/oauth/authorize/689dc60c7aa8acf3fd914413`);
      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('✅ OAuth authorization endpoint: Working');
        console.log('📋 Generated scopes:', authData.authUrl.includes('openid') ? '✅ openid' : '❌ openid');
        console.log('📋 Generated scopes:', authData.authUrl.includes('profile') ? '✅ profile' : '❌ profile');
        console.log('📋 Generated scopes:', authData.authUrl.includes('w_member_social') ? '✅ w_member_social' : '❌ w_member_social');
        console.log('📋 Generated scopes:', authData.authUrl.includes('email') ? '✅ email' : '❌ email');
      } else {
        console.log('❌ OAuth authorization endpoint: Failed');
      }
    } catch (error) {
      console.log('❌ OAuth authorization endpoint: Error -', error.message);
    }
    
    // 7. Immediate Action Plan
    console.log('\n📋 7. IMMEDIATE ACTION PLAN');
    console.log('-' .repeat(40));
    
    console.log('🎯 STEP 1: Check LinkedIn App Console');
    console.log('   - Visit: https://www.linkedin.com/developers/apps/77h8ujh2l254wj');
    console.log('   - Add your LinkedIn account to App Roles');
    console.log('   - Check if app is in Development mode');
    
    console.log('\n🎯 STEP 2: Test OAuth with App Role User');
    console.log('   - Use the OAuth URL above');
    console.log('   - Ensure you\'re using the LinkedIn account added to App Roles');
    console.log('   - Watch server console for detailed logs');
    
    console.log('\n🎯 STEP 3: If Still Failing');
    console.log('   - Create a new LinkedIn app');
    console.log('   - Add testers immediately');
    console.log('   - Test with minimal scopes first');
    console.log('   - Contact LinkedIn Developer Support');
    
    // 8. Common Issues and Solutions
    console.log('\n📋 8. COMMON ISSUES AND SOLUTIONS');
    console.log('-' .repeat(40));
    
    console.log('🚨 Issue: REVOKED_ACCESS_TOKEN immediately after OAuth');
    console.log('💡 Solution: App is in Development mode - add users to App Roles');
    
    console.log('\n🚨 Issue: Scope mismatch');
    console.log('💡 Solution: Ensure OAuth scopes match app configuration');
    
    console.log('\n🚨 Issue: Redirect URI mismatch');
    console.log('💡 Solution: Verify exact URI matches in both places');
    
    console.log('\n🚨 Issue: App policy violations');
    console.log('💡 Solution: Check app console for warnings, contact support');
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 NEXT STEPS:');
    console.log('1. Check LinkedIn app console for App Roles');
    console.log('2. Add your LinkedIn account to App Roles');
    console.log('3. Test OAuth flow again');
    console.log('4. If still failing, create new app or contact support');
    
  } catch (error) {
    console.error('❌ Config Check Error:', error.message);
    process.exit(1);
  }
}

checkLinkedInAppConfig(); 