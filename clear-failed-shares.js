const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-catalyst', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Advocacy = require('./server/models/Advocacy');

async function clearFailedLinkedInShares() {
  try {
    console.log('🔍 Finding failed LinkedIn shares...');
    
    // Find Advocacy records for LinkedIn that don't have valid share URLs
    const failedShares = await Advocacy.find({
      platform: 'linkedin',
      $or: [
        { shareUrl: { $exists: false } },
        { shareUrl: '' },
        { shareUrl: null }
      ]
    });
    
    console.log(`📊 Found ${failedShares.length} failed LinkedIn shares`);
    
    if (failedShares.length > 0) {
      console.log('🗑️  Deleting failed shares...');
      await Advocacy.deleteMany({
        platform: 'linkedin',
        $or: [
          { shareUrl: { $exists: false } },
          { shareUrl: '' },
          { shareUrl: null }
        ]
      });
      console.log('✅ Failed shares cleared successfully');
    } else {
      console.log('✅ No failed shares found');
    }
    
    // Also clear any shares from the last hour to reset the cooldown
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentShares = await Advocacy.find({
      platform: 'linkedin',
      createdAt: { $gte: oneHourAgo }
    });
    
    console.log(`📊 Found ${recentShares.length} recent LinkedIn shares`);
    
    if (recentShares.length > 0) {
      console.log('🗑️  Clearing recent shares to reset cooldown...');
      await Advocacy.deleteMany({
        platform: 'linkedin',
        createdAt: { $gte: oneHourAgo }
      });
      console.log('✅ Recent shares cleared, cooldown reset');
    }
    
  } catch (error) {
    console.error('❌ Error clearing failed shares:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

clearFailedLinkedInShares(); 