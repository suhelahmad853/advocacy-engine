require('dotenv').config();

console.log('🔍 CHECKING LINKEDIN REDIRECT URI MISMATCH\n');
console.log('=' .repeat(60));

// Check current environment configuration
console.log('🔧 CURRENT ENVIRONMENT CONFIGURATION:');
console.log(`LINKEDIN_REDIRECT_URI: ${process.env.LINKEDIN_REDIRECT_URI || '❌ NOT SET'}`);
console.log(`CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
console.log(`SERVER_URL: ${process.env.SERVER_URL || 'http://localhost:5000'}`);

// Check what the OAuth flow is actually using
console.log('\n🔗 OAUTH FLOW ANALYSIS:');

const envRedirectUri = process.env.LINKEDIN_REDIRECT_URI;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

if (envRedirectUri) {
  console.log(`✅ Environment redirect URI: ${envRedirectUri}`);
  
  if (envRedirectUri.includes('localhost:3000')) {
    console.log('⚠️  Redirect URI points to FRONTEND (localhost:3000)');
    console.log('💡 This means LinkedIn will redirect to your React app');
    console.log('💡 Your React app must then forward the auth code to the backend');
  } else if (envRedirectUri.includes('localhost:5000')) {
    console.log('✅ Redirect URI points to BACKEND (localhost:5000)');
    console.log('💡 This means LinkedIn will redirect directly to your Express API');
  }
  
  // Check if this matches your LinkedIn app configuration
  console.log('\n⚠️  LINKEDIN APP CONFIGURATION CHECK REQUIRED:');
  console.log('1. Go to LinkedIn Developer Console');
  console.log('2. Find your app: 77h8ujh2l254wj');
  console.log('3. Click "Auth" tab');
  console.log('4. Check "Redirect URLs" section');
  console.log(`5. Ensure this URL is listed: ${envRedirectUri}`);
  
} else {
  console.log('❌ LINKEDIN_REDIRECT_URI is not set in environment');
  console.log('💡 This will cause OAuth to fail');
}

// Check the actual OAuth flow implementation
console.log('\n🔍 OAUTH FLOW IMPLEMENTATION:');

if (envRedirectUri && envRedirectUri.includes('localhost:3000')) {
  console.log('📋 FRONTEND REDIRECT FLOW (Current Setup):');
  console.log('1. User clicks "Connect LinkedIn"');
  console.log('2. Backend generates OAuth URL with redirect_uri=localhost:3000');
  console.log('3. User authorizes on LinkedIn');
  console.log('4. LinkedIn redirects to: localhost:3000/auth/linkedin/callback');
  console.log('5. Frontend receives auth code and state');
  console.log('6. Frontend sends code to: localhost:5000/api/linkedin/oauth/callback');
  console.log('7. Backend exchanges code for tokens');
  
  console.log('\n⚠️  POTENTIAL ISSUES:');
  console.log('- LinkedIn expects redirect to localhost:3000');
  console.log('- But token exchange happens at localhost:5000');
  console.log('- This mismatch can cause "Failed to exchange authorization code for tokens"');
  
} else if (envRedirectUri && envRedirectUri.includes('localhost:5000')) {
  console.log('📋 BACKEND REDIRECT FLOW:');
  console.log('1. User clicks "Connect LinkedIn"');
  console.log('2. Backend generates OAuth URL with redirect_uri=localhost:5000');
  console.log('3. User authorizes on LinkedIn');
  console.log('4. LinkedIn redirects to: localhost:5000/api/linkedin/oauth/callback');
  console.log('5. Backend directly receives auth code and exchanges for tokens');
  
  console.log('\n✅ This flow is simpler and more reliable');
}

// Generate test OAuth URL
console.log('\n🔗 TEST OAUTH URL GENERATION:');

const clientId = process.env.LINKEDIN_CLIENT_ID;
const scope = 'openid profile w_member_social email';
const state = `test_${Date.now()}`;

if (clientId && envRedirectUri) {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(envRedirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  
  console.log('✅ OAuth URL generated successfully');
  console.log(`🔗 Test Auth URL: ${authUrl.substring(0, 100)}...`);
  console.log(`📋 Redirect URI: ${envRedirectUri}`);
  console.log(`🔒 Scopes: ${scope}`);
  console.log(`🎯 State: ${state}`);
  
} else {
  console.log('❌ Cannot generate OAuth URL - missing required environment variables');
}

// Recommendations
console.log('\n💡 RECOMMENDATIONS:');
console.log('1. Ensure LinkedIn app redirect URI matches environment variable');
console.log('2. Choose ONE approach: Frontend redirect OR Backend redirect');
console.log('3. Test OAuth flow with the generated URL above');
console.log('4. Check server logs for any remaining errors');

console.log('\n' + '=' .repeat(60));
console.log('📋 NEXT STEPS:');
console.log('1. Fix redirect URI mismatch in LinkedIn app or environment');
console.log('2. Test OAuth flow again');
console.log('3. Check if "Failed to exchange authorization code for tokens" error is resolved'); 