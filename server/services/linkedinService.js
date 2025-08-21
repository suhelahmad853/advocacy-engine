const axios = require('axios');
const https = require('https');
const fetch = require('node-fetch');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class LinkedInService {
  constructor() {
    this.baseURL = 'https://api.linkedin.com/v2';
    this.oauthBaseURL = 'https://www.linkedin.com/oauth/v2';
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
      console.log('🔄 shareContentWithCurl fallback called');
      
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

      console.log('📝 Curl post data:', JSON.stringify(postData, null, 2));
      console.log('🔑 Using access token:', accessToken.substring(0, 20) + '...');

      const command = `curl -s -X POST -H "Authorization: Bearer ${accessToken}" -H "Content-Type: application/json" -H "X-Restli-Protocol-Version: 2.0.0" -d '${JSON.stringify(postData)}' https://api.linkedin.com/v2/ugcPosts`;
      
      console.log('💻 Executing curl command...');
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      
      if (stderr) {
        console.error('❌ Curl stderr:', stderr);
      }
      
      console.log('📤 Curl stdout:', stdout);
      
      if (stdout) {
        try {
          const data = JSON.parse(stdout);
          console.log('✅ Curl response parsed successfully:', data);
          return data;
        } catch (parseError) {
          console.error('❌ Failed to parse curl response:', parseError);
          throw new Error(`Failed to parse curl response: ${stdout}`);
        }
      } else {
        throw new Error('No response from curl');
      }
    } catch (error) {
      console.error('💥 shareContentWithCurl error:', error);
      throw new Error(`Curl fallback failed: ${error.message}`);
    }
  }

  // Get user profile information from LinkedIn
  async getUserInfo(accessToken) {
    try {
      console.log('🔍 Getting user info from LinkedIn API...');
      
      // Try axios first
      const response = await this.axiosInstance.get(`${this.baseURL}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': this.apiVersion,
          'LinkedIn-Version': '202401',
          'User-Agent': 'SocialCatalyst/1.0'
        },
        validateStatus: function (status) {
          return status < 500; // Accept all status codes to see actual response
        }
      });
      
      console.log('✅ Axios response for userinfo:', {
        status: response.status,
        data: response.data
      });
      
      // Check for specific LinkedIn API errors
      if (response.status === 403) {
        console.log('🚨 LinkedIn API 403 Error - Product approval required');
        throw new Error('LinkedIn app lacks required product permissions. Please ensure "Sign In with LinkedIn using OpenID Connect" product is approved.');
      }
      
      if (response.status === 401) {
        console.log('🚨 LinkedIn API 401 Error - Token revoked or invalid');
        throw new Error('LinkedIn access token is invalid or revoked. Please re-authenticate.');
      }
      
      // Check if we got valid user data
      if (response.data && response.data.sub) {
        console.log('✅ Valid user data received, profile ID:', response.data.sub);
      return response.data;
      } else {
        console.log('⚠️ User data missing sub field:', response.data);
        throw new Error('LinkedIn API response missing profile ID (sub field)');
      }
    } catch (axiosError) {
      console.log('Axios failed, trying node-fetch fallback...');
      
      try {
        // Fallback to node-fetch
        const fetchResponse = await fetch(`${this.baseURL}/userinfo`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': this.apiVersion,
            'LinkedIn-Version': '202401',
            'User-Agent': 'SocialCatalyst/1.0'
          },
          timeout: 30000
        });
        
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          console.log('✅ Fetch response for userinfo:', data);
          
          if (data && data.sub) {
            console.log('✅ Valid user data from fetch, profile ID:', data.sub);
          return data;
          } else {
            console.log('⚠️ Fetch user data missing sub field:', data);
            throw new Error('LinkedIn API response missing profile ID (sub field)');
          }
        } else {
          const errorText = await fetchResponse.text();
          throw new Error(`LinkedIn API error: ${fetchResponse.status} - ${errorText}`);
        }
      } catch (fetchError) {
        console.log('Both axios and node-fetch failed, trying curl fallback...');
        
        try {
          console.log('🔄 Trying curl fallback for userinfo...');
          // Final fallback: use curl (which works in your environment)
          const curlData = await this.getUserInfoWithCurl(accessToken);
          console.log('✅ Curl response for userinfo:', curlData);
          
          if (curlData && curlData.sub) {
            console.log('✅ Valid user data from curl, profile ID:', curlData.sub);
            return curlData;
          } else {
            console.log('⚠️ Curl user data missing sub field:', curlData);
            throw new Error('LinkedIn API response missing profile ID (sub field)');
          }
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
      console.log('🔗 LinkedInService.shareContent called with:', {
        authorUrn,
        contentLength: content.length,
        mediaCategory,
        hasAccessToken: !!accessToken
      });

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

      console.log('📝 Post data prepared:', JSON.stringify(postData, null, 2));

      // Try axios first
      try {
        console.log('🚀 Attempting axios POST to LinkedIn API...');
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
        
        console.log('✅ Axios response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });
        
        return response.data;
      } catch (axiosError) {
        console.log('❌ Axios failed for shareContent:', {
          message: axiosError.message,
          response: axiosError.response?.data,
          status: axiosError.response?.status
        });
        
        console.log('🔄 Trying curl fallback...');
        // Fallback to curl (which works in your environment)
        return await this.shareContentWithCurl(accessToken, authorUrn, content, mediaCategory);
      }
    } catch (error) {
      console.error('💥 LinkedIn shareContent error:', error);
      throw new Error(`Failed to share content to LinkedIn: ${error.message}`);
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

  // OAuth 2.0: Exchange authorization code for access token
  async exchangeCodeForTokens(authorizationCode) {
    try {
      console.log('🔐 Starting OAuth token exchange...');
      console.log('📝 Authorization code:', authorizationCode.substring(0, 10) + '...');
      console.log('🔑 Client ID:', process.env.LINKEDIN_CLIENT_ID ? 'Present' : 'Missing');
      console.log('🔒 Client Secret:', process.env.LINKEDIN_CLIENT_SECRET ? 'Present' : 'Missing');
      console.log('🌐 Redirect URI:', process.env.LINKEDIN_REDIRECT_URI ? 'Present' : 'Missing');
      
      const tokenUrl = `${this.oauthBaseURL}/accessToken`;
      console.log('🌍 Token URL:', tokenUrl);
      
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI
      });

      console.log('📋 Request params:', {
        grant_type: 'authorization_code',
        code: authorizationCode.substring(0, 10) + '...',
        client_id: process.env.LINKEDIN_CLIENT_ID ? 'Present' : 'Missing',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET ? 'Present' : 'Missing',
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI
      });

      const response = await this.axiosInstance.post(tokenUrl, params, {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      });

      console.log('✅ Token exchange successful:', {
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
        expiresIn: response.data.expires_in
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in
      };
    } catch (error) {
      console.error('❌ OAuth token exchange error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  // OAuth 2.0: Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const tokenUrl = `${this.oauthBaseURL}/accessToken`;
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      });

      const response = await this.axiosInstance.post(tokenUrl, params, {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || refreshToken, // LinkedIn might not return new refresh token
        expires_in: response.data.expires_in
      };
    } catch (error) {
      console.error('OAuth token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  // Check if token is expired or will expire soon
  isTokenExpired(tokenExpiry, bufferMinutes = 5) {
    if (!tokenExpiry) return true;
    
    const now = new Date();
    const expiryTime = new Date(tokenExpiry);
    const bufferTime = new Date(expiryTime.getTime() - (bufferMinutes * 60 * 1000));
    
    return now >= bufferTime;
  }

  // Validate and refresh token if needed
  async validateAndRefreshToken(employee) {
    const linkedin = employee.socialNetworks.linkedin;
    
    if (!linkedin.accessToken) {
      throw new Error('No LinkedIn access token found');
    }

    // Check if token is expired or will expire soon
    if (this.isTokenExpired(linkedin.tokenExpiry)) {
      if (linkedin.refreshToken) {
        try {
          console.log('Refreshing expired LinkedIn token for employee:', employee._id);
          const newTokens = await this.refreshAccessToken(linkedin.refreshToken);
          
          // Update employee with new tokens
          linkedin.accessToken = newTokens.access_token;
          linkedin.refreshToken = newTokens.refresh_token;
          linkedin.tokenExpiry = new Date(Date.now() + (newTokens.expires_in * 1000));
          linkedin.lastSync = new Date();
          
          await employee.save();
          console.log('LinkedIn token refreshed successfully for employee:', employee._id);
          
          return newTokens.access_token;
        } catch (refreshError) {
          console.error('Failed to refresh LinkedIn token for employee:', employee._id, refreshError);
          // Mark as disconnected since refresh failed
          linkedin.isConnected = false;
          await employee.save();
          throw new Error('LinkedIn token refresh failed - reconnection required');
        }
      } else {
        throw new Error('LinkedIn token expired and no refresh token available');
      }
    }

    return linkedin.accessToken;
  }
}

module.exports = new LinkedInService(); 