const mongoose = require('mongoose');
require('dotenv').config();

async function updateWorkingToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findOne();
    
    if (!employee) {
      console.log('❌ No employee found');
      return;
    }
    
    console.log(`👤 Updating employee: ${employee.firstName} ${employee.lastName}`);
    
    // Update with the new working token and real profile ID
    const newLinkedInData = {
      profileUrl: 'https://linkedin.com/in/OnqfZaA4GM',
      profileId: 'OnqfZaA4GM', // Real LinkedIn profile ID from API
      accessToken: 'AQXdGZJNxqYT5n1G50gtFSBJM9LHvtIZ6Gc3MO7fsk6oIvToC1hkuok9sKMBVGoTJSzM4q00gXhrrrlreEHIXSvmvWJ_h_U-vqAnPyY2--HwmEJzihmcbGE_HfBTjzC5ESVs5NFz9L2nDjACWCNLrEVMPgsVeboqJuxmTXEzNSuOL7v6WEC9d0C6rDXwTxDS7vipGGUTq9RXtVyhW9nL0dyu37GSeobtrnEtyyPGLXEsSdlZ1Uj6qWdj-NgmTIFB7fEGcyV234rC7pkIQnJIGVNrHrctRDWl1KZFCBytKGWqxgcjSciabWfBLwxMRINaUBxIfu-6uk5MVzhk-CfVmwkQDcbe8A',
      refreshToken: '', // Will be updated if available
      tokenExpiry: new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)), // 60 days from now
      isConnected: true,
      lastSync: new Date(),
      permissions: ['w_member_social'],
      networkStats: {
        connections: 0,
        followers: 0,
        lastUpdated: new Date()
      }
    };
    
    employee.socialNetworks.linkedin = newLinkedInData;
    await employee.save();
    
    console.log('✅ LinkedIn connection updated successfully');
    console.log(`🔗 Real Profile ID: ${newLinkedInData.profileId}`);
    console.log(`🔑 New Token: ${newLinkedInData.accessToken.substring(0, 20)}...`);
    console.log(`🌐 Profile URL: ${newLinkedInData.profileUrl}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n🎉 Now let\'s test content sharing!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateWorkingToken(); 