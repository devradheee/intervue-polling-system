require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

console.log('\n=== MongoDB Connection Test ===\n');

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env file');
  process.exit(1);
}

console.log('Connection string (hidden password):', MONGO_URI.replace(/:[^:@]+@/, ':****@'));
console.log('\nAttempting to connect...\n');

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
    console.log(`📝 Port: ${mongoose.connection.port}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED to connect');
    console.error('\nError details:');
    console.error('  Message:', error.message);
    console.error('  Name:', error.name);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 This usually means:');
      console.error('  - The cluster hostname is incorrect');
      console.error('  - Check your MongoDB Atlas cluster name');
      console.error('  - The connection string format might be wrong');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 This usually means:');
      console.error('  - Wrong username or password');
      console.error('  - Password needs URL encoding (@ → %40)');
      console.error('  - User might not exist in MongoDB Atlas');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 This usually means:');
      console.error('  - Network access not configured');
      console.error('  - Firewall blocking connection');
      console.error('  - Check MongoDB Atlas Network Access settings');
    }
    
    console.error('\n📋 Your connection string should look like:');
    console.error('mongodb+srv://USERNAME:ENCODED_PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority');
    console.error('\n🔧 Steps to fix:');
    console.error('1. Go to MongoDB Atlas → Connect → Connect your application');
    console.error('2. Copy the connection string');
    console.error('3. Replace <password> with your actual password (URL-encoded)');
    console.error('4. Replace <dbname> with pollSystemDB');
    console.error('5. Update server/.env file\n');
    
    process.exit(1);
  });

