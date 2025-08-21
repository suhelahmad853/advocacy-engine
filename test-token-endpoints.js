const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

async function testTokenEndpoints() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findOne({'socialNetworks.linkedin.accessToken': {$exists: true}});
    
    if (!employee) {
      console.log('❌ No employee with LinkedIn token found');
      return;
    }
    
    const token = employee.socialNetworks.linkedin.accessToken;
    console.log(`👤 Testing token for: ${employee.firstName} ${employee.lastName}`);
    console.log(`🔑 Token: ${token.substring(0, 20)}...`);
    console.log(`🆔 Profile ID: ${employee.socialNetworks.linkedin.profileId}`);
    console.log(`⏰ Token Expiry: ${employee.socialNetworks.linkedin.tokenExpiry}`);
    
    console.log('\n🧪 Testing LinkedIn API Endpoints:');
    console.log('=====================================');
    
    // Test 1: User Info endpoint
    console.log('\n1️⃣ Testing /v2/userinfo endpoint...');
    try {
      const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
        timeout: 10000
      });
      console.log('✅ /v2/userinfo - SUCCESS');
      console.log('Response:', userInfoResponse.data);
    } catch (error) {
      console.log('❌ /v2/userinfo - FAILED');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
    }
    
    // Test 2: Me endpoint
    console.log('\n2️⃣ Testing /v2/me endpoint...');
    try {
      const meResponse = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
        timeout: 10000
      });
      console.log('✅ /v2/me - SUCCESS');
      console.log('Response:', meResponse.data);
    } catch (error) {
      console.log('❌ /v2/me - FAILED');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
    }
    
    // Test 3: Profile endpoint
    console.log('\n3️⃣ Testing /v2/me/profile endpoint...');
    try {
      const profileResponse = await axios.get('https://api.linkedin.com/v2/me/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
        timeout: 10000
      });
      console.log('✅ /v2/me/profile - SUCCESS');
      console.log('Response:', profileResponse.data);
    } catch (error) {
      console.log('❌ /v2/me/profile - FAILED');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
    }
    
    // Test 4: Network endpoint
    console.log('\n4️⃣ Testing /v2/networkSizes endpoint...');
    try {
      const networkResponse = await axios.get('https://api.linkedin.com/v2/networkSizes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
        timeout: 10000
      });
      console.log('✅ /v2/networkSizes - SUCCESS');
      console.log('Response:', networkResponse.data);
    } catch (error) {
      console.log('❌ /v2/networkSizes - FAILED');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n=====================================');
    console.log('📊 Summary:');
    console.log('If all endpoints fail with 401, the issue is:');
    console.log('1. App not approved for required scopes');
    console.log('2. App verification required');
    console.log('3. User account restrictions');
    console.log('4. App configuration issues');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTokenEndpoints(); 