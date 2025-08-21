const mongoose = require('mongoose');
const linkedinService = require('./server/services/linkedinService');

async function testLinkedInShare() {
  try {
    console.log('🚀 Starting LinkedIn Share Test...\n');
    
    await mongoose.connect('mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findOne({'socialNetworks.linkedin.accessToken': {$exists: true}});
    
    if (!employee) {
      console.log('❌ No employee with LinkedIn token found');
      return;
    }
    
    const linkedin = employee.socialNetworks.linkedin;
    console.log(`\n👤 Testing with employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`   Profile ID: ${linkedin.profileId}`);
    console.log(`   Has Token: ${!!linkedin.accessToken}`);
    console.log(`   Token: ${linkedin.accessToken.substring(0, 20)}...`);
    
    console.log('\n🧪 Test 1: Validating LinkedIn token...');
    try {
      const userInfo = await linkedinService.getUserInfoWithCurl(linkedin.accessToken);
      console.log('✅ Token is valid! User info received');
      console.log('   User ID:', userInfo.sub);
      console.log('   Name:', userInfo.name);
      console.log('   Email:', userInfo.email);
      
      if (userInfo.sub && userInfo.sub !== linkedin.profileId) {
        console.log(`🔄 Updating profile ID from ${linkedin.profileId} to ${userInfo.sub}`);
        employee.socialNetworks.linkedin.profileId = userInfo.sub;
        await employee.save();
        console.log('✅ Profile ID updated in database');
      }
      
    } catch (error) {
      console.log('❌ Token validation failed:', error.message);
      console.log('🔄 Need to refresh token or re-authenticate');
      return;
    }
    
    console.log('\n🧪 Test 2: Sharing content to LinkedIn...');
    
    const testContent = `🚀 Test post from Social Catalyst!\n\nThis is a test to verify LinkedIn integration is working properly.\n\n#SocialCatalyst #TestPost #LinkedInAPI`;
    const authorUrn = `urn:li:member:${linkedin.profileId}`;
    
    console.log('📝 Test content:', testContent);
    console.log('👤 Author URN:', authorUrn);
    
    try {
      const shareResult = await linkedinService.shareContentWithCurl(
        linkedin.accessToken, 
        authorUrn, 
        testContent
      );
      
      console.log('✅ Content shared successfully!');
      console.log('📊 Share result:', shareResult);
      
      if (shareResult.id) {
        console.log('🔗 Post ID:', shareResult.id);
        console.log('🌐 Post URL:', `https://www.linkedin.com/feed/update/${shareResult.id}/`);
      }
      
    } catch (error) {
      console.log('❌ Content sharing failed:', error.message);
      console.log('🔍 Check the error details above');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed and disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

testLinkedInShare();
