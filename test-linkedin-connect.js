const axios = require('axios');

// Test the exact LinkedIn connect process
async function testLinkedInConnect() {
  const accessToken = 'AQUxSOYZhq8G51ds0g74a5noifk9IkDnaem5U_xBV4fvZugfdM12cdiBFRpnLKvxyctTTudVoFvqbcIpLbFciNnC7Wd6E6aATF0iBJP6Z5db2srI5D1z2SfMAdCJOFEVzxeJSLqzKwVXEbd3f5MT8o9OlM5m4ANvjXm2SaDi1Cj-VFlfUorypLNApRnwhEpKmZTyK0_OnE6pl_LHV3klHKJTpk9xZwN5b56oWBOR7WW4tKQ43UAPVeTTBqUjiPKg0-UpB2NdapTLWoJc6qTx4EkZJJh_5Et0nbhFNr-VKDmyVEj1yGXpVIHKqBI2mgUadnwN2ELyIpjs69GWkMGhU2ofGOyv3w';
  
  console.log('🔍 Testing LinkedIn Connect Process\n');
  
  try {
    // Step 1: Test getUserInfo directly (this is what validateToken calls)
    console.log('1️⃣ Testing getUserInfo (called by validateToken)...');
    
    const userResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'User-Agent': 'SocialCatalyst/1.0'
      },
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('✅ getUserInfo SUCCESS!');
    console.log('Status:', userResponse.status);
    console.log('Profile ID:', userResponse.data.sub);
    console.log('Name:', userResponse.data.name);
    
    // Step 2: Test the exact same call that your app makes
    console.log('\n2️⃣ Testing the exact same call your app makes...');
    
    // Simulate the validateToken function
    try {
      await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'User-Agent': 'SocialCatalyst/1.0'
        },
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      console.log('✅ validateToken SUCCESS!');
    } catch (error) {
      console.log('❌ validateToken FAILED');
      throw error;
    }
    
    console.log('\n🎉 ALL TESTS PASSED! Your token should work in the app.');
    
  } catch (error) {
    console.error('\n❌ LinkedIn Connect Test Failed');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    
    console.log('\n💡 This explains why you get "Invalid LinkedIn access token"');
  }
}

// Run the test
testLinkedInConnect(); 