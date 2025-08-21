const axios = require('axios');

async function quickLinkedInTest() {
  console.log('🧪 Quick LinkedIn Connectivity Test\n');
  
  try {
    // Test basic LinkedIn connectivity
    console.log('1️⃣ Testing LinkedIn.com connectivity...');
    const linkedinResponse = await axios.get('https://www.linkedin.com', { timeout: 10000 });
    console.log('✅ LinkedIn.com is accessible');
    
    // Test LinkedIn API endpoint
    console.log('\n2️⃣ Testing LinkedIn API endpoint...');
    const apiResponse = await axios.get('https://api.linkedin.com/v2', { timeout: 10000 });
    console.log('✅ LinkedIn API endpoint is accessible');
    
    // Test OAuth endpoint
    console.log('\n3️⃣ Testing LinkedIn OAuth endpoint...');
    const oauthResponse = await axios.get('https://www.linkedin.com/oauth/v2', { timeout: 10000 });
    console.log('✅ LinkedIn OAuth endpoint is accessible');
    
    console.log('\n🎉 All LinkedIn endpoints are accessible!');
    console.log('💡 If you\'re still getting token errors, the issue is in your app configuration.');
    
  } catch (error) {
    console.log('❌ LinkedIn connectivity issue:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

quickLinkedInTest(); 