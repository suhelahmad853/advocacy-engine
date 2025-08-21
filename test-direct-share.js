const axios = require('axios');

// Test direct LinkedIn sharing with manual token
async function testDirectShare() {
  try {
    // Use your manual token from the curl test
    const accessToken = 'AQUxSOYZhq8G51ds0g74a5noifk9IkDnaem5U_xBV4fvZugfdM12cdiBFRpnLKvxyctTTudVoFvqbcIpLbFciNnC7Wd6E6aATF0iBJP6Z5db2srI5D1z2SfMAdCJOFEVzxeJSLqzKwVXEbd3eAB3O2gMm7usqh5_sednOJZ77veiClmXWa8gaUc7Vad40F5Vz1pAIuqdyyE9C9HetqEoXDcBXUmUi4GlyxPGLxuI23MQfbzKMWtD0yjNqV73klM1ZFjHXYk-fe9UabNkZoag4Nbzo6Jsy-0gGSYrK1GX9NeWOFtXR5lmzVDw6d3XLM_SFabKYpmvUnj9VFKeQXa6xD_g37SluMMqRSHSF1A';
    
    // Use the correct profile ID
    const profileId = 'OnqfZaA4GM';
    const authorUrn = `urn:li:member:${profileId}`;
    
    console.log('🔗 Testing direct LinkedIn share...');
    console.log('📝 Author URN:', authorUrn);
    console.log('🔑 Access Token:', accessToken.substring(0, 20) + '...');
    
    const postData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: 'Test post from Social Catalyst - Testing direct API access\n\n#SocialCatalyst #Test #LinkedInAPI'
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    console.log('📝 Post data:', JSON.stringify(postData, null, 2));
    
    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      timeout: 30000
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDirectShare(); 