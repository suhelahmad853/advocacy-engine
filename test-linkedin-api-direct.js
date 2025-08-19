const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');

// Import models
const Employee = require('./server/models/Employee');
const Content = require('./server/models/Content');
const linkedinService = require('./server/services/linkedinService');

async function testLinkedInAPIDirect() {
  try {
    console.log('🧪 Testing LinkedIn API Directly\n');
    
    // Get employee with LinkedIn data
    const employee = await Employee.findOne();
    if (!employee) {
      console.log('❌ No employee found');
      return;
    }
    
    console.log('👤 Employee:', employee.firstName, employee.lastName);
    console.log('LinkedIn Profile ID:', employee.socialNetworks.linkedin.profileId);
    console.log('LinkedIn Access Token:', employee.socialNetworks.linkedin.accessToken ? '✅ Present' : '❌ Missing');
    
    // Get content to share
    const content = await Content.findOne({ 'sharingData.isApproved': true, status: 'published' });
    if (!content) {
      console.log('❌ No approved content found');
      return;
    }
    
    console.log('📝 Content:', content.title);
    
    // Test LinkedIn API step by step
    console.log('\n🔗 Step 1: Testing getUserInfo...');
    try {
      const userInfo = await linkedinService.getUserInfo(employee.socialNetworks.linkedin.accessToken);
      console.log('✅ getUserInfo SUCCESS');
      console.log('Profile ID from API:', userInfo.sub);
      console.log('Name:', userInfo.name);
    } catch (error) {
      console.log('❌ getUserInfo FAILED:', error.message);
      return;
    }
    
    console.log('\n📤 Step 2: Testing shareContent...');
    try {
      const postContent = `Test post: ${content.title}\n\n${content.description}\n\n#SocialCatalyst #EmployeeAdvocacy #Innovation`;
      
      console.log('Post content length:', postContent.length);
      console.log('Author URN:', `urn:li:person:${employee.socialNetworks.linkedin.profileId}`);
      
      const shareResult = await linkedinService.shareContent(
        employee.socialNetworks.linkedin.accessToken,
        `urn:li:person:${employee.socialNetworks.linkedin.profileId}`,
        postContent
      );
      
      console.log('✅ shareContent SUCCESS!');
      console.log('LinkedIn Post ID:', shareResult.id);
      
    } catch (error) {
      console.log('❌ shareContent FAILED:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testLinkedInAPIDirect(); 