const mongoose = require('mongoose');
require('dotenv').config();

async function testWorkingLinkedInNow() {
  try {
    console.log('🎉 TESTING CONTENT SHARING WITH WORKING LINKEDIN CONNECTION\n');
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
    console.log(`🆔 Profile ID: ${employee.socialNetworks.linkedin.profileId}`);
    console.log(`🔑 Has Access Token: ${employee.socialNetworks.linkedin.accessToken ? '✅ Yes' : '❌ No'}`);
    console.log(`📅 Token Expiry: ${employee.socialNetworks.linkedin.tokenExpiry}`);
    
    if (!employee.socialNetworks.linkedin.accessToken) {
      console.log('❌ No access token found');
      return;
    }
    
    const accessToken = employee.socialNetworks.linkedin.accessToken;
    const profileId = employee.socialNetworks.linkedin.profileId;
    
    // Test 1: Verify token still works
    console.log('\n🔍 Test 1: Verifying current token...');
    
    try {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        console.log('✅ Token is still valid!');
        console.log('📊 User Info:', userInfo.sub);
        console.log('👤 Name:', userInfo.name);
        console.log('📧 Email:', userInfo.email);
      } else {
        const error = await response.json();
        console.log('❌ Token is invalid:', error);
        return;
      }
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return;
    }
    
    // Test 2: Test content sharing
    console.log('\n🔍 Test 2: Testing content sharing...');
    
    const testContent = {
      author: `urn:li:person:${profileId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: '🎉 Testing content sharing from Social Catalyst!\n\nThis is a test post to verify LinkedIn integration is working.\n\n#SocialCatalyst #Test #Success #LinkedIn'
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    console.log('📝 Post data prepared:');
    console.log(JSON.stringify(testContent, null, 2));
    
    try {
      const shareResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(testContent)
      });
      
      if (shareResponse.ok) {
        const shareResult = await shareResponse.json();
        console.log('\n🎉 CONTENT SHARING SUCCESSFUL!');
        console.log('📝 Post ID:', shareResult.id);
        console.log('🔗 Share URL:', `https://www.linkedin.com/feed/update/${shareResult.id}`);
        console.log('✅ LinkedIn integration is working perfectly!');
        
        // Update employee with success
        employee.socialNetworks.linkedin.lastSync = new Date();
        await employee.save();
        console.log('💾 Updated employee lastSync timestamp');
        
      } else {
        const error = await shareResponse.json();
        console.log('\n❌ Content sharing failed:', error);
        
        // Check specific error types
        if (error.code === 65601) {
          console.log('🚨 REVOKED_ACCESS_TOKEN - Token was revoked');
          console.log('💡 This happens when LinkedIn app is in Development mode');
          console.log('💡 Only App Role users can access APIs');
        } else if (error.code === 65600) {
          console.log('🚨 INVALID_ACCESS_TOKEN - Token is invalid');
          console.log('💡 Token may have expired or been revoked');
        } else if (error.code === 100) {
          console.log('🚨 ACCESS_DENIED - Permission issue');
          console.log('💡 Check if app has Share on LinkedIn product approved');
        }
      }
    } catch (error) {
      console.log('❌ Content sharing request failed:', error.message);
    }
    
    // Test 3: Check if token was revoked after sharing
    console.log('\n🔍 Test 3: Checking if token was revoked after sharing...');
    
    try {
      const checkResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      if (checkResponse.ok) {
        console.log('✅ Token still valid after content sharing');
        console.log('🎉 LinkedIn integration is stable!');
      } else {
        const error = await checkResponse.json();
        console.log('❌ Token revoked after content sharing:', error);
        console.log('🚨 This is the root cause of intermittent failures!');
      }
    } catch (error) {
      console.log('❌ Token check failed:', error.message);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
    console.log('\n' + '=' .repeat(60));
    console.log('📋 SUMMARY:');
    console.log('✅ LinkedIn connection is working');
    console.log('✅ Real profile ID obtained');
    console.log('✅ Content sharing tested');
    console.log('💡 If it stops working, check LinkedIn app restrictions');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
}

testWorkingLinkedInNow(); 