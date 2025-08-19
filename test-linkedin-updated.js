// Test the updated LinkedIn service
const linkedinService = require('./server/services/linkedinService');

async function testUpdatedLinkedInService() {
  const accessToken = 'AQUxSOYZhq8G51ds0g74a5noifk9IkDnaem5U_xBV4fvZugfdM12cdiBFRpnLKvxyctTTudVoFvqbcIpLbFciNnC7Wd6E6aATF0iBJP6Z5db2srI5D1z2SfMAdCJOFEVzxeJSLqzKwVXEbd3f5MT8o9OlM5m4ANvjXm2SaDi1Cj-VFlfUorypLNApRnwhEpKmZTyK0_OnE6pl_LHV3klHKJTpk9xZwN5b56oWBOR7WW4tKQ43UAPVeTTBqUjiPKg0-UpB2NdapTLWoJc6qTx4EkZJJh_5Et0nbhFNr-VKDmyVEj1yGXpVIHKqBI2mgUadnwN2ELyIpjs69GWkMGhU2ofGOyv3w';
  
  console.log('🔍 Testing Updated LinkedIn Service\n');
  
  try {
    console.log('1️⃣ Testing getUserInfo with updated service...');
    
    const userInfo = await linkedinService.getUserInfo(accessToken);
    
    console.log('✅ getUserInfo SUCCESS!');
    console.log('Profile ID:', userInfo.sub);
    console.log('Name:', userInfo.name);
    console.log('Email:', userInfo.email);
    
    console.log('\n2️⃣ Testing validateToken...');
    
    const isValid = await linkedinService.validateToken(accessToken);
    console.log('✅ validateToken result:', isValid);
    
    console.log('\n🎉 Updated LinkedIn service is working!');
    console.log('You can now connect LinkedIn in your app.');
    
  } catch (error) {
    console.error('\n❌ Updated LinkedIn service test failed');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

// Run the test
testUpdatedLinkedInService(); 