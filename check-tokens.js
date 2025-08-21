const mongoose = require('mongoose');

async function checkTokens() {
  try {
    await mongoose.connect('mongodb://localhost:27017/social-catalyst');
    console.log('✅ Connected to MongoDB');
    
    const Employee = require('./server/models/Employee');
    const employees = await Employee.find({'socialNetworks.linkedin.accessToken': {$exists: true}});
    
    console.log(`\n📊 Found ${employees.length} employees with LinkedIn tokens:`);
    
    employees.forEach(emp => {
      const linkedin = emp.socialNetworks.linkedin;
      console.log(`\n👤 ${emp.firstName} ${emp.lastName} (${emp._id})`);
      console.log(`   Profile ID: ${linkedin.profileId}`);
      console.log(`   Has Token: ${!!linkedin.accessToken}`);
      console.log(`   Token Expiry: ${linkedin.tokenExpiry}`);
      console.log(`   Is Connected: ${linkedin.isConnected}`);
      console.log(`   Permissions: ${linkedin.permissions?.join(', ')}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTokens(); 