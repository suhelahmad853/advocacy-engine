// Test LinkedIn API using Node.js built-in fetch instead of axios
async function testLinkedInWithFetch() {
  const accessToken = 'AQUxSOYZhq8G51ds0g74a5noifk9IkDnaem5U_xBV4fvZugfdM12cdiBFRpnLKvxyctTTudVoFvqbcIpLbFciNnC7Wd6E6aATF0iBJP6Z5db2srI5D1z2SfMAdCJOFEVzxeJSLqzKwVXEbd3f5MT8o9OlM5m4ANvjXm2SaDi1Cj-VFlfUorypLNApRnwhEpKmZTyK0_OnE6pl_LHV3klHKJTpk9xZwN5b56oWBOR7WW4tKQ43UAPVeTTBqUjiPKg0-UpB2NdapTLWoJc6qTx4EkZJJh_5Et0nbhFNr-VKDmyVEj1yGXpVIHKqBI2mgUadnwN2ELyIpjs69GWkMGhU2ofGOyv3w';
  
  console.log('🔍 Testing LinkedIn with Node.js Fetch\n');
  
  try {
    console.log('1️⃣ Testing with Node.js built-in fetch...');
    
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'User-Agent': 'SocialCatalyst/1.0'
      }
    });
    
    console.log('✅ Fetch request completed');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Profile ID:', data.sub);
      console.log('Name:', data.name);
      console.log('Email:', data.email);
      console.log('\n🎉 SUCCESS with Node.js fetch!');
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('\n❌ Fetch test failed:', error.message);
  }
}

// Run the test
testLinkedInWithFetch(); 