#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔗 LinkedIn OAuth 2.0 Setup for advocacy-engine\n');

console.log('📋 Before we start, you need to:');
console.log('1. Go to https://www.linkedin.com/developers/');
console.log('2. Create a new app called "advocacy-engine"');
console.log('3. Get your Client ID and Client Secret');
console.log('4. Add redirect URL: http://localhost:3000/auth/linkedin/callback\n');

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupLinkedInOAuth() {
  try {
    // Get LinkedIn credentials
    const clientId = await question('Enter your LinkedIn Client ID: ');
    const clientSecret = await question('Enter your LinkedIn Client Secret: ');
    
    // Get other configuration
    const port = await question('Enter server port (default: 5000): ') || '5000';
    const mongoUri = await question('Enter MongoDB URI (default: mongodb://localhost:27017/social-catalyst): ') || 'mongodb://localhost:27017/social-catalyst';
    const jwtSecret = await question('Enter JWT secret (default: your-super-secret-jwt-key): ') || 'your-super-secret-jwt-key';
    
    // Create .env content
    const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=development

# Database Configuration
MONGODB_URI=${mongoUri}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# LinkedIn OAuth 2.0 Configuration
LINKEDIN_CLIENT_ID=${clientId}
LINKEDIN_CLIENT_SECRET=${clientSecret}
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback

# Social Media API Keys (for future integrations)
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Redis Configuration (for caching and sessions)
REDIS_URL=redis://localhost:6379

# Analytics Configuration
GOOGLE_ANALYTICS_ID=your-ga-id
MIXPANEL_TOKEN=your-mixpanel-token

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
`;

    // Write .env file
    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Environment configuration created successfully!');
    console.log(`📁 File created: ${envPath}`);
    
    // Create test script
    const testScript = `#!/usr/bin/env node

const axios = require('axios');

console.log('🧪 Testing LinkedIn OAuth 2.0 Configuration...\\n');

async function testConfiguration() {
  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connection...');
    try {
      const response = await axios.get('http://localhost:${port}/api/health');
      console.log('✅ Backend is running');
      console.log('   Status:', response.data.status);
    } catch (error) {
      console.log('❌ Backend is not running');
      console.log('   Start backend with: npm run server:dev');
      return;
    }

    // Test 2: Test LinkedIn OAuth endpoint
    console.log('\\n2️⃣ Testing LinkedIn OAuth endpoint...');
    try {
      const response = await axios.get('http://localhost:${port}/api/linkedin/oauth/authorize/test-employee-id', {
        headers: { Authorization: 'Bearer test-token' }
      });
      console.log('✅ OAuth endpoint working');
      console.log('   Auth URL generated successfully');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ OAuth endpoint working (expected auth error)');
      } else {
        console.log('❌ OAuth endpoint failed:', error.response?.data?.error || error.message);
      }
    }

    console.log('\\n🎯 Configuration test completed!');
    console.log('📋 Next steps:');
    console.log('   1. Start frontend: npm run client:dev');
    console.log('   2. Go to http://localhost:3000/profile');
    console.log('   3. Click "Connect LinkedIn" to test OAuth flow');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConfiguration();
`;

    const testPath = path.join(process.cwd(), 'test-linkedin-oauth.js');
    fs.writeFileSync(testPath, testScript);
    
    console.log(`🧪 Test script created: ${testPath}`);
    console.log('   Run with: node test-linkedin-oauth.js');
    
    // Create startup script
    const startupScript = `#!/bin/bash

echo "🚀 Starting Social Catalyst with LinkedIn OAuth 2.0..."
echo ""

echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

echo "🔧 Installing dependencies..."
npm run install:all

echo ""
echo "🚀 Starting development servers..."
echo "   Backend: http://localhost:${port}"
echo "   Frontend: http://localhost:3000"
echo ""

npm run dev
`;

    const startupPath = path.join(process.cwd(), 'start-linkedin-oauth.sh');
    fs.writeFileSync(startupPath, startupScript);
    fs.chmodSync(startupPath, '755');
    
    console.log(`🚀 Startup script created: ${startupPath}`);
    console.log('   Run with: ./start-linkedin-oauth.sh');
    
    console.log('\n🎉 Setup complete! Your advocacy-engine is ready for LinkedIn OAuth 2.0!');
    console.log('\n📋 Quick start:');
    console.log('   1. ./start-linkedin-oauth.sh');
    console.log('   2. Go to http://localhost:3000/profile');
    console.log('   3. Click "Connect LinkedIn" to test!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupLinkedInOAuth(); 