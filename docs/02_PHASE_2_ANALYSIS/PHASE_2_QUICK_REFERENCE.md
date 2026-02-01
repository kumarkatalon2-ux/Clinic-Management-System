# Phase 2: Authentication - Quick Reference Guide

## 🚀 Quick Start

### Start Server
```bash
cd src/backend
npm start
# Server runs on http://localhost:3000
```

### Test Login (Mock)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.local",
    "password": "password123"
  }'
```

---

## 📍 File Locations

| Purpose | File | Lines |
|---------|------|-------|
| User Model | `src/backend/models/User.js` | 179 |
| JWT Utils | `src/backend/utils/jwt.js` | 70 |
| Auth Middleware | `src/backend/middleware/auth.js` | 83 |
| Auth Routes | `src/backend/routes/auth.js` | 285 |
| DB Pool | `src/backend/database/pool.js` | 35 |
| DB Schema | `src/backend/database/schema/users.sql` | 60 |

---

## 🔌 API Endpoints

### Authentication Routes
```
POST   /api/auth/register      → Create new user (mock)
POST   /api/auth/login         → Login user (mock + test creds)
GET    /api/auth/verify        → Verify token (protected)
GET    /api/auth/profile       → Get user profile (protected)
POST   /api/auth/logout        → Logout user (protected)
POST   /api/auth/refresh       → Get new access token
```

### Test Credentials
```
Email:    admin@clinic.local
Password: password123
Role:     admin
```

---

## 🔑 JWT Tokens

### Access Token
- Expiry: 7 days
- Type: access
- Contains: userId, email, role

### Refresh Token
- Expiry: 30 days
- Type: refresh
- Contains: userId

### Usage in Requests
```
Authorization: Bearer <accessToken>
```

---

## 🛡️ Middleware Usage

### Protected Route
```javascript
app.get('/api/protected', verifyJWT, (req, res) => {
  console.log(req.user.userId);  // From token
  console.log(req.user.role);    // From token
});
```

### Admin Only
```javascript
app.delete('/api/users/:id', 
  verifyJWT, 
  verifyRole('admin'), 
  (req, res) => {
    // Only admin can access
  }
);
```

### Multiple Roles
```javascript
app.get('/api/dashboard',
  verifyJWT,
  verifyRole(['admin', 'doctor']),
  (req, res) => {
    // Admin or doctor can access
  }
);
```

---

## 💾 Database Setup (TODO)

### 1. Install PostgreSQL
```bash
# Windows: Download from postgresql.org
# Or use: choco install postgresql
```

### 2. Create Database
```sql
CREATE DATABASE clinical_db;
CREATE USER clinical_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE clinical_db TO clinical_user;
```

### 3. Run Schema Migration
```bash
psql -U clinical_user -d clinical_db -f src/backend/database/schema/users.sql
```

### 4. Update .env
```
DB_USER=clinical_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinical_db
```

---

## 🧪 Testing Commands

### Register (Mock)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@clinic.local",
    "password": "securepass123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }'
```

### Get Token
```bash
# Login first and extract accessToken from response
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.local","password":"password123"}' \
  | jq -r '.data.tokens.accessToken')
```

### Verify Token
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET changed in .env
- [ ] Use HTTPS in production
- [ ] Access token stored in memory only
- [ ] Refresh token in httpOnly cookie
- [ ] Rate limiting implemented
- [ ] Account lockout configured
- [ ] Email verification enabled
- [ ] CORS configured properly
- [ ] CSRF protection added
- [ ] Input validation complete

---

## 📊 User Roles

| Role | Access | Permissions |
|------|--------|-------------|
| admin | Full | Everything |
| doctor | High | Patients, appointments, prescriptions |
| nurse | Medium | Patient data, support |
| receptionist | Medium | Scheduling, check-in |
| patient | Low | Personal data, appointments |

---

## 🐛 Common Issues

### Token Expired
```
"message": "Token has expired"
→ Use refresh endpoint to get new token
```

### Invalid Token
```
"message": "Invalid token"
→ Token signature invalid or malformed
→ Check Authorization header format
```

### No Token
```
"message": "No token provided"
→ Add Authorization header
→ Format: Bearer <token>
```

### Database Error
```
"error": "connect ECONNREFUSED"
→ PostgreSQL not running
→ Check DB credentials in .env
→ Run schema migration
```

---

## 📚 Related Documentation

- Full API Docs: `PHASE_2_API_DOCUMENTATION.md`
- Implementation Details: `PHASE_2_IMPLEMENTATION_SUMMARY.md`
- Build Status: `PHASE_2_BUILD_COMPLETE.md`

---

## 🎯 Phase 2 Phases

### Phase 2.1: Infrastructure (✅ COMPLETE)
- JWT generation/verification
- Auth middleware
- 6 endpoints
- Database schema

### Phase 2.2: Database Integration (🔄 IN PROGRESS)
- Connect PostgreSQL
- Test User model
- Real registration/login
- Error handling

### Phase 2.3: Enhanced Features (⏳ TODO)
- Email verification
- Password reset
- 2FA
- OAuth2

---

## 🚀 Next Actions

1. **Setup PostgreSQL**
   ```bash
   # Start PostgreSQL service
   # Create clinical_db database
   # Run schema migration
   ```

2. **Update .env**
   ```
   DB_USER=clinical_user
   DB_PASSWORD=secure_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=clinical_db
   ```

3. **Test Database Connection**
   ```bash
   npm start
   # Check for DB connection logs
   ```

4. **Test Real Registration**
   ```bash
   # Try registering with new user
   POST /api/auth/register
   ```

5. **Test Real Login**
   ```bash
   # Try logging in with registered user
   POST /api/auth/login
   ```

---

## 💡 Tips

- Use Postman or Insomnia for API testing
- Check server console for detailed error messages
- Use `jq` to parse JSON responses
- Keep access tokens in memory only
- Test all endpoints before moving to Phase 3
- Use meaningful test data during development

---

## ✅ Phase 2 Status

| Component | Status |
|-----------|--------|
| JWT Tokens | ✅ Complete |
| Endpoints | ✅ Complete |
| Middleware | ✅ Complete |
| Models | ✅ Schema |
| Database | 🔄 Setup |
| Testing | 🧪 In Progress |
| Documentation | ✅ Complete |

---

**Ready to continue with database integration!** 🎯

