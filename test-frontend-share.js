const axios = require('axios');

async function testFrontendShare() {
  try {
    console.log('🧪 Testing Frontend Content Sharing\n');
    
    // Test the LinkedIn share endpoint
    const shareData = {
      contentId: '68a4760c4b5a9f598293fb53', // Content ID from our test
      customMessage: '🚀 Testing frontend content sharing from Social Catalyst!'
    };
    
    console.log('📝 Share data:', shareData);
    console.log('🔗 Calling LinkedIn share endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/linkedin/share', shareData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will be replaced by real auth in frontend
      }
    });
    
    console.log('✅ Content sharing successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Content sharing failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testFrontendShare(); 