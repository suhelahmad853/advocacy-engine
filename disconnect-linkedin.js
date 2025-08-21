const mongoose = require('mongoose');
require('dotenv').config();

async function disconnectLinkedIn() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findOne({'socialNetworks.linkedin.accessToken': {$exists: true}});
    
    if (!employee) {
      console.log('❌ No employee with LinkedIn token found');
      return;
    }
    
    console.log(`👤 Found employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`🔗 Current LinkedIn status: ${employee.socialNetworks.linkedin.isConnected ? 'Connected' : 'Disconnected'}`);
    
    // Disconnect LinkedIn
    employee.socialNetworks.linkedin.isConnected = false;
    employee.socialNetworks.linkedin.accessToken = undefined;
    employee.socialNetworks.linkedin.refreshToken = undefined;
    employee.socialNetworks.linkedin.tokenExpiry = undefined;
    
    await employee.save();
    
    console.log('✅ LinkedIn disconnected successfully');
    console.log('🔄 Employee will need to re-authenticate through OAuth flow');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

disconnectLinkedIn(); 