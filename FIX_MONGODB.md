# 🔧 Fix MongoDB Connection - Quick Guide

## ❌ Current Error
```
querySrv ENOTFOUND _mongodb._tcp.cluster0.mongodb.net
```

This means: **The cluster hostname is wrong or doesn't exist**

## ✅ How to Fix (3 Steps)

### Step 1: Get Your Real Connection String

1. Go to **https://cloud.mongodb.com/**
2. Log in to your MongoDB Atlas account
3. Click on your **cluster** (or create one if you don't have it)
4. Click the **"Connect"** button
5. Choose **"Connect your application"**
6. Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   **Note:** The `xxxxx` part will be YOUR actual cluster name (not "cluster0.mongodb.net")

### Step 2: Update Your Connection String

1. Open `server/.env` file
2. Find the `MONGO_URI` line
3. Replace it with your connection string from Step 1
4. **Important:** 
   - Replace `<password>` with your actual password
   - **URL-encode special characters:**
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`
   - Replace `<dbname>` or add `/pollSystemDB` before the `?`

**Example:**
```env
MONGO_URI=mongodb+srv://poll:Poll%4012345@cluster0.abc123.mongodb.net/pollSystemDB?retryWrites=true&w=majority
```

### Step 3: Test the Connection

Run this command to test:
```powershell
cd server
node test-connection.js
```

If you see ✅ SUCCESS, you're done!

## 🔍 Common Issues

### Issue 1: Wrong Cluster Name
- **Symptom:** `ENOTFOUND` error
- **Fix:** Get the correct cluster hostname from MongoDB Atlas

### Issue 2: Password Not Encoded
- **Symptom:** Authentication failed
- **Fix:** URL-encode special characters in password

### Issue 3: Network Access
- **Symptom:** Connection timeout
- **Fix:** 
  1. Go to MongoDB Atlas → Network Access
  2. Click "Add IP Address"
  3. Add `0.0.0.0/0` (allows all IPs) OR your specific IP

### Issue 4: No Database User
- **Symptom:** Authentication failed
- **Fix:**
  1. Go to MongoDB Atlas → Database Access
  2. Create a user with username and password
  3. Give it "Read and write to any database" permissions

## 🚀 After Fixing

1. Restart your server:
   ```powershell
   npm run dev
   ```

2. Check the console for: `✅ Connected to MongoDB successfully`

3. Open http://localhost:3000 and test creating a poll!

