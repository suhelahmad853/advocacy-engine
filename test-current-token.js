const mongoose = require('mongoose');
const linkedinService = require('./server/services/linkedinService');

async function testCurrentToken() {
  try {
    await mongoose.connect('mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findOne({'socialNetworks.linkedin.accessToken': {$exists: true}});
    
    if (!employee) {
      console.log('❌ No employee with LinkedIn token found');
      return;
    }
    
    const linkedin = employee.socialNetworks.linkedin;
    console.log(`\n👤 Testing token for: ${employee.firstName} ${employee.lastName}`);
    console.log(`   Profile ID: ${linkedin.profileId}`);
    console.log(`   Token: ${linkedin.accessToken.substring(0, 20)}...`);
    
    // Test the token by trying to get user info
    console.log('\n🧪 Testing token with LinkedIn API...');
    
    try {
      const userInfo = await linkedinService.getUserInfoWithCurl(linkedin.accessToken);
      console.log('✅ Token is valid! User info:', userInfo);
    } catch (error) {
      console.log('❌ Token test failed:', error.message);
      
      if (error.message.includes('REVOKED_ACCESS_TOKEN') || error.message.includes('401')) {
        console.log('\n🔄 Token is revoked/expired. Need to refresh or re-authenticate.');
        console.log('💡 Solution: Go through OAuth flow again to get a fresh token.');
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCurrentToken(); 