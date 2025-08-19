const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');

// Import models
const Employee = require('./server/models/Employee');

async function testSchemaUpdate() {
  try {
    console.log('🧪 Testing Employee Schema Update\n');
    
    // Get the first employee
    const employee = await Employee.findOne();
    if (!employee) {
      console.log('❌ No employees found');
      return;
    }
    
    console.log('👤 Employee:', employee.firstName, employee.lastName);
    console.log('Current LinkedIn data:');
    console.log('- isConnected:', employee.socialNetworks.linkedin.isConnected);
    console.log('- profileUrl:', employee.socialNetworks.linkedin.profileUrl);
    console.log('- profileId:', employee.socialNetworks.linkedin.profileId);
    console.log('- accessToken:', employee.socialNetworks.linkedin.accessToken ? 'Present' : 'Missing');
    
    // Test updating LinkedIn fields
    console.log('\n🔧 Testing schema update...');
    
    const updateResult = await Employee.findByIdAndUpdate(employee._id, {
      'socialNetworks.linkedin.profileId': 'test-profile-id',
      'socialNetworks.linkedin.accessToken': 'test-access-token'
    }, { new: true });
    
    if (updateResult) {
      console.log('✅ Schema update successful!');
      console.log('Updated profileId:', updateResult.socialNetworks.linkedin.profileId);
      console.log('Updated accessToken:', updateResult.socialNetworks.linkedin.accessToken ? 'Present' : 'Missing');
    } else {
      console.log('❌ Schema update failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testSchemaUpdate(); 