const mongoose = require('mongoose');
require('dotenv').config();

async function fixLinkedInAppConfig() {
  try {
    console.log('🔧 FIXING LINKEDIN APP CONFIGURATION\n');
    console.log('=' .repeat(60));
    
    // 1. Check current environment
    console.log('📋 1. CURRENT ENVIRONMENT CHECK');
    console.log('-' .repeat(40));
    console.log('Client ID:', process.env.LINKEDIN_CLIENT_ID);
    console.log('Redirect URI:', process.env.LINKEDIN_REDIRECT_URI);
    console.log('Server URL:', process.env.SERVER_URL || 'http://localhost:5000');
    console.log('Client URL:', process.env.CLIENT_URL || 'http://localhost:3000');
    
    // 2. Generate OAuth URLs with different scope combinations
    console.log('\n📋 2. OAUTH URLS WITH DIFFERENT SCOPES');
    console.log('-' .repeat(40));
    
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    const state = Buffer.from(`fix-${Date.now()}`).toString('base64');
    
    const scopeCombinations = [
      { name: 'Minimal (w_member_social only)', scope: 'w_member_social' },
      { name: 'Basic (w_member_social + openid)', scope: 'w_member_social openid' },
      { name: 'Standard (w_member_social + openid + profile)', scope: 'w_member_social openid profile' },
      { name: 'Full (w_member_social + openid + profile + email)', scope: 'w_member_social openid profile email' }
    ];
    
    for (const combo of scopeCombinations) {
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(combo.scope)}&state=${state}`;
      
      console.log(`\n🔗 ${combo.name}:`);
      console.log(`   Scopes: ${combo.scope}`);
      console.log(`   URL: ${authUrl}`);
    }
    
    // 3. Test minimal scope first
    console.log('\n📋 3. TESTING MINIMAL SCOPE FIRST');
    console.log('-' .repeat(40));
    
    const minimalScope = 'w_member_social';
    const minimalAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(minimalScope)}&state=${state}`;
    
    console.log('🎯 RECOMMENDED: Start with minimal scope');
    console.log('📋 Scope:', minimalScope);
    console.log('🔗 URL:', minimalAuthUrl);
    
    // 4. Check LinkedIn app status
    console.log('\n📋 4. LINKEDIN APP STATUS CHECK');
    console.log('-' .repeat(40));
    console.log('🚨 CRITICAL ISSUES TO CHECK:');
    console.log('1. Go to: https://www.linkedin.com/developers/apps/77h8ujh2l254wj');
    console.log('2. Check if app shows any warnings or restrictions');
    console.log('3. Verify OAuth 2.0 settings are correct');
    console.log('4. Check if app has any policy violations');
    console.log('5. Verify redirect URI matches exactly');
    
    // 5. Alternative solutions
    console.log('\n📋 5. ALTERNATIVE SOLUTIONS');
    console.log('-' .repeat(40));
    
    console.log('🔄 Solution 1: Test with minimal scope (w_member_social only)');
    console.log('   - This scope is specifically for posting content');
    console.log('   - Less likely to trigger policy violations');
    console.log('   - Should work for basic content sharing');
    
    console.log('\n🔄 Solution 2: Check LinkedIn app restrictions');
    console.log('   - App may be in "Development" mode');
    console.log('   - May need additional verification');
    console.log('   - Check for any policy warnings');
    
    console.log('\n🔄 Solution 3: Test with different LinkedIn account');
    console.log('   - Current account may have restrictions');
    console.log('   - Try with a different LinkedIn profile');
    console.log('   - Check if it\'s an account-specific issue');
    
    // 6. Immediate action plan
    console.log('\n📋 6. IMMEDIATE ACTION PLAN');
    console.log('-' .repeat(40));
    
    console.log('🎯 STEP 1: Test minimal scope OAuth');
    console.log(`   Copy this URL: ${minimalAuthUrl}`);
    console.log('   Open in incognito/private browser');
    console.log('   Complete OAuth flow');
    console.log('   Watch server logs for results');
    
    console.log('\n🎯 STEP 2: Check LinkedIn app console');
    console.log('   Visit: https://www.linkedin.com/developers/apps/77h8ujh2l254wj');
    console.log('   Look for any warnings or restrictions');
    console.log('   Verify OAuth 2.0 settings');
    
    console.log('\n🎯 STEP 3: Test content sharing');
    console.log('   If OAuth succeeds, test content sharing');
    console.log('   Use the test endpoint: /api/linkedin/test-share');
    
    // 7. Create a test script for minimal scope
    console.log('\n📋 7. CREATING TEST SCRIPT');
    console.log('-' .repeat(40));
    
    const testScript = `
// Test script for minimal scope OAuth
const testMinimalOAuth = async () => {
  const clientId = '${clientId}';
  const redirectUri = '${redirectUri}';
  const scope = '${minimalScope}';
  const state = '${state}';
  
  const authUrl = \`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=\${clientId}&redirect_uri=\${encodeURIComponent(redirectUri)}&scope=\${encodeURIComponent(scope)}&state=\${state}\`;
  
  console.log('🔗 Minimal OAuth URL:', authUrl);
  console.log('📋 Scope:', scope);
  console.log('🎯 Use this URL to test OAuth with minimal permissions');
};

testMinimalOAuth();
`;
    
    console.log('✅ Test script created');
    console.log('📝 Copy the script above to test minimal scope OAuth');
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 NEXT STEPS:');
    console.log('1. Test minimal scope OAuth first');
    console.log('2. Check LinkedIn app console for issues');
    console.log('3. Verify OAuth 2.0 settings');
    console.log('4. Test with different LinkedIn account if needed');
    console.log('5. Contact LinkedIn support if issues persist');
    
  } catch (error) {
    console.error('❌ Fix Error:', error.message);
    process.exit(1);
  }
}

fixLinkedInAppConfig(); 