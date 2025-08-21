const axios = require('axios');
require('dotenv').config();

async function testAppPermissions() {
  console.log('🧪 Testing LinkedIn App Permissions\n');
  
  // Test 1: Check if we can reach LinkedIn OAuth endpoints
  console.log('1️⃣ Testing LinkedIn OAuth endpoints...');
  try {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&scope=w_member_social&state=test`;
    
    console.log('✅ OAuth authorization URL generated');
    console.log(`Client ID: ${process.env.LINKEDIN_CLIENT_ID}`);
    console.log(`Redirect URI: ${process.env.LINKEDIN_REDIRECT_URI}`);
    console.log(`Scope: w_member_social`);
    
    // Test if we can reach the authorization endpoint
    const response = await axios.get('https://www.linkedin.com/oauth/v2/authorization', {
      params: {
        response_type: 'code',
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        scope: 'w_member_social',
        state: 'test'
      },
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Accept redirects and client errors
      }
    });
    
    console.log('✅ LinkedIn OAuth endpoint accessible');
    console.log('Status:', response.status);
    
  } catch (error) {
    console.log('❌ LinkedIn OAuth endpoint issue:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
  
  // Test 2: Check if the app can be accessed publicly
  console.log('\n2️⃣ Testing app public access...');
  try {
    // Try to access the app's public information
    const appUrl = `https://www.linkedin.com/developers/apps/${process.env.LINKEDIN_CLIENT_ID}`;
    console.log(`App URL: ${appUrl}`);
    console.log('💡 Try opening this URL in your browser to see app status');
    
  } catch (error) {
    console.log('❌ App access test failed:', error.message);
  }
  
  // Test 3: Check if the issue is with the specific scope
  console.log('\n3️⃣ Testing scope-specific endpoints...');
  try {
    // Test if we can reach LinkedIn API with different scopes
    const testScopes = ['r_liteprofile', 'r_emailaddress', 'w_member_social'];
    
    for (const scope of testScopes) {
      console.log(`\nTesting scope: ${scope}`);
      
      try {
        const scopeUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&scope=${scope}&state=test`;
        console.log(`✅ ${scope} scope URL generated`);
        
        // Test if the scope endpoint is accessible
        const scopeResponse = await axios.get('https://www.linkedin.com/oauth/v2/authorization', {
          params: {
            response_type: 'code',
            client_id: process.env.LINKEDIN_CLIENT_ID,
            redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
            scope: scope,
            state: 'test'
          },
          timeout: 10000,
          validateStatus: function (status) {
            return status < 500;
          }
        });
        
        console.log(`✅ ${scope} scope endpoint accessible (Status: ${scopeResponse.status})`);
        
      } catch (error) {
        console.log(`❌ ${scope} scope endpoint issue:`, error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Scope testing failed:', error.message);
  }
  
  console.log('\n=====================================');
  console.log('📊 Analysis:');
  console.log('If OAuth endpoints are accessible but tokens are revoked:');
  console.log('1. App permissions issue (most likely)');
  console.log('2. Scope approval not complete');
  console.log('3. App verification required');
  console.log('4. User account restrictions');
  
  console.log('\n💡 Next Steps:');
  console.log('1. Check LinkedIn Developer Console for app status');
  console.log('2. Verify w_member_social scope is fully approved');
  console.log('3. Check for any verification requirements');
  console.log('4. Try with a different LinkedIn account');
  
}

testAppPermissions(); 