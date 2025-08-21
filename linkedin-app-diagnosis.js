const mongoose = require('mongoose');
require('dotenv').config();

async function diagnoseLinkedInApp() {
  try {
    console.log('🔍 LINKEDIN APP DIAGNOSIS\n');
    console.log('=' .repeat(50));
    
    // 1. Environment Variables Check
    console.log('📋 1. ENVIRONMENT VARIABLES CHECK');
    console.log('-' .repeat(30));
    console.log('LINKEDIN_CLIENT_ID:', process.env.LINKEDIN_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('LINKEDIN_CLIENT_SECRET:', process.env.LINKEDIN_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('LINKEDIN_REDIRECT_URI:', process.env.LINKEDIN_REDIRECT_URI ? '✅ Set' : '❌ Missing');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
    
    // 2. LinkedIn App Status Check
    console.log('\n📋 2. LINKEDIN APP STATUS CHECK');
    console.log('-' .repeat(30));
    console.log('App Name: Advocacy-Engine');
    console.log('Client ID: 77h8ujh2l254wj');
    console.log('App Type: Standalone app');
    console.log('Status: Verified (Aug 18, 2025)');
    console.log('App Type: Software Development; 1-10 employees');
    
    // 3. OAuth Configuration Check
    console.log('\n📋 3. OAUTH CONFIGURATION CHECK');
    console.log('-' .repeat(30));
    console.log('Redirect URI: http://localhost:3000/auth/linkedin/callback');
    console.log('Scopes: w_member_social, openid, profile, email');
    console.log('Token TTL: 2 months (5184000 seconds)');
    
    // 4. Network Connectivity Test
    console.log('\n📋 4. NETWORK CONNECTIVITY TEST');
    console.log('-' .repeat(30));
    
    const testUrls = [
      { name: 'LinkedIn Main', url: 'https://www.linkedin.com' },
      { name: 'LinkedIn API', url: 'https://api.linkedin.com' },
      { name: 'LinkedIn OAuth', url: 'https://oauth.linkedin.com' },
      { name: 'LinkedIn Developers', url: 'https://www.linkedin.com/developers' }
    ];
    
    for (const test of testUrls) {
      try {
        const response = await fetch(test.url);
        console.log(`${test.name}: ${response.ok ? '✅ Accessible' : '⚠️ Limited Access'} (${response.status})`);
      } catch (error) {
        console.log(`${test.name}: ❌ Not Accessible - ${error.message}`);
      }
    }
    
    // 5. OAuth Flow Test
    console.log('\n📋 5. OAUTH FLOW TEST');
    console.log('-' .repeat(30));
    
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    const scope = 'w_member_social openid profile email';
    const state = Buffer.from(`diagnosis-${Date.now()}`).toString('base64');
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    console.log('Generated OAuth URL:');
    console.log(authUrl);
    
    // 6. Current Database Status
    console.log('\n📋 6. CURRENT DATABASE STATUS');
    console.log('-' .repeat(30));
    
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
      console.log('✅ MongoDB: Connected');
      
      const Employee = require('./server/models/Employee');
      const employee = await Employee.findById('689dc60c7aa8acf3fd914413');
      
      if (employee && employee.socialNetworks.linkedin) {
        const linkedin = employee.socialNetworks.linkedin;
        console.log('👤 Employee:', employee.firstName, employee.lastName);
        console.log('🔗 LinkedIn Connected:', linkedin.isConnected ? '✅ Yes' : '❌ No');
        console.log('🔑 Has Access Token:', linkedin.accessToken ? '✅ Yes' : '❌ No');
        console.log('🆔 Profile ID:', linkedin.profileId);
        console.log('📅 Token Expiry:', linkedin.tokenExpiry);
        console.log('🔄 Last Sync:', linkedin.lastSync);
        
        if (linkedin.accessToken) {
          console.log('🔍 Testing stored token...');
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
              console.log('✅ Token Status: Valid');
              console.log('📊 User Info:', userInfo.sub);
            } else {
              const error = await response.json();
              console.log('❌ Token Status: Invalid');
              console.log('🚫 Error:', error.code, '-', error.message);
            }
          } catch (error) {
            console.log('❌ Token Test Failed:', error.message);
          }
        }
      } else {
        console.log('❌ No LinkedIn connection found');
      }
      
      await mongoose.disconnect();
      console.log('✅ MongoDB: Disconnected');
      
    } catch (error) {
      console.log('❌ MongoDB Error:', error.message);
    }
    
    // 7. Recommendations
    console.log('\n📋 7. RECOMMENDATIONS');
    console.log('-' .repeat(30));
    console.log('🚨 IMMEDIATE ACTIONS REQUIRED:');
    console.log('1. Check LinkedIn app status in developer console');
    console.log('2. Verify app is not suspended or restricted');
    console.log('3. Check if OAuth endpoints are accessible');
    console.log('4. Verify redirect URI matches exactly');
    console.log('5. Check app permissions and scopes');
    console.log('6. Test OAuth flow in incognito mode');
    console.log('7. Check network/firewall restrictions');
    
    console.log('\n🔧 TECHNICAL SOLUTIONS:');
    console.log('1. Re-verify LinkedIn app configuration');
    console.log('2. Test OAuth with minimal scopes first');
    console.log('3. Check server logs for detailed errors');
    console.log('4. Verify callback endpoint is working');
    console.log('5. Test with different LinkedIn accounts');
    
    console.log('\n📞 SUPPORT CONTACTS:');
    console.log('1. LinkedIn Developer Support');
    console.log('2. Check app status in LinkedIn developer console');
    console.log('3. Verify app verification status');
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 NEXT STEPS:');
    console.log('1. Go to LinkedIn Developer Console');
    console.log('2. Check app status and restrictions');
    console.log('3. Verify OAuth configuration');
    console.log('4. Test OAuth flow manually');
    console.log('5. Contact LinkedIn support if needed');
    
  } catch (error) {
    console.error('❌ Diagnosis Error:', error.message);
    process.exit(1);
  }
}

diagnoseLinkedInApp(); 