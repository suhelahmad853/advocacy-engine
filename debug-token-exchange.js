require('dotenv').config();
const axios = require('axios');
const https = require('https');

// Test the token exchange process
async function testTokenExchange() {
  console.log('🔍 Testing LinkedIn OAuth Token Exchange...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('LINKEDIN_CLIENT_ID:', process.env.LINKEDIN_CLIENT_ID ? '✅ Present' : '❌ Missing');
  console.log('LINKEDIN_CLIENT_SECRET:', process.env.LINKEDIN_CLIENT_SECRET ? '✅ Present' : '❌ Missing');
  console.log('LINKEDIN_REDIRECT_URI:', process.env.LINKEDIN_REDIRECT_URI ? '✅ Present' : '❌ Missing');
  console.log('');
  
  // Test LinkedIn OAuth endpoints
  console.log('🌐 Testing LinkedIn OAuth Endpoints:');
  
  try {
    // Test 1: Check if LinkedIn OAuth endpoint is accessible
    const oauthTest = await axios.get('https://www.linkedin.com/oauth/v2/authorization', {
      params: {
        response_type: 'code',
        client_id: 'test',
        redirect_uri: 'http://localhost:3000/test'
      },
      timeout: 10000,
      validateStatus: () => true // Accept all status codes
    });
    console.log('✅ LinkedIn OAuth endpoint accessible, status:', oauthTest.status);
  } catch (error) {
    console.log('❌ LinkedIn OAuth endpoint test failed:', error.message);
  }
  
  try {
    // Test 2: Check if LinkedIn API endpoint is accessible
    const apiTest = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': 'Bearer test',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      timeout: 10000,
      validateStatus: () => true // Accept all status codes
    });
    console.log('✅ LinkedIn API endpoint accessible, status:', apiTest.status);
  } catch (error) {
    console.log('❌ LinkedIn API endpoint test failed:', error.message);
  }
  
  console.log('');
  console.log('🔧 Manual Testing Instructions:');
  console.log('1. Copy this authorization URL:');
  console.log('https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=77h8ujh2l254wj&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Flinkedin%2Fcallback&scope=openid%20profile%20w_member_social%20email&state=test123');
  console.log('');
  console.log('2. Open it in your browser');
  console.log('3. Complete the LinkedIn authorization');
  console.log('4. Copy the authorization code from the redirect URL');
  console.log('5. Run: node test-token-exchange.js <authorization_code>');
}

// If authorization code is provided as argument, test the exchange
async function testWithCode(authorizationCode) {
  console.log('🔐 Testing token exchange with code:', authorizationCode.substring(0, 10) + '...\n');
  
  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI
  });
  
  console.log('📤 Request details:');
  console.log('URL:', tokenUrl);
  console.log('Client ID:', process.env.LINKEDIN_CLIENT_ID);
  console.log('Redirect URI:', process.env.LINKEDIN_REDIRECT_URI);
  console.log('');
  
  try {
    // Create axios instance with detailed logging
    const axiosInstance = axios.create({
      timeout: 30000,
      maxRedirects: 5,
      httpsAgent: new https.Agent({
        keepAlive: true,
        rejectUnauthorized: false
      }),
      headers: {
        'User-Agent': 'SocialCatalyst/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('🚀 Sending token exchange request...');
    const response = await axiosInstance.post(tokenUrl, params);
    
    console.log('✅ Token exchange successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.access_token) {
      console.log('\n🔑 Testing the access token...');
      await testAccessToken(response.data.access_token);
    }
    
  } catch (error) {
    console.log('❌ Token exchange failed:');
    console.log('Error:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      console.log('Response headers:', JSON.stringify(error.response.headers, null, 2));
    }
  }
}

async function testAccessToken(accessToken) {
  try {
    console.log('🔍 Testing access token with /userinfo endpoint...');
    
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401',
        'User-Agent': 'SocialCatalyst/1.0'
      },
      timeout: 30000,
      validateStatus: () => true
    });
    
    console.log('✅ User info response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Access token test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length > 0) {
  testWithCode(args[0]);
} else {
  testTokenExchange();
} 