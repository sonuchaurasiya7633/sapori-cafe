import mongoose from 'mongoose';
import { runMongoDBSeeder } from '../src/lib/db/seeder';

runMongoDBSeeder()
  .then((res) => {
    console.log('\n====================================================');
    console.log('📊 MONGODB ATLAS LIVE COLLECTIONS SUMMARY');
    console.log('====================================================');
    console.table(res.stats);
    console.log('====================================================');
    console.log('✨ ALL SCHEMAS & SEED DATA CREATED IN MONGODB ATLAS!');
    console.log('====================================================');
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('🔌 Disconnected cleanly from MongoDB Atlas.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  });
