# 🎯 HOW TO LOGIN & TEST THE APPLICATION

## 📍 Current Status

✅ **Server:** Running on http://localhost:3000  
✅ **Login Page:** Ready at http://localhost:3000/login.html  
✅ **Backend:** All endpoints operational  

---

## 🚀 Step-by-Step Login Instructions

### **Step 1: Open Login Page**

**URL:** http://localhost:3000/login.html

You should see a **purple gradient login page** with:
- 🏥 Clinical Management System header
- Two tabs: "Login" and "Register"
- Email and Password fields
- Demo credentials display

### **Step 2: Enter Demo Credentials**

**Tab:** Login (should be selected by default)

Fill in these fields:
```
Email:    admin@clinic.local
Password: password123
```

**Note:** These are pre-configured demo credentials in the mock authentication system.

### **Step 3: Click "Sign In"**

- Button will show "Signing in..." with loading spinner
- System generates JWT tokens
- Tokens are stored in localStorage
- After 1-2 seconds, you're redirected to dashboard

### **Step 4: Dashboard Displays**

After successful login, you'll see:
- **Welcome message** with your name
- **User role** (Admin)
- **Sidebar navigation** with options:
  - 📊 Dashboard
  - 👥 Patients
  - 📅 Appointments
  - 💬 Consultations
  - 💊 Prescriptions
  - 🧪 Lab Results
  - 💰 Billing
  - ⚙️ Settings

- **Statistics cards** showing:
  - Total Patients: 142
  - Today's Appointments: 8
  - Pending Consultations: 5
  - Lab Results Pending: 12

- **Feature cards** for all modules
- **Recent Activity** log

### **Step 5: Explore Dashboard**

- Click sidebar items to switch between sections
- Click "Logout" button to logout
- Each section shows a "Coming Soon" message (Phase placeholders)

---

## 🧪 Testing Different Scenarios

### **Scenario 1: Test Login Success**

```
Email:    admin@clinic.local
Password: password123
Expected: ✅ Redirect to dashboard
```

### **Scenario 2: Test Registration**

1. Click **Register** tab
2. Fill in:
   ```
   First Name: John
   Last Name: Doe
   Email: john.doe@clinic.com
   Password: test1234
   Confirm Password: test1234
   Role: Patient (or Doctor, Nurse, Receptionist)
   ```
3. Click "Create Account"
4. See success message
5. Auto-filled email in login tab
6. Can now login with new account

### **Scenario 3: Test Invalid Credentials**

1. Use incorrect password (e.g., "wrong")
2. Click "Sign In"
3. See error: "Invalid email or password"

### **Scenario 4: Test Health Endpoints**

1. On login page, click **"Test Health"** button
2. Should show: "✓ Health OK - Uptime: XXX.Xs"

3. Click **"API Status"** button
4. Should show: "✓ API Status: Phase 1 - Scaffolding Complete"

---

## 📱 Features You Can Test

### **On Login Page:**
- ✅ Email validation
- ✅ Password fields (hidden)
- ✅ Form submission
- ✅ Error handling
- ✅ Loading states
- ✅ Remember me checkbox
- ✅ Forgot password link
- ✅ Role selection on register
- ✅ Health/Status test buttons

### **On Dashboard:**
- ✅ User info display (top right)
- ✅ Navigation sidebar
- ✅ Responsive design (try resizing browser)
- ✅ Section switching
- ✅ Logout functionality
- ✅ Token verification on load

---

## 🔧 Troubleshooting

### **Issue: Still seeing old index.html**

**Solution:** 
1. Hard refresh: Press `Ctrl+Shift+R` in browser
2. Or open directly: http://localhost:3000/login.html
3. Or clear browser cache and reload

### **Issue: "Connection error" on login**

**Solution:**
1. Make sure server is running
2. Check terminal for: "✅ Server Status: OPERATIONAL"
3. Try refreshing page

### **Issue: Dashboard doesn't load after login**

**Solution:**
1. Check browser console (F12)
2. Verify tokens in localStorage (F12 → Application → localStorage)
3. Refresh page
4. Try logging in again

### **Issue: Buttons not working**

**Solution:**
1. Hard refresh page (`Ctrl+Shift+R`)
2. Clear browser cache
3. Try different browser

---

## 🔐 What's Happening Behind the Scenes

### **Login Flow:**

```
1. User enters credentials in login.html
   ↓
2. Form submits to POST /api/auth/login
   ↓
3. Backend validates credentials (demo: admin@clinic.local / password123)
   ↓
4. Server generates JWT tokens:
   - Access Token: 7-day expiry
   - Refresh Token: 30-day expiry
   ↓
5. Frontend stores tokens in localStorage
   ↓
6. Frontend redirects to /dashboard.html
   ↓
7. Dashboard verifies token with GET /api/auth/verify
   ↓
8. User sees dashboard with profile info
```

### **Token Storage:**

Tokens are stored in browser localStorage:
- `accessToken` - Used for API requests
- `refreshToken` - Used to get new access token
- `user` - User profile (name, email, role)

To view in browser:
1. Press `F12` (Developer Tools)
2. Go to **Application** tab
3. Click **localStorage**
4. Look for: `accessToken`, `refreshToken`, `user`

---

## 🎯 Available Endpoints (for API testing)

### **Public Endpoints:**
```
GET  /health              → Server health check
GET  /api/status          → System status
POST /api/auth/login      → Login with credentials
POST /api/auth/register   → Create new account
POST /api/auth/refresh    → Refresh access token
GET  /api/patients        → Mock patient data
```

### **Protected Endpoints (require token):**
```
GET  /api/auth/verify     → Verify token is valid
GET  /api/auth/profile    → Get user profile
POST /api/auth/logout     → Logout user
```

---

## 💾 Session Persistence

When you login:
- ✅ Tokens saved in localStorage
- ✅ Survives browser refresh
- ✅ Survives closing and reopening browser
- ✅ Valid for 7 days (access token)

When you logout:
- ✅ localStorage cleared
- ✅ Redirected to login page
- ✅ Must login again

---

## 📊 Quick Reference

| Item | Details |
|------|---------|
| **Login URL** | http://localhost:3000/login.html |
| **Default Email** | admin@clinic.local |
| **Default Password** | password123 |
| **Dashboard URL** | http://localhost:3000/dashboard.html |
| **Server Port** | 3000 |
| **Server Status** | ✅ RUNNING |
| **Authentication** | JWT Tokens |
| **Storage** | localStorage |

---

## ✨ Next Steps After Login

1. **Explore Dashboard** - Click sidebar items
2. **Test Endpoints** - Use browser DevTools to inspect network requests
3. **Try Registration** - Create a new account with different role
4. **Check Tokens** - View localStorage tokens in DevTools
5. **Test Logout** - Click logout and verify redirect to login

---

## 🚀 Ready to Start?

```
1. Browser should show: http://localhost:3000/login.html
2. Look for purple login page with email/password fields
3. Enter: admin@clinic.local / password123
4. Click: Sign In
5. Result: Dashboard appears with welcome message
```

**Start testing now! The system is fully operational and ready for use.** 🎉

---

## 📞 Having Issues?

**Problem:** Login page not showing
- Solution: Try http://localhost:3000/login.html directly

**Problem:** Can't login
- Solution: Verify credentials are: admin@clinic.local / password123

**Problem:** Dashboard doesn't show after login
- Solution: Check browser console for errors (F12)

**Problem:** Need to test APIs
- Solution: Use terminal with curl commands or browser Network tab

All problems can be resolved by refreshing page or checking browser console! ✅
