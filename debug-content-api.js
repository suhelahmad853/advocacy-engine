const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');

// Import models
const Content = require('./server/models/Content');

async function debugContentAPI() {
  try {
    console.log('🔍 Debugging Content API\n');
    
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    const dbState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log('Database state:', states[dbState]);
    
    // Test 2: Check if Content model works
    console.log('\n2️⃣ Testing Content model...');
    const ContentModel = mongoose.model('Content');
    console.log('✅ Content model loaded successfully');
    
    // Test 3: Try to find content
    console.log('\n3️⃣ Testing content query...');
    const query = { 'sharingData.isApproved': true, status: 'published' };
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const content = await Content.find(query);
    console.log('✅ Query executed successfully');
    console.log('Found content count:', content.length);
    
    if (content.length > 0) {
      console.log('First content item:');
      console.log('- Title:', content[0].title);
      console.log('- ID:', content[0]._id);
      console.log('- Status:', content[0].status);
      console.log('- Approved:', content[0].sharingData.isApproved);
    }
    
    // Test 4: Check all content (without filters)
    console.log('\n4️⃣ Testing all content query...');
    const allContent = await Content.find({});
    console.log('Total content in database:', allContent.length);
    
    allContent.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} - Status: ${item.status} - Approved: ${item.sharingData.isApproved}`);
    });
    
  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the debug
debugContentAPI(); 