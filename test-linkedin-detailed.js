const axios = require('axios');

const ACCESS_TOKEN = 'AQUxSOYZhq8G51ds0g74a5noifk9IkDnaem5U_xBV4fvZugfdM12cdiBFRpnLKvxyctTTudVoFvqbcIpLbFciNnC7Wd6E6aATF0iBJP6Z5db2srI5D1z2SfMAdCJOFEVzxeJSLqzKwVXEbd3f5MT8o9OlM5m4ANvjXm2SaDi1Cj-VFlfUorypLNApRnwhEpKmZTyK0_OnE6pl_LHV3klHKJTpk9xZwN5b56oWBOR7WW4tKQ43UAPVeTTBqUjiPKg0-UpB2NdapTLWoJc6qTx4EkZJJh_5Et0nbhFNr-VKDmyVEj1yGXpVIHKqBI2mgUadnwN2ELyIpjs69GWkMGhU2ofGOyv3w';

async function detailedLinkedInTest() {
  console.log('🔍 Detailed LinkedIn API Test\n');
  
  try {
    console.log('1️⃣ Testing network connectivity...');
    
    // Test basic connectivity first
    const testResponse = await axios.get('https://api.linkedin.com', { timeout: 10000 });
    console.log('✅ LinkedIn API is reachable');
    
    console.log('\n2️⃣ Testing getUserInfo with detailed error handling...');
    
    const userResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'User-Agent': 'SocialCatalyst/1.0'
      },
      timeout: 15000,
      validateStatus: function (status) {
        return status < 500; // Accept all status codes to see the actual response
      }
    });
    
    console.log('✅ API call completed');
    console.log('Status:', userResponse.status);
    console.log('Status Text:', userResponse.statusText);
    console.log('Response Data:', JSON.stringify(userResponse.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Detailed Error Information:');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    
    if (error.response) {
      // Server responded with error status
      console.error('Response Status:', error.response.status);
      console.error('Response Status Text:', error.response.statusText);
      console.error('Response Headers:', error.response.headers);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Request was made but no response received');
      console.error('Request Details:', error.request);
    } else {
      // Something else happened
      console.error('Error setting up request:', error.message);
    }
    
    // Check for specific error types
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🌐 Network Issue: Connection refused');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 DNS Issue: Could not resolve hostname');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n⏰ Timeout Issue: Request took too long');
    }
  }
}

// Run the detailed test
detailedLinkedInTest(); 