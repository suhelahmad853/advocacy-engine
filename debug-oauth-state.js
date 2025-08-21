const axios = require('axios');
require('dotenv').config();

async function debugOAuthState() {
  console.log('🧪 Debugging OAuth State Parameter Issue\n');
  
  try {
    // Step 1: Test OAuth authorization endpoint
    console.log('1️⃣ Testing OAuth authorization endpoint...');
    const employeeId = '689dc60c7aa8acf3fd914413';
    
    const authResponse = await axios.get(`http://localhost:5000/api/linkedin/oauth/authorize/${employeeId}`, {
      headers: { 
        'Authorization': 'Bearer test-token' // This will be replaced by real auth
      }
    });
    
    console.log('✅ OAuth authorization endpoint working');
    console.log('Response:', {
      authUrl: authResponse.data.authUrl ? 'Present' : 'Missing',
      state: authResponse.data.state ? 'Present' : 'Missing',
      employeeId: authResponse.data.employeeId ? 'Present' : 'Missing'
    });
    
    if (authResponse.data.state) {
      console.log('🔑 State parameter:', authResponse.data.state);
      console.log('🔍 Decoded state:', Buffer.from(authResponse.data.state, 'base64').toString());
    }
    
    // Step 2: Test OAuth callback endpoint
    console.log('\n2️⃣ Testing OAuth callback endpoint...');
    
    // Create a mock OAuth callback request
    const mockCallbackData = {
      code: 'MOCK_AUTH_CODE_123',
      state: authResponse.data.state || 'MOCK_STATE'
    };
    
    try {
      const callbackResponse = await axios.post('http://localhost:5000/api/linkedin/oauth/callback', mockCallbackData);
      console.log('✅ OAuth callback endpoint working');
      console.log('Response:', callbackResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('❌ OAuth callback failed (expected for mock data)');
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
        
        // Check if it's the state parameter error
        if (error.response.data.error && error.response.data.error.includes('state')) {
          console.log('🚨 ISSUE: State parameter validation failing');
        }
      } else {
        console.log('❌ OAuth callback request failed:', error.message);
      }
    }
    
    // Step 3: Check what should happen in the frontend
    console.log('\n3️⃣ Frontend OAuth Flow Analysis:');
    console.log('=====================================');
    console.log('✅ OAuth initiation: GET /api/linkedin/oauth/authorize/:employeeId');
    console.log('✅ State parameter generated and returned');
    console.log('✅ Frontend should store state in localStorage');
    console.log('✅ User redirected to LinkedIn authorization');
    console.log('✅ LinkedIn redirects back to /auth/linkedin/callback');
    console.log('✅ Frontend extracts code and state from URL');
    console.log('✅ Frontend calls POST /api/linkedin/oauth/callback');
    console.log('=====================================');
    
    // Step 4: Common issues and solutions
    console.log('\n4️⃣ Common Issues & Solutions:');
    console.log('=====================================');
    console.log('❌ Issue: State parameter not found');
    console.log('💡 Solution: Check localStorage in browser console');
    console.log('💡 Solution: Verify OAuth flow is not being called multiple times');
    console.log('💡 Solution: Check if state is being cleared prematurely');
    console.log('=====================================');
    
    // Step 5: Manual testing steps
    console.log('\n5️⃣ Manual Testing Steps:');
    console.log('=====================================');
    console.log('1. Open browser console (F12)');
    console.log('2. Go to Application/Storage tab');
    console.log('3. Check localStorage for "linkedin_oauth_state"');
    console.log('4. Initiate OAuth flow from profile page');
    console.log('5. Check if state is stored in localStorage');
    console.log('6. Complete OAuth and check callback');
    console.log('=====================================');
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

debugOAuthState(); 