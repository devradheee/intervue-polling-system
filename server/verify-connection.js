require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;

console.log('\n=== MongoDB Connection Verification ===\n');

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env file');
  process.exit(1);
}

// Validate connection string format
console.log('1. Checking connection string format...');
const uriPattern = /^mongodb\+srv:\/\/[^:]+:[^@]+@[^/]+\/[^?]+\?/;
if (!uriPattern.test(MONGO_URI)) {
  console.error('❌ Invalid connection string format');
  console.error('Expected format: mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority');
  process.exit(1);
}
console.log('✅ Connection string format is valid');

// Extract components
const match = MONGO_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
if (match) {
  const [, username, password, cluster, database] = match;
  console.log(`\n2. Connection string components:`);
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password.length > 0 ? '***' + password.slice(-2) : 'NOT SET'}`);
  console.log(`   Cluster: ${cluster}`);
  console.log(`   Database: ${database}`);
  
  // Check for common issues
  console.log(`\n3. Checking for common issues...`);
  
  if (cluster === 'cluster0.mongodb.net') {
    console.error('   ⚠️  WARNING: cluster0.mongodb.net is a placeholder!');
    console.error('   You need to replace this with your actual cluster hostname from MongoDB Atlas.');
  }
  
  if (password.includes('@') && !password.includes('%40')) {
    console.error('   ⚠️  WARNING: Password contains @ but is not URL-encoded!');
    console.error('   You need to encode @ as %40 in your password.');
  }
  
  if (password.includes('#') && !password.includes('%23')) {
    console.error('   ⚠️  WARNING: Password contains # but is not URL-encoded!');
    console.error('   You need to encode # as %23 in your password.');
  }
}

console.log('\n4. Attempting connection...\n');

const client = new MongoClient(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});

client
  .connect()
  .then(async () => {
    console.log('✅ SUCCESS! Connected to MongoDB');
    
    // Get database info
    const adminDb = client.db().admin();
    const serverInfo = await adminDb.serverStatus();
    console.log(`📊 Server Version: ${serverInfo.version}`);
    
    // List databases
    const db = client.db();
    const dbName = db.databaseName;
    console.log(`📁 Database: ${dbName}`);
    
    // Test a simple operation
    const collections = await db.listCollections().toArray();
    console.log(`📚 Collections: ${collections.length}`);
    if (collections.length > 0) {
      console.log(`   - ${collections.map(c => c.name).join(', ')}`);
    }
    
    await client.close();
    console.log('\n✅ Connection test completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED to connect\n');
    console.error('Error details:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Name: ${error.name}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 This means the cluster hostname is incorrect.');
      console.error('   Steps to fix:');
      console.error('   1. Go to MongoDB Atlas → Your Cluster → Connect');
      console.error('   2. Choose "Connect your application"');
      console.error('   3. Copy the connection string');
      console.error('   4. Replace <password> with your password (URL-encoded)');
      console.error('   5. Update server/.env with the correct MONGO_URI');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 This means authentication failed.');
      console.error('   Steps to fix:');
      console.error('   1. Check your username and password');
      console.error('   2. Make sure password is URL-encoded');
      console.error('   3. Verify the database user exists in MongoDB Atlas');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 This means connection timed out.');
      console.error('   Steps to fix:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas Network Access allows your IP');
      console.error('   3. Add 0.0.0.0/0 to allow all IPs (for development)');
    }
    
    console.error('\n');
    process.exit(1);
  });

