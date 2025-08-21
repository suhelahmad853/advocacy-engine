const mongoose = require('mongoose');
require('dotenv').config();

async function forceLinkedInReconnect() {
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
    
    // Completely clear LinkedIn connection
    console.log('\n🧹 Clearing LinkedIn connection completely...');
    employee.socialNetworks.linkedin = {
      profileUrl: '',
      profileId: '',
      accessToken: '',
      refreshToken: '',
      tokenExpiry: null,
      isConnected: false,
      lastSync: null,
      permissions: [],
      networkStats: {
        connections: 0,
        followers: 0,
        lastUpdated: null
      }
    };
    
    await employee.save();
    console.log('✅ LinkedIn connection cleared completely');
    
    // Generate fresh OAuth URL
    console.log('\n🔐 Generating fresh OAuth authorization URL...');
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    const scope = 'w_member_social';
    const state = Buffer.from(`${employee._id}-${Date.now()}`).toString('base64');
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    console.log('\n🔐 FRESH OAuth 2.0 Authorization URL:');
    console.log('=====================================');
    console.log(authUrl);
    console.log('=====================================');
    
    console.log('\n📋 Fresh OAuth Parameters:');
    console.log(`Client ID: ${clientId}`);
    console.log(`Redirect URI: ${redirectUri}`);
    console.log(`Scope: ${scope}`);
    console.log(`State: ${state}`);
    console.log(`Employee ID: ${employee._id}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Copy the FRESH authorization URL above');
    console.log('2. Open it in your browser (preferably incognito/private mode)');
    console.log('3. Authorize the LinkedIn app');
    console.log('4. You\'ll be redirected with an authorization code');
    console.log('5. Use that code to complete the OAuth flow');
    
    console.log('\n💡 IMPORTANT: Use incognito/private mode to avoid any cached LinkedIn sessions!');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

forceLinkedInReconnect(); 