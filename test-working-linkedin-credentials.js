const mongoose = require('mongoose');
require('dotenv').config();

async function testWorkingCredentials() {
  try {
    console.log('🧪 Testing LinkedIn API with known working credentials...\n');
    
    // Test 1: Direct API call with working credentials
    console.log('🔍 Test 1: Direct LinkedIn API call...');
    
    const workingToken = 'AQXdGZJNxqYT5n1G50gtFSBJM9LHvtIZ6Gc3MO7fsk6oIvToC1hkuok9sKMBVGoTJSzM4q00gXhrrrlreEHIXSvmvWJ_h_U-vqAnPyY2--HwmEJzihmcbGE_HfBTjzC5ESVs5NFz9L2nDjACWCNLrEVMPgsVeboqJuxmTXEzNSuOL7v6WEC9d0C6rDXwTxDS7vipGGUTq9RXtVyhW9nL0dyu37GSeobtrnEtyyPGLXEsSdlZ1Uj6qWdj-NgmTIFB7fEGcyV234rC7pkIQnJIGVNrHrctRDWl1KZFCBytKGWqxgcjSciabWfBLwxMRINaUBxIfu-6uk5MVzhk-CfVmwkQDcbe8A';
    const workingProfileId = 'OnqfZaA4GM';
    
    try {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${workingToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        console.log('✅ Working token still valid!');
        console.log('User info:', userInfo);
        console.log('Profile ID:', userInfo.sub);
      } else {
        const error = await response.json();
        console.log('❌ Working token failed:', error);
      }
    } catch (error) {
      console.log('❌ Working token test failed:', error.message);
    }
    
    // Test 2: Test current stored token
    console.log('\n🔍 Test 2: Current stored token...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employee = await Employee.findById('689dc60c7aa8acf3fd914413');
    
    if (employee && employee.socialNetworks.linkedin.accessToken) {
      const currentToken = employee.socialNetworks.linkedin.accessToken;
      console.log('Current token:', currentToken.substring(0, 30) + '...');
      
      try {
        const response = await fetch('https://api.linkedin.com/v2/userinfo', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        
        if (response.ok) {
          const userInfo = await response.json();
          console.log('✅ Current token works!');
          console.log('User info:', userInfo);
        } else {
          const error = await response.json();
          console.log('❌ Current token failed:', error);
        }
      } catch (error) {
        console.log('❌ Current token test failed:', error.message);
      }
    }
    
    // Test 3: LinkedIn app configuration
    console.log('\n🔍 Test 3: LinkedIn app configuration...');
    console.log('Client ID:', process.env.LINKEDIN_CLIENT_ID);
    console.log('Redirect URI:', process.env.LINKEDIN_REDIRECT_URI);
    console.log('App Status: Verified (from your screenshot)');
    console.log('Scopes: w_member_social, openid, profile, email');
    
    // Test 4: Generate fresh OAuth URL
    console.log('\n🔍 Test 4: Generate fresh OAuth URL...');
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    const scope = 'w_member_social openid profile email';
    const state = Buffer.from(`test-${Date.now()}`).toString('base64');
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    console.log('Fresh OAuth URL:');
    console.log(authUrl);
    
    // Test 5: Check if LinkedIn domains are accessible
    console.log('\n🔍 Test 5: LinkedIn domain accessibility...');
    
    const domains = [
      'https://www.linkedin.com',
      'https://api.linkedin.com',
      'https://oauth.linkedin.com'
    ];
    
    for (const domain of domains) {
      try {
        const response = await fetch(domain);
        console.log(`✅ ${domain}: Accessible (${response.status})`);
      } catch (error) {
        console.log(`❌ ${domain}: Not accessible - ${error.message}`);
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
    console.log('\n📋 SUMMARY:');
    console.log('1. Check if working token is still valid');
    console.log('2. Verify LinkedIn app configuration');
    console.log('3. Test fresh OAuth flow with expanded scopes');
    console.log('4. Check network/firewall restrictions');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testWorkingCredentials(); 