const mongoose = require('mongoose');
require('dotenv').config();

async function testMinimalOAuth() {
  try {
    console.log('🧪 TESTING MINIMAL SCOPE OAUTH\n');
    console.log('=' .repeat(50));
    
    // Generate minimal scope OAuth URL
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    const scope = 'w_member_social'; // Minimal scope only
    const state = Buffer.from(`minimal-test-${Date.now()}`).toString('base64');
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    console.log('🎯 MINIMAL SCOPE OAUTH TEST');
    console.log('-' .repeat(30));
    console.log('📋 Scope:', scope);
    console.log('📋 State:', state);
    console.log('📋 Employee ID: 689dc60c7aa8acf3fd914413');
    
    console.log('\n🔗 OAUTH URL:');
    console.log(authUrl);
    
    console.log('\n📋 INSTRUCTIONS:');
    console.log('1. Copy the OAuth URL above');
    console.log('2. Open it in an incognito/private browser window');
    console.log('3. Complete the LinkedIn authorization');
    console.log('4. Watch the server console for detailed logs');
    console.log('5. Check if you get a real profile ID or linkedin_* ID');
    
    console.log('\n💡 EXPECTED BEHAVIOR:');
    console.log('✅ OAuth completes successfully');
    console.log('✅ Access token is generated');
    console.log('⚠️ Profile ID may be temporary (linkedin_*) due to minimal scope');
    console.log('✅ Content sharing should work with the generated token');
    
    console.log('\n🔍 WHAT TO WATCH FOR:');
    console.log('1. Server logs showing OAuth callback');
    console.log('2. Token exchange success');
    console.log('3. Profile ID generation (real or temporary)');
    console.log('4. Any error messages');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Test the OAuth flow with the URL above');
    console.log('2. Check server console output');
    console.log('3. Verify if content sharing works');
    console.log('4. Report back with the results');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
}

testMinimalOAuth(); 