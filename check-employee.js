const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst');

// Import models
const Employee = require('./server/models/Employee');

async function checkEmployee() {
  try {
    console.log('🔍 Checking Employee LinkedIn Connection\n');
    
    const employee = await Employee.findOne();
    if (!employee) {
      console.log('❌ No employees found');
      return;
    }
    
    console.log('👤 Employee:', employee.firstName, employee.lastName);
    console.log('Email:', employee.email);
    console.log('\n📱 Social Networks:');
    console.log('LinkedIn connected:', employee.socialNetworks.linkedin.isConnected);
    console.log('LinkedIn profileId:', employee.socialNetworks.linkedin.profileId);
    console.log('LinkedIn accessToken:', employee.socialNetworks.linkedin.accessToken ? '✅ Present' : '❌ Missing');
    console.log('LinkedIn profileUrl:', employee.socialNetworks.linkedin.profileUrl);
    
    console.log('\n🔑 Full LinkedIn object:');
    console.log(JSON.stringify(employee.socialNetworks.linkedin, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkEmployee(); 