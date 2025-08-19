const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');

// Import models
const Content = require('./server/models/Content');
const Employee = require('./server/models/Employee');
const linkedinService = require('./server/services/linkedinService');

async function debugLinkedInSharing() {
  try {
    console.log('🧪 Debugging LinkedIn Sharing Step by Step\n');
    
    // Step 1: Get content
    console.log('1️⃣ Getting content...');
    const content = await Content.findOne({ 'sharingData.isApproved': true, status: 'published' });
    if (!content) {
      console.log('❌ No approved content found');
      return;
    }
    console.log('✅ Content found:', content.title);
    console.log('Content ID:', content._id);
    console.log('Approved:', content.sharingData.isApproved);
    
    // Step 2: Get employee
    console.log('\n2️⃣ Getting employee...');
    const employee = await Employee.findOne();
    if (!employee) {
      console.log('❌ No employee found');
      return;
    }
    console.log('✅ Employee found:', employee.firstName, employee.lastName);
    console.log('LinkedIn connected:', employee.socialNetworks.linkedin.isConnected);
    
    if (!employee.socialNetworks.linkedin.isConnected) {
      console.log('❌ LinkedIn not connected');
      return;
    }
    
    // Step 3: Check LinkedIn data
    console.log('\n3️⃣ Checking LinkedIn data...');
    console.log('Profile ID:', employee.socialNetworks.linkedin.profileId);
    console.log('Access Token:', employee.socialNetworks.linkedin.accessToken ? '✅ Present' : '❌ Missing');
    console.log('Profile URL:', employee.socialNetworks.linkedin.profileUrl);
    
    if (!employee.socialNetworks.linkedin.accessToken) {
      console.log('❌ LinkedIn access token missing - need to reconnect');
      return;
    }
    
    if (!employee.socialNetworks.linkedin.profileId) {
      console.log('❌ LinkedIn profile ID missing - need to reconnect');
      return;
    }
    
    // Step 4: Test LinkedIn API
    console.log('\n4️⃣ Testing LinkedIn API...');
    try {
      const userInfo = await linkedinService.getUserInfo(employee.socialNetworks.linkedin.accessToken);
      console.log('✅ LinkedIn API test successful');
      console.log('Profile ID from API:', userInfo.sub);
      
      // Step 5: Test content sharing
      console.log('\n5️⃣ Testing content sharing...');
      const postContent = `Test post: ${content.title}\n\n${content.description}\n\n#SocialCatalyst #EmployeeAdvocacy #Innovation`;
      
      console.log('Post content:', postContent);
      console.log('Author URN:', `urn:li:person:${employee.socialNetworks.linkedin.profileId}`);
      
      const shareResult = await linkedinService.shareContent(
        employee.socialNetworks.linkedin.accessToken,
        `urn:li:person:${employee.socialNetworks.linkedin.profileId}`,
        postContent
      );
      
      console.log('✅ Content shared successfully!');
      console.log('LinkedIn Post ID:', shareResult.id);
      
    } catch (error) {
      console.error('❌ LinkedIn API test failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the debug
debugLinkedInSharing(); 