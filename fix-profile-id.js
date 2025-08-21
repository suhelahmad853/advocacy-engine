const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Import Employee model
const Employee = require('./server/models/Employee');

async function fixProfileId() {
  try {
    console.log('🔍 Looking for employee with LinkedIn connection...');
    
    // Find employee with LinkedIn connection
    const employee = await Employee.findOne({
      'socialNetworks.linkedin.isConnected': true
    });
    
    if (!employee) {
      console.log('❌ No employee found with LinkedIn connection');
      return;
    }
    
    console.log('✅ Found employee:', {
      id: employee._id,
      name: `${employee.firstName} ${employee.lastName}`,
      currentProfileId: employee.socialNetworks.linkedin.profileId
    });
    
    // Update with correct profile ID
    const correctProfileId = 'OnqfZaA4GM';
    
    employee.socialNetworks.linkedin.profileId = correctProfileId;
    employee.socialNetworks.linkedin.profileUrl = `https://linkedin.com/in/${correctProfileId}`;
    
    await employee.save();
    
    console.log('✅ Profile ID updated successfully!');
    console.log('📝 New LinkedIn data:', {
      profileId: employee.socialNetworks.linkedin.profileId,
      profileUrl: employee.socialNetworks.linkedin.profileUrl,
      isConnected: employee.socialNetworks.linkedin.isConnected
    });
    
    console.log('💡 Now you need to reconnect LinkedIn to get a fresh access token');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixProfileId(); 