# Phase 2.2: Real Authentication Implementation

**Status:** READY TO START  
**Prerequisites:** ✅ ALL COMPLETE  
**Estimated Duration:** 2-3 hours  
**Priority:** HIGH (Blocks all user-facing features)

---

## 🎯 Objectives

1. Replace mock JWT authentication with real database-backed authentication
2. Implement password hashing with bcryptjs
3. Add user registration endpoint
4. Add password reset capability
5. Implement role-based access control (RBAC)
6. Add token refresh mechanism

---

## 📋 Implementation Tasks

### Task 1: Update Auth Routes with Real Database Integration

**File:** `src/backend/routes/auth.js`

**Current State:**
- Uses mock credentials (admin/admin123)
- Returns mock JWT tokens
- No database validation

**Changes Required:**
1. Replace mock credential check with database query
2. Use bcryptjs to validate passwords
3. Generate real JWT tokens
4. Implement error handling for invalid credentials

**Expected Changes:**
```javascript
// BEFORE (Mock)
if (email === 'admin@clinic.com' && password === 'admin123') {
  // Issue token
}

// AFTER (Real)
const user = await User.findByEmail(email);
if (user && await bcrypt.compare(password, user.password_hash)) {
  // Issue token with user data
}
```

---

### Task 2: Implement User Registration Endpoint

**File:** `src/backend/routes/auth.js`

**New Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "email": "newuser@clinic.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "patient"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "newuser@clinic.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "patient"
  }
}
```

**Validation:**
- Email must be valid and unique
- Password must be at least 8 characters
- First name and last name required
- Role defaults to "patient"

---

### Task 3: Implement Password Reset Functionality

**New Endpoints:**
1. `POST /api/auth/forgot-password`
   - Accepts email
   - Generates reset token (valid for 1 hour)
   - In production: sends email (placeholder in dev)

2. `POST /api/auth/reset-password`
   - Accepts reset token and new password
   - Updates user password in database

**Implementation:**
- Generate random reset tokens
- Store with expiration timestamp
- Create password_reset_token table in schema

---

### Task 4: Implement Token Refresh

**New Endpoint:** `POST /api/auth/refresh`

**Purpose:** Allow clients to refresh expired tokens

**Request:**
```json
{
  "refreshToken": "token_string"
}
```

**Response:**
```json
{
  "accessToken": "new_jwt_token",
  "expiresIn": 3600
}
```

---

### Task 5: Add Middleware for Role-Based Access Control

**File:** `src/backend/middleware/auth.js`

**New Middleware:**
- `authenticateToken`: Verify JWT validity
- `requireRole`: Check user role permissions
- `requireAdmin`: Admin-only endpoints
- `requireDoctor`: Doctor/admin-only endpoints

**Usage:**
```javascript
app.post('/api/patients/:id/update', 
  authenticateToken, 
  requireRole(['doctor', 'administrator']), 
  patientController.update
);
```

---

## 🛠️ Implementation Plan

### Phase 2.2.1: Update Login (30 min)
1. Open `src/backend/routes/auth.js`
2. Import User model and bcryptjs
3. Replace mock credential check with database query
4. Test with demo users

### Phase 2.2.2: Add Registration (45 min)
1. Add POST /api/auth/register endpoint
2. Implement input validation
3. Hash password with bcryptjs
4. Create user in database
5. Test endpoint with Postman/cURL

### Phase 2.2.3: Add Password Reset (30 min)
1. Create password_reset_tokens table (migrations)
2. Implement forgot-password endpoint
3. Implement reset-password endpoint
4. Test reset flow

### Phase 2.2.4: Add Token Refresh (15 min)
1. Implement refresh token storage
2. Add refresh endpoint
3. Update client to use refresh tokens

### Phase 2.2.5: Add Middleware & RBAC (30 min)
1. Create middleware directory
2. Implement auth middleware
3. Apply to protected routes
4. Test role-based access

---

## 📝 Code Examples Ready to Deploy

### User Model Methods (Already Written)
```javascript
// src/backend/models/User.js
User.findByEmail(email)           // Query user by email
User.findById(id)                 // Query user by ID
User.create(userData)             // Create new user
User.updatePassword(id, newHash)  // Update password hash
User.getByRole(role)              // Query users by role
```

### Auth Utilities (Already Written)
```javascript
// src/backend/utils/auth.js
generateToken(user)              // Create JWT token
verifyToken(token)               // Validate JWT
decodeToken(token)               // Decode JWT payload
```

---

## 🗂️ Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| src/backend/routes/auth.js | Update login, add register, password reset | HIGH |
| src/backend/models/User.js | Add database methods (mostly done) | HIGH |
| src/backend/middleware/auth.js | Create RBAC middleware | MEDIUM |
| src/backend/database/schema.sql | Add password_reset_tokens table | MEDIUM |
| config/.env | Add JWT settings (done) | ✅ DONE |
| src/backend/server.js | Register middleware | MEDIUM |

---

## ✅ Success Criteria

- [ ] Login endpoint validates against database
- [ ] Passwords are hashed with bcryptjs
- [ ] Registration creates new users successfully
- [ ] Demo users can log in with real credentials
- [ ] Invalid credentials rejected properly
- [ ] JWT tokens are valid and contain user data
- [ ] Password reset flow works end-to-end
- [ ] Token refresh mechanism works
- [ ] RBAC prevents unauthorized access
- [ ] All frontend forms work with real backend

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// src/backend/tests/auth.test.js
- Password hashing works
- Invalid password rejected
- Valid password accepted
- Invalid email rejected
- Token generation works
- Token verification works
```

### Integration Tests
1. POST /api/auth/login with valid credentials → ✅ Success
2. POST /api/auth/login with invalid credentials → ❌ 401
3. POST /api/auth/register → ✅ Success
4. POST /api/auth/register with duplicate email → ❌ 409
5. Protected endpoint without token → ❌ 401
6. Protected endpoint with invalid token → ❌ 401
7. Protected endpoint with valid token → ✅ Success

### Manual Testing
1. Open browser: http://localhost:3000
2. Try login with admin@clinic.com / admin123
3. Should redirect to dashboard
4. Should display user name and role
5. Logout should clear token

---

## 🔒 Security Considerations

- ✅ Passwords hashed with bcryptjs (done in schema)
- ✅ JWT tokens signed with secret (config/.env)
- ✅ HTTPS in production only
- ✅ Token expiration enforced (7 days)
- ✅ Password reset tokens expire after 1 hour
- ✅ No sensitive data in token payload
- ✅ RBAC prevents unauthorized actions
- ✅ SQL injection protection (parameterized queries)

---

## 📚 Related Documentation

- `docs/phases/PHASE_2_2_QUICK_REFERENCE.md` (to be created)
- `src/backend/database/schema.sql` (check user table)
- `src/backend/models/User.js` (review methods)
- `src/backend/utils/auth.js` (review helpers)

---

## 🚀 Getting Started

### 1. Review Current Implementation
```bash
cat src/backend/routes/auth.js | head -50
cat src/backend/models/User.js | head -50
```

### 2. Start Backend
```bash
cd src/backend
npm start
```

### 3. Test Current System
```bash
# Test mock login (current)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"admin123"}'
```

### 4. Begin Implementation
Start with Task 1 (Update Auth Routes) - most critical

---

## 📊 Dependency Graph

```
Phase 2.2: Real Authentication
├── Task 1: Update Login Routes ✅ BLOCKS ALL OTHERS
│   └── Requires: User.js, bcryptjs, JWT
├── Task 2: Add Registration ✅ DEPENDS ON Task 1
│   └── Requires: Validation, User.create()
├── Task 3: Password Reset ✅ INDEPENDENT
│   └── Requires: Email setup (mocked in dev)
├── Task 4: Token Refresh ✅ INDEPENDENT
│   └── Requires: Token storage strategy
└── Task 5: RBAC Middleware ✅ DEPENDS ON Tasks 1-4
    └── Requires: All auth endpoints complete
```

---

## ⏱️ Timeline

| Task | Duration | Status |
|------|----------|--------|
| Update Login | 30 min | ⏳ NEXT |
| Add Registration | 45 min | ⏳ AFTER Task 1 |
| Password Reset | 30 min | ⏳ AFTER Task 1 |
| Token Refresh | 15 min | ⏳ AFTER Task 1 |
| RBAC Middleware | 30 min | ⏳ LAST |
| **TOTAL** | **2-2.5 hrs** | **⏳ QUEUED** |

**Estimated Completion:** ~1.5-2 hours from start

---

## 🎓 Learning Path

If you want to understand the implementation first:
1. Read `src/backend/models/User.js` (database methods)
2. Read `src/backend/utils/auth.js` (token helpers)
3. Review bcryptjs documentation
4. Review JWT concepts
5. Then start Task 1

---

## 🚨 Potential Issues & Solutions

| Issue | Solution |
|-------|----------|
| bcryptjs not installed | Run: `npm install bcryptjs` |
| dotenv not loading | Check `.env` file path in connection.js |
| User.js methods not defined | Check `src/backend/models/User.js` |
| JWT secret not set | Verify in `config/.env` |
| Database connection failing | Run: `node test-db-connection.js` |

---

**✅ Phase 2.2 Ready to Begin!**

Next action: Start with `src/backend/routes/auth.js` update
