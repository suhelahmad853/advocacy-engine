const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');

// Import models
const Content = require('./server/models/Content');
const Employee = require('./server/models/Employee');
const linkedinService = require('./server/services/linkedinService');

async function testLinkedInSharing() {
  try {
    console.log('🧪 Testing LinkedIn Sharing Directly\n');
    
    // Get the first content item
    const content = await Content.findOne({ 'sharingData.isApproved': true, status: 'published' });
    if (!content) {
      console.log('❌ No approved content found in database');
      return;
    }
    
    console.log('📝 Found content:', content.title);
    console.log('Content ID:', content._id);
    console.log('Status:', content.status);
    console.log('Approved:', content.sharingData.isApproved);
    
    // Get the first employee (for testing)
    const employee = await Employee.findOne();
    if (!employee) {
      console.log('❌ No employees found in database');
      return;
    }
    
    console.log('\n👤 Found employee:', employee.firstName, employee.lastName);
    console.log('LinkedIn connected:', employee.socialNetworks.linkedin.isConnected);
    
    if (!employee.socialNetworks.linkedin.isConnected) {
      console.log('❌ Employee LinkedIn not connected');
      return;
    }
    
    console.log('LinkedIn Profile ID:', employee.socialNetworks.linkedin.profileId);
    console.log('LinkedIn Access Token:', employee.socialNetworks.linkedin.accessToken ? '✅ Present' : '❌ Missing');
    
    // Test LinkedIn API call
    console.log('\n🔗 Testing LinkedIn API call...');
    
    try {
      const userInfo = await linkedinService.getUserInfo(employee.socialNetworks.linkedin.accessToken);
      console.log('✅ LinkedIn API test successful');
      console.log('Profile ID from API:', userInfo.sub);
      
      // Test content sharing
      console.log('\n📤 Testing content sharing...');
      
      const postContent = `Test post: ${content.title}\n\n${content.description}\n\n#SocialCatalyst #EmployeeAdvocacy #Innovation`;
      
      const shareResult = await linkedinService.shareContent(
        employee.socialNetworks.linkedin.accessToken,
        `urn:li:person:${employee.socialNetworks.linkedin.profileId}`,
        postContent
      );
      
      console.log('✅ Content shared successfully!');
      console.log('LinkedIn Post ID:', shareResult.id);
      
    } catch (error) {
      console.error('❌ LinkedIn API test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testLinkedInSharing(); 