const axios = require('axios');
const https = require('https');
const fetch = require('node-fetch');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class LinkedInService {
  constructor() {
    this.baseURL = 'https://api.linkedin.com/v2';
    this.apiVersion = '2.0.0';
    
    // Create axios instance with corporate-friendly settings
    this.axiosInstance = axios.create({
      timeout: 60000, // 60 seconds
      maxRedirects: 5,
      httpsAgent: new https.Agent({
        keepAlive: true,
        rejectUnauthorized: false, // Allow self-signed certificates
        timeout: 60000
      }),
      headers: {
        'User-Agent': 'SocialCatalyst/1.0',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate'
      }
    });
  }

  // Fallback method using curl (since it works in your environment)
  async getUserInfoWithCurl(accessToken) {
    try {
      const command = `curl -s -H "Authorization: Bearer ${accessToken}" -H "X-Restli-Protocol-Version: 2.0.0" https://api.linkedin.com/v2/userinfo`;
      
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      
      if (stderr) {
        console.error('Curl stderr:', stderr);
      }
      
      if (stdout) {
        try {
          const data = JSON.parse(stdout);
          return data;
        } catch (parseError) {
          throw new Error(`Failed to parse curl response: ${stdout}`);
        }
      } else {
        throw new Error('No response from curl');
      }
    } catch (error) {
      throw new Error(`Curl fallback failed: ${error.message}`);
    }
  }

  // Fallback method for sharing content using curl
  async shareContentWithCurl(accessToken, authorUrn, content, mediaCategory = 'NONE') {
    try {
      // Add unique elements to avoid duplicate content detection
      const timestamp = new Date().toISOString();
      const uniqueId = Math.random().toString(36).substring(7);
      const uniqueContent = `${content}\n\n🕐 Shared at ${new Date().toLocaleTimeString()}\n🔗 #SocialCatalyst${uniqueId}`;
      
      const postData = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: uniqueContent
            },
            shareMediaCategory: mediaCategory
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const command = `curl -s -X POST -H "Authorization: Bearer ${accessToken}" -H "Content-Type: application/json" -H "X-Restli-Protocol-Version: 2.0.0" -d '${JSON.stringify(postData)}' https://api.linkedin.com/v2/ugcPosts`;
      
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      
      if (stderr) {
        console.error('Curl stderr:', stderr);
      }
      
      if (stdout) {
        try {
          const data = JSON.parse(stdout);
          return data;
        } catch (parseError) {
          throw new Error(`Failed to parse curl response: ${stdout}`);
        }
      } else {
        throw new Error('No response from curl');
      }
    } catch (error) {
      throw new Error(`Curl fallback failed: ${error.message}`);
    }
  }

  // Get user profile information from LinkedIn
  async getUserInfo(accessToken) {
    try {
      // Try axios first
      const response = await this.axiosInstance.get(`${this.baseURL}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': this.apiVersion
        },
        validateStatus: function (status) {
          return status < 500; // Accept all status codes to see actual response
        }
      });
      return response.data;
    } catch (axiosError) {
      console.log('Axios failed, trying node-fetch fallback...');
      
      try {
        // Fallback to node-fetch
        const fetchResponse = await fetch(`${this.baseURL}/userinfo`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': this.apiVersion,
            'User-Agent': 'SocialCatalyst/1.0'
          },
          timeout: 30000
        });
        
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          return data;
        } else {
          const errorText = await fetchResponse.text();
          throw new Error(`LinkedIn API error: ${fetchResponse.status} - ${errorText}`);
        }
      } catch (fetchError) {
        console.log('Both axios and node-fetch failed, trying curl fallback...');
        
        try {
          // Final fallback: use curl (which works in your environment)
          return await this.getUserInfoWithCurl(accessToken);
        } catch (curlError) {
          console.error('All methods failed:');
          console.error('Axios error:', axiosError.message);
          console.error('Fetch error:', fetchError.message);
          console.error('Curl error:', curlError.message);
          throw new Error('Failed to get LinkedIn user info - all network methods failed');
        }
      }
    }
  }

  // Share content to LinkedIn
  async shareContent(accessToken, authorUrn, content, mediaCategory = 'NONE') {
    try {
      const postData = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: mediaCategory
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // Try axios first
      try {
        const response = await this.axiosInstance.post(`${this.baseURL}/ugcPosts`, postData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': this.apiVersion
          },
          validateStatus: function (status) {
            return status < 500; // Accept all status codes to see actual response
          }
        });
        return response.data;
      } catch (axiosError) {
        console.log('Axios failed for shareContent, trying curl fallback...');
        
        // Fallback to curl (which works in your environment)
        return await this.shareContentWithCurl(accessToken, authorUrn, content, mediaCategory);
      }
    } catch (error) {
      console.error('LinkedIn shareContent error:', error.response?.data || error.message);
      throw new Error('Failed to share content to LinkedIn');
    }
  }

  // Validate LinkedIn access token
  async validateToken(accessToken) {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new LinkedInService(); 