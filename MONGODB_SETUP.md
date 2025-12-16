# MongoDB Connection Setup Guide

## Common Issues and Solutions

### 1. Connection String Format

Your MongoDB connection string should look like this:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

### 2. Password URL Encoding

If your password contains special characters, you MUST encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- Space → `%20`

**Example:**
- Password: `Poll@12345`
- Encoded: `Poll%4012345`

### 3. Get Your Correct Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password (URL-encoded)
6. Replace `<dbname>` with `pollSystemDB` (or your database name)

### 4. Update server/.env File

Edit `server/.env` and update the `MONGO_URI`:

```env
PORT=5000
MONGO_URI=your_actual_connection_string_here
JWT_SECRET=super_secure_poll_system_secret_key
```

### 5. Network Access

Make sure your MongoDB Atlas cluster allows network access:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. For development, add `0.0.0.0/0` (allows all IPs)
4. Or add your specific IP address

### 6. Database User

Make sure you have a database user created:
1. Go to MongoDB Atlas → Database Access
2. Create a user with username and password
3. Give it "Read and write to any database" permissions

### 7. Test Connection

After updating `.env`, restart the server and check the console for:
- ✅ `Connected to MongoDB successfully` - Good!
- ❌ `MongoDB connection error` - Check the error message

## Current Error: `querySrv ENOTFOUND`

This error means:
- The cluster hostname is incorrect, OR
- DNS cannot resolve the MongoDB cluster address

**Solution:**
1. Verify your cluster name in MongoDB Atlas
2. Make sure the connection string uses the correct cluster hostname
3. Check your internet connection

