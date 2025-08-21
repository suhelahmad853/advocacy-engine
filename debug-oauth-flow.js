const mongoose = require('mongoose');
require('dotenv').config();

async function debugOAuthFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findOne();
    
    if (!employee) {
      console.log('❌ No employee found');
      return;
    }
    
    console.log(`👤 Employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`🆔 Employee ID: ${employee._id}`);
    
    // Check LinkedIn connection status
    const linkedin = employee.socialNetworks.linkedin;
    console.log('\n🔗 LinkedIn Connection Status:');
    console.log('=====================================');
    console.log(`Connected: ${linkedin.isConnected}`);
    console.log(`Profile ID: ${linkedin.profileId}`);
    console.log(`Profile URL: ${linkedin.profileUrl}`);
    console.log(`Has Access Token: ${!!linkedin.accessToken}`);
    console.log(`Token Expiry: ${linkedin.tokenExpiry}`);
    console.log(`Last Sync: ${linkedin.lastSync}`);
    console.log(`Permissions: ${linkedin.permissions.join(', ')}`);
    
    // Check if profile ID is temporary
    if (linkedin.profileId && linkedin.profileId.startsWith('temp_')) {
      console.log('\n⚠️ ISSUE: Profile ID is temporary');
      console.log('This means the OAuth flow didn\'t get the real LinkedIn profile ID');
      console.log('Solution: Re-authenticate through OAuth to get the real profile ID');
    } else if (linkedin.profileId && !linkedin.profileId.startsWith('temp_')) {
      console.log('\n✅ Profile ID looks real (not temporary)');
    }
    
    // Check token validity
    if (linkedin.accessToken) {
      console.log('\n🧪 Testing current access token...');
      try {
        const response = await fetch('https://api.linkedin.com/v2/userinfo', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${linkedin.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        
        if (response.ok) {
          const userInfo = await response.json();
          console.log('✅ Token is valid and working');
          console.log('Real Profile ID from API:', userInfo.sub);
          
          if (userInfo.sub !== linkedin.profileId) {
            console.log('⚠️ PROFILE ID MISMATCH:');
            console.log(`Stored: ${linkedin.profileId}`);
            console.log(`API: ${userInfo.sub}`);
            console.log('This needs to be fixed!');
          }
        } else {
          const error = await response.json();
          console.log('❌ Token validation failed:', error);
        }
      } catch (error) {
        console.log('❌ Token test failed:', error.message);
      }
    }
    
    console.log('\n=====================================');
    console.log('💡 Recommendations:');
    console.log('1. If profile ID is temporary, re-authenticate through OAuth');
    console.log('2. If profile ID mismatch, update the stored profile ID');
    console.log('3. Check for duplicate OAuth calls in the frontend');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugOAuthFlow(); 