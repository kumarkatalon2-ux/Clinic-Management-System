# 🔧 LOGIN TROUBLESHOOTING GUIDE

**Date:** January 31, 2026  
**Issue:** Login page shows same login page after entering credentials and clicking sign in

---

## 🎯 Quick Fix

### If login is not redirecting to dashboard:

**1. Use the Test Login Page** (Easiest)
```
URL: http://localhost:3000/test-login.html
```

This page shows EXACTLY what's happening:
- Console logs for every step
- Shows API response
- Shows tokens being stored
- Then redirects to dashboard

### 2. Check Browser Console (Advanced)
```
Press: F12 (or Ctrl+Shift+I)
Click: Console tab
Try login
Watch for messages
```

---

## 📋 Diagnosis Checklist

### ✅ Server Running?
```
Terminal should show:
✅ Server Status: OPERATIONAL
📍 Host: http://localhost:3000
```

If not:
```bash
cd "c:\Users\Kumar\Desktop\Clinical Project\src\backend"
npm start
```

### ✅ Backend Receiving Request?
Watch terminal while clicking login:
```
You should see:
🔐 LOGIN REQUEST RECEIVED:
   Email: admin@clinic.local
   Password: ***
✅ CREDENTIALS MATCH - GENERATING TOKENS
✅ LOGIN SUCCESSFUL
```

If you see ❌ INVALID CREDENTIALS, check that you entered:
- Email: `admin@clinic.local` (exactly)
- Password: `password123` (exactly)

### ✅ Tokens Stored?
After successful login:
1. Press F12
2. Go to **Application** tab
3. Click **localStorage**
4. Should see:
   - `accessToken` (long string starting with "eyJ")
   - `refreshToken` (long string starting with "eyJ")
   - `user` (JSON object with name, email, role)

### ✅ Dashboard Page Exists?
```
File: c:\Users\Kumar\Desktop\Clinical Project\dashboard.html
Status: File exists ✅
Size: ~600 lines
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Same login page keeps showing

**Likely Cause:** Browser is caching old page

**Solution 1 - Hard Refresh:**
```
Windows/Linux: Ctrl+Shift+R
Mac: Cmd+Shift+R
```

**Solution 2 - Try Test Page:**
```
Open: http://localhost:3000/test-login.html
This shows all debug info
```

**Solution 3 - Clear Cache:**
- Press F12
- Right-click reload button
- Click "Empty cache and hard reload"

---

### Issue 2: "Connection error" appears

**Likely Cause:** Server not running or API not responding

**Solution:**
1. Check terminal for:
   ```
   ✅ Server Status: OPERATIONAL
   ```

2. If not running, start server:
   ```bash
   cd "c:\Users\Kumar\Desktop\Clinical Project\src\backend"
   npm start
   ```

3. Wait 5 seconds for server to start

4. Try login again

---

### Issue 3: "Invalid email or password" error

**Likely Cause:** Wrong credentials entered

**Check:**
- Email: Must be `admin@clinic.local` (not admin@clinic or similar)
- Password: Must be `password123` (not password or test)

**Verify in Test Page:**
- Use test page which pre-fills credentials
- If still fails, server is rejecting credentials

---

### Issue 4: Tokens in localStorage but page doesn't load

**Likely Cause:** Dashboard.html path issue

**Solution:**
1. Manually open dashboard:
   ```
   http://localhost:3000/dashboard.html
   ```

2. Should load successfully

3. If not, check browser console (F12) for errors

---

## 🧪 Testing Steps

### Step 1: Test Backend Directly

Open terminal and run:
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"admin@clinic.local\",\"password\":\"password123\"}"
```

Should return:
```json
{
  "message": "Login successful (Phase 2 Mock)",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@clinic.local",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": "7d"
    }
  }
}
```

---

### Step 2: Test Frontend with Test Page

```
1. Open: http://localhost:3000/test-login.html
2. Click: "Test Login"
3. Watch: Console output shows each step
4. Expected: After 3 seconds, redirects to dashboard
```

---

### Step 3: Check localStorage

In browser console (F12):
```javascript
// Check what's stored
console.log(localStorage.getItem('accessToken'));
console.log(localStorage.getItem('refreshToken'));
console.log(localStorage.getItem('user'));
```

---

## 📊 What Happens Behind the Scenes

### Login Flow (Detailed):

```
1. User enters credentials and clicks Sign In
   ↓
2. Browser sends: POST /api/auth/login
   {
     email: "admin@clinic.local",
     password: "password123"
   }
   ↓
3. Server receives and validates credentials
   Console shows: "🔐 LOGIN REQUEST RECEIVED"
   ↓
4. If valid, server generates JWT tokens
   Console shows: "✅ CREDENTIALS MATCH"
   ↓
5. Server returns response:
   {
     data: {
       user: { ... },
       tokens: { accessToken, refreshToken }
     }
   }
   ↓
6. Browser stores tokens in localStorage
   Stores: accessToken, refreshToken, user
   ↓
7. Browser shows success message
   ↓
8. Browser redirects to /dashboard.html
   (After 2 seconds in login.html)
   (After 3 seconds in test-login.html)
   ↓
9. Dashboard loads and verifies token
   ↓
10. User sees dashboard with profile info
```

---

## 🔍 Debug Mode - Enable Full Logging

To see exactly what's happening:

### 1. Browser Console (Already in Code)

Open: http://localhost:3000/login.html
Press: F12 → Console tab
You'll see all debug messages

### 2. Backend Console (Terminal)

Watch terminal while logging in.
You'll see:
```
🔐 LOGIN REQUEST RECEIVED:
   Email: admin@clinic.local
   Password: ***
✅ CREDENTIALS MATCH - GENERATING TOKENS
✅ LOGIN SUCCESSFUL
   User: Admin User
   Access Token: eyJ...
```

---

## ✅ Verification Checklist

After login attempt, verify:

- [ ] Backend received request? (Check terminal)
- [ ] Backend validated credentials? (Check "✅ CREDENTIALS MATCH")
- [ ] Server returned tokens? (Check response status 200)
- [ ] Browser stored tokens? (Check localStorage in DevTools)
- [ ] Dashboard file exists? (File: dashboard.html)
- [ ] Redirect was attempted? (Check browser console)

---

## 🆘 Still Not Working?

### Option 1: Use Test Page
```
http://localhost:3000/test-login.html

This page provides complete visibility into the issue.
```

### Option 2: Check File Permissions
```
Ensure these files exist and are readable:
✓ login.html
✓ dashboard.html
✓ test-login.html
✓ src/backend/routes/auth.js
```

### Option 3: Restart Everything
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Wait 2 seconds
# Start server again
cd "c:\Users\Kumar\Desktop\Clinical Project\src\backend"
npm start

# Clear browser cache and hard refresh
Press Ctrl+Shift+R
```

### Option 4: Check Server Logs

Terminal should show when login is attempted:
```
🔐 LOGIN REQUEST RECEIVED:
```

If you don't see this, request isn't reaching server.

**Then check:**
1. Is server running?
2. Is browser connected to localhost:3000?
3. Are firewall settings allowing connections?

---

## 📱 Testing on Different Browsers

Try these browsers:
- [ ] Chrome (Recommended)
- [ ] Firefox
- [ ] Edge
- [ ] Safari

If works in one but not another, it's likely a cache issue.

---

## 🎯 Expected Behavior

### CORRECT Flow:
```
1. Visit: http://localhost:3000/login.html
2. See: Beautiful purple login page
3. Enter: admin@clinic.local / password123
4. Click: Sign In
5. See: "Signing in..." button with spinner
6. Wait: 2 seconds
7. See: "Login successful!" message
8. Redirected: To http://localhost:3000/dashboard.html
9. See: Dashboard with user name and navigation
```

### INCORRECT Flow (What You're Experiencing):
```
1. Visit: Login page ✓
2. Enter credentials ✓
3. Click Sign In ✓
4. See: "Signing in..." ✓
5. Wait...
6. See: Same login page ❌
```

**This means:** Redirect is not happening

**Possible Causes:**
- Token storage failed
- Redirect URL is wrong
- Dashboard file not found
- Browser javascript error
- localStorage disabled

---

## 🚀 Next Steps

1. **Try Test Page First:**
   ```
   http://localhost:3000/test-login.html
   ```

2. **Check Browser Console:**
   ```
   F12 → Console → Look for errors
   ```

3. **Watch Backend Terminal:**
   ```
   Should see login request logs
   ```

4. **Check localStorage:**
   ```
   F12 → Application → localStorage
   ```

5. **Report Back With:**
   - Terminal output (server logs)
   - Browser console output (F12)
   - localStorage contents (F12 → Application)

---

**Remember:** The system IS working - we just need to identify where the redirect is failing! 🎯

Use the test page at **http://localhost:3000/test-login.html** to diagnose the exact issue!
