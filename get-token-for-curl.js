const mongoose = require('mongoose');
require('dotenv').config();

async function getTokenForCurl() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findOne({'socialNetworks.linkedin.accessToken': {$exists: true}});
    
    if (!employee) {
      console.log('❌ No employee with LinkedIn token found');
      return;
    }
    
    const token = employee.socialNetworks.linkedin.accessToken;
    console.log(`👤 Employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`🔑 Access Token: ${token}`);
    console.log(`🆔 Profile ID: ${employee.socialNetworks.linkedin.profileId}`);
    
    console.log('\n📋 Curl Commands to Test:');
    console.log('=====================================');
    console.log('\n1️⃣ Test User Info:');
    console.log(`curl --location 'https://api.linkedin.com/v2/userinfo' \\`);
    console.log(`  --header 'Authorization: Bearer ${token}' \\`);
    console.log(`  --header 'X-Restli-Protocol-Version: 2.0.0'`);
    
    console.log('\n2️⃣ Test Profile:');
    console.log(`curl --location 'https://api.linkedin.com/v2/me' \\`);
    console.log(`  --header 'Authorization: Bearer ${token}' \\`);
    console.log(`  --header 'X-Restli-Protocol-Version: 2.0.0'`);
    
    console.log('\n3️⃣ Test Content Sharing:');
    console.log(`curl --location 'https://api.linkedin.com/v2/ugcPosts' \\`);
    console.log(`  --header 'Authorization: Bearer ${token}' \\`);
    console.log(`  --header 'Content-Type: application/json' \\`);
    console.log(`  --header 'X-Restli-Protocol-Version: 2.0.0' \\`);
    console.log(`  --data '{"author":"urn:li:member:${employee.socialNetworks.linkedin.profileId}","lifecycleState":"PUBLISHED","specificContent":{"com.linkedin.ugc.ShareContent":{"shareCommentary":{"text":"Test post from Social Catalyst - Testing direct API access\\n\\n#SocialCatalyst #Test #LinkedInAPI"},"shareMediaCategory":"NONE"}},"visibility":{"com.linkedin.ugc.MemberNetworkVisibility":"PUBLIC"}}'`);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getTokenForCurl(); 