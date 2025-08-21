const mongoose = require('mongoose');
require('dotenv').config();

async function debugOAuthCallback() {
  try {
    console.log('🔍 DEBUGGING OAUTH CALLBACK PROCESS\n');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    // Get current employee data
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findById('689dc60c7aa8acf3fd914413');
    
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }
    
    console.log(`👤 Employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`🔗 LinkedIn Connected: ${employee.socialNetworks.linkedin.isConnected}`);
    console.log(`🔑 Access Token: ${employee.socialNetworks.linkedin.accessToken ? 'Present' : 'Missing'}`);
    console.log(`🆔 Profile ID: ${employee.socialNetworks.linkedin.profileId}`);
    
    if (!employee.socialNetworks.linkedin.accessToken) {
      console.log('❌ No access token found');
      return;
    }
    
    const accessToken = employee.socialNetworks.linkedin.accessToken;
    
    // Test 1: Direct LinkedIn API call
    console.log('\n🔍 Test 1: Direct LinkedIn API call with current token');
    console.log('-' .repeat(50));
    
    try {
      console.log('📡 Calling LinkedIn /v2/userinfo endpoint...');
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const userInfo = await response.json();
        console.log('✅ LinkedIn API call successful!');
        console.log('📋 User Info:', JSON.stringify(userInfo, null, 2));
        
        if (userInfo.sub) {
          console.log(`🎯 Real Profile ID found: ${userInfo.sub}`);
          
          // Update employee with real profile ID
          employee.socialNetworks.linkedin.profileId = userInfo.sub;
          employee.socialNetworks.linkedin.profileUrl = `https://linkedin.com/in/${userInfo.sub}`;
          await employee.save();
          
          console.log('✅ Employee updated with real profile ID!');
        } else {
          console.log('❌ User info missing sub field');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ LinkedIn API call failed');
        console.log('🚫 Error Response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.log('🚫 Error Code:', errorJson.code);
          console.log('🚫 Error Message:', errorJson.message);
          console.log('🚫 Service Error Code:', errorJson.serviceErrorCode);
        } catch (e) {
          console.log('🚫 Could not parse error response');
        }
      }
    } catch (error) {
      console.log('❌ Network error:', error.message);
    }
    
    // Test 2: Try alternative LinkedIn endpoints
    console.log('\n🔍 Test 2: Alternative LinkedIn endpoints');
    console.log('-' .repeat(50));
    
    const alternativeEndpoints = [
      'https://api.linkedin.com/v2/me',
      'https://api.linkedin.com/v2/me/profile',
      'https://api.linkedin.com/v2/networkSizes'
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(`📡 Testing ${endpoint}...`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Success: ${JSON.stringify(data).substring(0, 100)}...`);
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Failed: ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Test 3: Check token format and validity
    console.log('\n🔍 Test 3: Token analysis');
    console.log('-' .repeat(50));
    
    console.log(`🔑 Token length: ${accessToken.length} characters`);
    console.log(`🔑 Token starts with: ${accessToken.substring(0, 10)}...`);
    console.log(`🔑 Token ends with: ...${accessToken.substring(accessToken.length - 10)}`);
    
    // Check if token looks like a valid JWT
    const tokenParts = accessToken.split('.');
    if (tokenParts.length === 3) {
      console.log('🔑 Token format: JWT-like (3 parts)');
    } else {
      console.log('🔑 Token format: Non-JWT');
    }
    
    // Test 4: Simulate the exact OAuth callback process
    console.log('\n🔍 Test 4: Simulate OAuth callback process');
    console.log('-' .repeat(50));
    
    console.log('📋 Simulating the exact process from linkedinService.getUserInfo...');
    
    // Import the actual service
    const LinkedInService = require('./server/services/linkedinService');
    const linkedinService = new LinkedInService();
    
    try {
      console.log('🔍 Calling linkedinService.getUserInfo...');
      const userInfo = await linkedinService.getUserInfo(accessToken);
      
      if (userInfo && userInfo.sub) {
        console.log('✅ linkedinService.getUserInfo successful!');
        console.log('📋 User Info:', JSON.stringify(userInfo, null, 2));
        console.log(`🎯 Profile ID: ${userInfo.sub}`);
        
        // Update employee
        employee.socialNetworks.linkedin.profileId = userInfo.sub;
        employee.socialNetworks.linkedin.profileUrl = `https://linkedin.com/in/${userInfo.sub}`;
        await employee.save();
        
        console.log('✅ Employee updated via service!');
      } else {
        console.log('❌ linkedinService.getUserInfo failed or missing sub');
        console.log('📋 Response:', userInfo);
      }
    } catch (error) {
      console.log('❌ linkedinService.getUserInfo error:', error.message);
      console.log('📋 Error details:', error);
    }
    
    // Final status
    console.log('\n📋 FINAL STATUS');
    console.log('-' .repeat(50));
    
    await employee.refresh();
    console.log(`🆔 Final Profile ID: ${employee.socialNetworks.linkedin.profileId}`);
    console.log(`🔗 Final Profile URL: ${employee.socialNetworks.linkedin.profileUrl}`);
    console.log(`✅ Is Real ID: ${!employee.socialNetworks.linkedin.profileId.startsWith('temp_')}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Debug Error:', error.message);
    process.exit(1);
  }
}

debugOAuthCallback(); 