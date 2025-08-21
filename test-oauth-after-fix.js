const mongoose = require('mongoose');
require('dotenv').config();

async function testOAuthAfterFix() {
  try {
    console.log('🧪 TESTING OAUTH FLOW AFTER APP ROLES FIX\n');
    console.log('=' .repeat(60));
    
    console.log('📋 BEFORE RUNNING THIS SCRIPT:');
    console.log('1. Go to LinkedIn Developer Console');
    console.log('2. Find your app: 77h8ujh2l254wj');
    console.log('3. Click "App Roles" tab');
    console.log('4. Add your LinkedIn account as Owner/Admin/Developer/Tester');
    console.log('5. Save changes');
    console.log('6. Then run this script\n');
    
    // Check current employee status
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findById('689dc60c7aa8acf3fd914413');
    
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }
    
    console.log(`👤 Employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`🔗 LinkedIn Connected: ${employee.socialNetworks.linkedin.isConnected}`);
    console.log(`🆔 Profile ID: ${employee.socialNetworks.linkedin.profileId || 'None'}`);
    console.log(`🔑 Access Token: ${employee.socialNetworks.linkedin.accessToken ? 'Present' : 'Missing'}`);
    
    // Generate OAuth URL for testing
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.SERVER_URL || 'http://localhost:5000'}/api/linkedin/oauth/callback`;
    const scope = 'openid profile w_member_social email';
    const state = `test_${Date.now()}`;
    
    if (clientId) {
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
      
      console.log('\n🔗 TEST OAUTH URL:');
      console.log(authUrl);
      console.log('\n📋 INSTRUCTIONS:');
      console.log('1. Copy the URL above');
      console.log('2. Open it in a new browser tab');
      console.log('3. Complete LinkedIn authorization');
      console.log('4. Check if you get redirected back successfully');
      console.log('5. Check server logs for OAuth success/failure');
      
      console.log('\n💡 EXPECTED RESULT AFTER FIXING APP ROLES:');
      console.log('✅ OAuth callback should complete successfully');
      console.log('✅ Real profile ID should be saved (not temporary)');
      console.log('✅ Access token should remain valid');
      console.log('✅ Content sharing should work consistently');
      
    } else {
      console.log('❌ Cannot generate OAuth URL - missing CLIENT_ID');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
}

testOAuthAfterFix(); 