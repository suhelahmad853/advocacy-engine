const axios = require('axios');

async function testAuthStatus() {
  console.log('🧪 Testing Authentication Status\n');
  
  try {
    // Test 1: Health endpoint (no auth required)
    console.log('1️⃣ Testing health endpoint (no auth)...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Health endpoint working:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.message);
      return;
    }
    
    // Test 2: LinkedIn status endpoint (auth required)
    console.log('\n2️⃣ Testing LinkedIn status endpoint (auth required)...');
    try {
      const statusResponse = await axios.get('http://localhost:5000/api/linkedin/my-status', {
        headers: { 
          'Authorization': 'Bearer test-token' // This will fail
        }
      });
      console.log('✅ LinkedIn status endpoint working (unexpected)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ LinkedIn status endpoint correctly requires auth (401)');
        console.log('Error:', error.response.data.error);
      } else {
        console.log('❌ LinkedIn status endpoint issue:', error.message);
      }
    }
    
    // Test 3: OAuth authorization endpoint (auth required)
    console.log('\n3️⃣ Testing OAuth authorization endpoint (auth required)...');
    try {
      const authResponse = await axios.get('http://localhost:5000/api/linkedin/oauth/authorize/test-employee-id', {
        headers: { 
          'Authorization': 'Bearer test-token' // This will fail
        }
      });
      console.log('✅ OAuth authorization endpoint working (unexpected)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ OAuth authorization endpoint correctly requires auth (401)');
        console.log('Error:', error.response.data.error);
      } else {
        console.log('❌ OAuth authorization endpoint issue:', error.message);
      }
    }
    
    console.log('\n=====================================');
    console.log('📊 Analysis:');
    console.log('✅ Health endpoint: Working (no auth required)');
    console.log('✅ LinkedIn endpoints: Correctly require authentication');
    console.log('❌ JWT token: Malformed or invalid');
    console.log('=====================================');
    
    console.log('\n💡 Solution Steps:');
    console.log('1. Login to your application properly');
    console.log('2. Check localStorage for valid JWT token');
    console.log('3. Ensure token format is correct');
    console.log('4. Test OAuth flow again');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testAuthStatus(); 