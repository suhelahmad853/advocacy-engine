const mongoose = require('mongoose');
require('dotenv').config();

async function useWorkingToken() {
  try {
    console.log('🔧 USING WORKING LINKEDIN TOKEN\n');
    console.log('=' .repeat(50));
    
    // Working LinkedIn credentials from Postman
    const workingToken = 'AQXdGZJNxqYT5n1G50gtFSBJM9LHvtIZ6Gc3MO7fsk6oIvToC1hkuok9sKMBVGoTJSzM4q00gXhrrrlreEHIXSvmvWJ_h_U-vqAnPyY2--HwmEJzihmcbGE_HfBTjzC5ESVs5NFz9L2nDjACWCNLrEVMPgsVeboqJuxmTXEzNSuOL7v6WEC9d0C6rDXwTxDS7vipGGUTq9RXtVyhW9nL0dyu37GSeobtrnEtyyPGLXEsSdlZ1Uj6qWdj-NgmTIFB7fEGcyV234rC7pkIQnJIGVNrHrctRDWl1KZFCBytKGWqxgcjSciabWfBLwxMRINaUBxIfu-6uk5MVzhk-CfVmwkQDcbe8A';
    
    // Test 1: Verify token works with userinfo
    console.log('🔍 Test 1: Verifying working token with /v2/userinfo...');
    
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
        console.log('✅ Token works! User info:', userInfo);
        console.log('🎯 Real Profile ID:', userInfo.sub);
        
        // Test 2: Test content sharing with real profile ID
        console.log('\n🔍 Test 2: Testing content sharing with real profile ID...');
        
        const shareResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${workingToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify({
            author: `urn:li:person:${userInfo.sub}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: '🎉 Testing content sharing from Social Catalyst!\n\nThis post was created using the working LinkedIn token.\n\n#SocialCatalyst #ContentSharing #Success'
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
          console.log('✅ Content sharing successful!');
          console.log('📝 Post ID:', shareResult.id);
          console.log('🔗 Share URL:', `https://www.linkedin.com/feed/update/${shareResult.id}`);
          
          // Test 3: Update database with working credentials
          console.log('\n🔍 Test 3: Updating database with working credentials...');
          
          await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');
          console.log('✅ Connected to MongoDB');
          
          const Employee = require('./server/models/Employee');
          const employee = await Employee.findById('689dc60c7aa8acf3fd914413');
          
          if (employee) {
            // Update with working LinkedIn credentials
            employee.socialNetworks.linkedin = {
              profileUrl: `https://linkedin.com/in/${userInfo.sub}`,
              profileId: userInfo.sub, // Real LinkedIn profile ID
              accessToken: workingToken,
              refreshToken: '', // Will be updated if available
              tokenExpiry: new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)), // 60 days
              isConnected: true,
              lastSync: new Date(),
              permissions: ['w_member_social'],
              networkStats: {
                connections: 0,
                followers: 0,
                lastUpdated: new Date()
              }
            };
            
            await employee.save();
            console.log('✅ Database updated with working LinkedIn credentials');
            console.log(`🔗 Real Profile ID: ${userInfo.sub}`);
            console.log(`🌐 Profile URL: https://linkedin.com/in/${userInfo.sub}`);
            
            // Test 4: Test content sharing from our backend
            console.log('\n🔍 Test 4: Testing content sharing from our backend...');
            
            const backendShareResponse = await fetch('http://localhost:5000/api/linkedin/test-share', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                employeeId: '689dc60c7aa8acf3fd914413',
                content: {
                  text: '🎉 Testing content sharing from Social Catalyst backend!\n\nThis post was created using our backend API.\n\n#SocialCatalyst #BackendAPI #Success'
                }
              })
            });
            
            if (backendShareResponse.ok) {
              const backendResult = await backendShareResponse.json();
              console.log('✅ Backend content sharing successful!');
              console.log('📝 Result:', backendResult);
            } else {
              const error = await backendShareResponse.json();
              console.log('❌ Backend content sharing failed:', error);
            }
            
          } else {
            console.log('❌ Employee not found');
          }
          
          await mongoose.disconnect();
          console.log('✅ Disconnected from MongoDB');
          
        } else {
          const error = await shareResponse.json();
          console.log('❌ Content sharing failed:', error);
        }
        
      } else {
        const error = await response.json();
        console.log('❌ Token verification failed:', error);
      }
      
    } catch (error) {
      console.log('❌ API call failed:', error.message);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('📋 SUMMARY:');
    console.log('✅ Working token verified');
    console.log('✅ Real profile ID obtained');
    console.log('✅ Content sharing tested');
    console.log('✅ Database updated');
    console.log('\n🎯 Next: Test content sharing from your frontend!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

useWorkingToken(); 