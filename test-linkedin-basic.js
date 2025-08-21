const axios = require('axios');

async function testLinkedInBasic() {
  console.log('🧪 Basic LinkedIn API Connectivity Test\n');
  
  try {
    // Test 1: Basic LinkedIn.com connectivity
    console.log('1️⃣ Testing LinkedIn.com connectivity...');
    const linkedinResponse = await axios.get('https://www.linkedin.com', { timeout: 10000 });
    console.log('✅ LinkedIn.com is accessible');
    console.log('Status:', linkedinResponse.status);
    
    // Test 2: LinkedIn API endpoint (without auth)
    console.log('\n2️⃣ Testing LinkedIn API endpoint (without auth)...');
    try {
      const apiResponse = await axios.get('https://api.linkedin.com/v2', { timeout: 10000 });
      console.log('✅ LinkedIn API endpoint is accessible');
      console.log('Status:', apiResponse.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ LinkedIn API endpoint is accessible (401 expected without auth)');
        console.log('Response:', error.response.data);
      } else {
        console.log('❌ LinkedIn API endpoint issue:', error.message);
      }
    }
    
    // Test 3: LinkedIn OAuth endpoint
    console.log('\n3️⃣ Testing LinkedIn OAuth endpoint...');
    try {
      const oauthResponse = await axios.get('https://www.linkedin.com/oauth/v2', { timeout: 10000 });
      console.log('✅ LinkedIn OAuth endpoint is accessible');
      console.log('Status:', oauthResponse.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ LinkedIn OAuth endpoint is accessible (401 expected without auth)');
        console.log('Response:', error.response.data);
      } else {
        console.log('❌ LinkedIn OAuth endpoint issue:', error.message);
      }
    }
    
    // Test 4: Test with a mock token to see error format
    console.log('\n4️⃣ Testing with mock token to see error format...');
    try {
      const mockTokenResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': 'Bearer MOCK_TOKEN_123',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        timeout: 10000
      });
      console.log('✅ Mock token test successful (unexpected)');
    } catch (error) {
      if (error.response) {
        console.log('✅ Mock token test failed as expected');
        console.log('Status:', error.response.status);
        console.log('Error Code:', error.response.data?.serviceErrorCode);
        console.log('Error Message:', error.response.data?.message);
        
        // This tells us what error format to expect
        if (error.response.data?.serviceErrorCode === 65604) {
          console.log('✅ Error format: EMPTY_ACCESS_TOKEN (expected for mock token)');
        }
      } else {
        console.log('❌ Mock token test failed unexpectedly:', error.message);
      }
    }
    
    console.log('\n=====================================');
    console.log('📊 Summary:');
    console.log('If all endpoints are accessible, the issue is likely:');
    console.log('1. User account restrictions');
    console.log('2. LinkedIn app permissions (though config looks correct)');
    console.log('3. Token exchange process issues');
    console.log('4. User privacy settings');
    
  } catch (error) {
    console.log('❌ Basic connectivity test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testLinkedInBasic(); 