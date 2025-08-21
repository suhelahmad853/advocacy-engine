# 🔗 LinkedIn OAuth 2.0 Setup Guide for "advocacy-engine"

## 🎯 **What We're Building:**
- **App Name**: advocacy-engine
- **Purpose**: Employee advocacy platform for LinkedIn content sharing
- **Admin Setup**: One-time LinkedIn developer account setup
- **Employee Usage**: One-click LinkedIn connection for all employees

---

## 📋 **STEP-BY-STEP ADMIN SETUP:**

### **1. Create LinkedIn Developer Account**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **"Create App"**
3. Sign in with your LinkedIn account
4. Fill in app details:
   - **App Name**: `advocacy-engine`
   - **LinkedIn Page**: Your company's LinkedIn page
   - **App Logo**: Upload your company logo
   - **App Description**: "Employee advocacy platform for sharing company content"

### **2. Configure OAuth 2.0 Settings**
1. In your app dashboard, go to **"Auth"** tab
2. Add **Redirect URLs**:
   - `http://localhost:3000/auth/linkedin/callback` (Development)
   - `https://yourdomain.com/auth/linkedin/callback` (Production)
3. Request these **OAuth 2.0 scopes**:
   - `r_liteprofile` - Read basic profile
   - `r_emailaddress` - Read email address
   - `w_member_social` - Post content on behalf of user

### **3. Get Your Credentials**
1. Go to **"Auth"** tab
2. Copy your **Client ID** and **Client Secret**
3. Keep these secure - they identify your app

---

## 🔧 **ENVIRONMENT CONFIGURATION:**

### **Create .env file:**
```bash
# LinkedIn OAuth 2.0 Configuration
LINKEDIN_CLIENT_ID=your-client-id-from-linkedin
LINKEDIN_CLIENT_SECRET=your-client-secret-from-linkedin
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback

# Other settings...
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-catalyst
JWT_SECRET=your-jwt-secret
```

---

## 🧪 **TESTING THE IMPLEMENTATION:**

### **1. Start the System:**
```bash
# Terminal 1: Start backend
npm run server:dev

# Terminal 2: Start frontend  
npm run client:dev
```

### **2. Test OAuth Flow:**
1. Go to `http://localhost:3000/profile`
2. Click **"Connect LinkedIn"**
3. LinkedIn popup should open
4. Authorize the app
5. Check connection status

---

## 🔍 **TROUBLESHOOTING:**

### **Common Issues:**
- **"Invalid client_id"**: Check your Client ID in .env
- **"Invalid redirect_uri"**: Verify redirect URL matches LinkedIn app settings
- **"Insufficient permissions"**: Ensure all required scopes are requested

### **Debug Commands:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check LinkedIn OAuth endpoint
curl http://localhost:5000/api/linkedin/oauth/authorize/test-employee-id
```

---

## 🚀 **PRODUCTION DEPLOYMENT:**

### **1. Update Redirect URLs:**
- Change from `localhost:3000` to your production domain
- Update `.env` file with production URLs

### **2. Security Considerations:**
- Use strong JWT secrets
- Enable HTTPS in production
- Monitor API usage and limits

---

## 📊 **MONITORING & ANALYTICS:**

### **Admin Dashboard:**
- Go to `/admin/employees` to see all LinkedIn connections
- Monitor connection status and token expiry
- Track employee advocacy participation

### **LinkedIn App Analytics:**
- Check your LinkedIn developer dashboard
- Monitor API usage and limits
- Review app performance metrics

---

## 🎉 **SUCCESS INDICATORS:**

### **✅ Working OAuth Flow:**
- LinkedIn popup opens when clicking "Connect"
- Employee can authorize the app
- Connection status shows "Connected"
- Employee can share content to LinkedIn

### **✅ Admin Control:**
- Can see all employee connections
- Can monitor connection status
- Can help employees with issues
- Centralized management dashboard

---

## 🔗 **USEFUL LINKS:**

- [LinkedIn Developers](https://www.linkedin.com/developers/)
- [OAuth 2.0 Documentation](https://developer.linkedin.com/docs/oauth2)
- [API Reference](https://developer.linkedin.com/docs)
- [App Review Process](https://developer.linkedin.com/docs/app-review-process)

---

## 📞 **SUPPORT:**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your LinkedIn app configuration
3. Check browser console for errors
4. Review backend logs for API errors

**Your advocacy-engine app will be the foundation for all employee LinkedIn connections!** 🎯✨ 