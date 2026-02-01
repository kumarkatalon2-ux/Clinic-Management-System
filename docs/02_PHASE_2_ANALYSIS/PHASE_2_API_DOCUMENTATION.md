# Phase 2: Authentication API Documentation

## Base URL
```
http://localhost:3000/api/auth
```

## Authentication

Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

---

## Endpoints

### 1. Register User
**POST** `/register`

**Status:** Phase 2 Mock (Full DB implementation in progress)

#### Request
```json
{
  "email": "user@clinic.local",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient"
}
```

#### Response (201 Created)
```json
{
  "message": "User registered successfully (Phase 2)",
  "data": {
    "user": {
      "id": 5432,
      "email": "user@clinic.local",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient",
      "createdAt": "2026-01-31T08:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "7d"
    }
  }
}
```

#### Error Responses
```json
// 400 Bad Request - Missing email or password
{
  "error": "Bad Request",
  "message": "Email and password are required"
}

// 400 Bad Request - Password too short
{
  "error": "Bad Request",
  "message": "Password must be at least 6 characters"
}

// 409 Conflict - Email already registered
{
  "error": "Conflict",
  "message": "Email already registered"
}
```

---

### 2. Login
**POST** `/login`

**Status:** Phase 2 Mock - Test credentials work, full DB in progress

#### Request
```json
{
  "email": "admin@clinic.local",
  "password": "password123"
}
```

#### Test Credentials
```
Email:    admin@clinic.local
Password: password123
Role:     admin
```

#### Response (200 OK)
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
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "7d"
    }
  }
}
```

#### Error Responses
```json
// 400 Bad Request
{
  "error": "Bad Request",
  "message": "Email and password are required"
}

// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```

---

### 3. Verify Token
**GET** `/verify`

**Required:** JWT token in Authorization header

#### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Response (200 OK)
```json
{
  "message": "Token is valid (Phase 2)",
  "data": {
    "token": {
      "userId": 1,
      "email": "admin@clinic.local",
      "role": "admin",
      "expiresIn": 1704672000
    }
  }
}
```

#### Error Responses
```json
// 401 Unauthorized - No token
{
  "error": "Unauthorized",
  "message": "No token provided",
  "code": "NO_TOKEN"
}

// 401 Unauthorized - Invalid token
{
  "error": "Unauthorized",
  "message": "Invalid token",
  "code": "INVALID_TOKEN"
}

// 401 Unauthorized - Expired token
{
  "error": "Unauthorized",
  "message": "Token has expired",
  "code": "INVALID_TOKEN"
}
```

---

### 4. Get Profile
**GET** `/profile`

**Required:** JWT token in Authorization header

#### Request Headers
```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)
```json
{
  "message": "Profile retrieved (Phase 2)",
  "data": {
    "userId": 1,
    "email": "admin@clinic.local",
    "role": "admin"
  }
}
```

#### Error Responses
```json
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```

---

### 5. Logout
**POST** `/logout`

**Required:** JWT token in Authorization header

#### Request Headers
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

#### Response (200 OK)
```json
{
  "message": "Logout successful",
  "data": {
    "userId": 1
  }
}
```

**Note:** In JWT-based systems, logout is primarily handled client-side by deleting the token. Server-side token blacklist can be implemented in future phases.

---

### 6. Refresh Token
**POST** `/refresh`

Used to get a new access token using a refresh token.

#### Request
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)
```json
{
  "message": "Token refreshed (Phase 2)",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "7d"
    }
  }
}
```

#### Error Responses
```json
// 400 Bad Request - No refresh token
{
  "error": "Bad Request",
  "message": "Refresh token is required"
}

// 401 Unauthorized - Invalid token type
{
  "error": "Unauthorized",
  "message": "Invalid token type"
}

// 401 Unauthorized - Expired refresh token
{
  "error": "Unauthorized",
  "message": "Token has expired"
}
```

---

## User Roles

- **admin**: Full system access, user management
- **doctor**: Patient access, appointment scheduling, prescriptions
- **nurse**: Patient data, appointment support
- **receptionist**: Scheduling, check-in
- **patient**: Personal data, appointment viewing, prescriptions

---

## Authentication Flow

### Registration & Login
```
1. User submits email/password to /register
2. User receives accessToken + refreshToken
3. Store accessToken in memory (more secure)
4. Store refreshToken in httpOnly cookie or secure storage
5. Use accessToken for API calls in Authorization header
```

### Token Usage
```
1. Include accessToken in Authorization header for each API call
2. If token expires, use refreshToken to get new accessToken
3. On logout, delete tokens (client-side)
```

### Protected Route Access
```
Example: GET /api/auth/profile
Headers:
  Authorization: Bearer <accessToken>
  
Server validates:
  1. Token exists
  2. Token signature is valid
  3. Token hasn't expired
  4. Token type is 'access'
  
If all valid: route handler executes with req.user populated
If invalid: return 401 Unauthorized
```

---

## Token Details

### Access Token (7 days)
```json
{
  "userId": 123,
  "email": "user@clinic.local",
  "role": "patient",
  "type": "access",
  "iat": 1704067200,
  "exp": 1704672000
}
```

### Refresh Token (30 days)
```json
{
  "userId": 123,
  "type": "refresh",
  "iat": 1704067200,
  "exp": 1706745600
}
```

---

## Example JavaScript Client

```javascript
// Login
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
}

// Make authenticated request
async function getProfile() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/auth/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}

// Logout
function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Redirect to login page
}
```

---

## Phase 2 Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Token Generation | ✅ Complete | JWT with HS256 |
| Token Verification | ✅ Complete | With expiration checking |
| Register Endpoint | 🔄 Mock | Database integration pending |
| Login Endpoint | 🔄 Mock | Works with test credentials |
| Profile Endpoint | 🔄 Mock | Returns token data only |
| Verify Endpoint | ✅ Complete | Full implementation |
| Refresh Token | ✅ Complete | Full implementation |
| Password Hashing | ✅ Ready | Bcrypt setup complete |
| Email Verification | ⏳ TODO | Phase 2 enhancement |
| 2FA | ⏳ Future | Phase 3+ |
| OAuth2 | ⏳ Future | Phase 4+ |

---

## Security Notes

⚠️ **Important:**
- Change `JWT_SECRET` in production
- Always use HTTPS in production
- Don't store accessToken in localStorage (XSS vulnerable)
- Use httpOnly cookies for refresh tokens
- Implement rate limiting on auth endpoints
- Add account lockout after failed attempts
- Verify email before first login
- Rotate refresh tokens regularly

---

## Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Login successful, token valid |
| 201 | Created | User registered |
| 400 | Bad Request | Missing email/password |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | Insufficient permissions |
| 409 | Conflict | Email already registered |
| 500 | Server Error | Internal error |

---

## Related Files

- Models: `src/backend/models/User.js`
- Routes: `src/backend/routes/auth.js`
- Middleware: `src/backend/middleware/auth.js`
- Utils: `src/backend/utils/jwt.js`
- Database: `src/backend/database/pool.js`
- Schema: `src/backend/database/schema/users.sql`

---

**Phase 2 Status:** Authentication Infrastructure Built ✅  
**Database Integration:** In Progress 🔄  
**Production Ready:** Phase 2 Final (after DB testing)
