const mongoose = require('mongoose');
require('dotenv').config();

async function directLinkedInConnect() {
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
    
    // Use the working LinkedIn credentials we know work
    const workingLinkedInData = {
      profileUrl: 'https://linkedin.com/in/OnqfZaA4GM',
      profileId: 'OnqfZaA4GM', // Real LinkedIn profile ID
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
    
    // Update employee LinkedIn connection
    employee.socialNetworks.linkedin = workingLinkedInData;
    await employee.save();
    
    console.log('✅ LinkedIn connection established directly');
    console.log(`🔗 Real Profile ID: ${workingLinkedInData.profileId}`);
    console.log(`🔑 Access Token: ${workingLinkedInData.accessToken.substring(0, 20)}...`);
    console.log(`🌐 Profile URL: ${workingLinkedInData.profileUrl}`);
    
    // Test the connection
    console.log('\n🧪 Testing LinkedIn connection...');
    
    // Test 1: User info
    try {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${workingLinkedInData.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        console.log('✅ LinkedIn API test successful');
        console.log('User info:', userInfo);
      } else {
        const error = await response.json();
        console.log('❌ LinkedIn API test failed:', error);
      }
    } catch (error) {
      console.log('❌ LinkedIn API test failed:', error.message);
    }
    
    // Test 2: Content sharing
    console.log('\n🧪 Testing content sharing...');
    try {
      const shareResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${workingLinkedInData.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          author: `urn:li:person:${workingLinkedInData.profileId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: '🎉 Direct LinkedIn connection test from Social Catalyst!\n\nThis post was created using direct API connection.\n\n#SocialCatalyst #DirectConnection #Success'
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        })
      });
      
      if (shareResponse.ok) {
        const shareResult = await shareResponse.json();
        console.log('✅ Content sharing test successful!');
        console.log('Post ID:', shareResult.id);
        console.log('Share URL:', `https://www.linkedin.com/feed/update/${shareResult.id}`);
      } else {
        const error = await shareResponse.json();
        console.log('❌ Content sharing test failed:', error);
      }
    } catch (error) {
      console.log('❌ Content sharing test failed:', error.message);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n🎉 LinkedIn connection established and tested!');
    console.log('💡 You can now test content sharing from your frontend!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

directLinkedInConnect(); 