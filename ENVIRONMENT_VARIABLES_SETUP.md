# 🔐 ENVIRONMENT VARIABLES MAPPING

## From Neon Connection String to Environment Variables

### Step 1: Get Your Connection String from Neon
Your Neon connection string will look like:
```
postgresql://user_abc123:password_xyz789@ep-brave-cloud-54321.neon.tech/clinical_system?sslmode=require
```

### Step 2: Extract Values

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE

📍 Mapping:
┌─────────────────────────┬──────────────────────┬─────────────────────┐
│ Connection Part         │ Environment Variable │ Example Value       │
├─────────────────────────┼──────────────────────┼─────────────────────┤
│ user_abc123             │ DB_USER              │ user_abc123         │
│ password_xyz789         │ DB_PASSWORD          │ password_xyz789     │
│ ep-brave-cloud-54321... │ DB_HOST              │ ep-brave-cloud...   │
│ 5432 (always)           │ DB_PORT              │ 5432                │
│ clinical_system         │ DB_NAME              │ clinical_system     │
└─────────────────────────┴──────────────────────┴─────────────────────┘
```

---

## Render Environment Variables (Backend)

Add these exactly as shown in Render dashboard → Environment tab:

```
Name: DB_USER
Value: [Extract from Neon connection string - the part after postgresql://]

Name: DB_PASSWORD
Value: [Extract from Neon connection string - the part after the colon before @]

Name: DB_HOST
Value: [Extract from Neon connection string - the part after @ before the next colon]
Example: ep-brave-cloud-54321.neon.tech

Name: DB_PORT
Value: 5432

Name: DB_NAME
Value: clinical_system

Name: PORT
Value: 3000

Name: NODE_ENV
Value: production

Name: JWT_SECRET
Value: [Create a random string - minimum 32 characters]
Example: clinical-system-secret-key-2026-super-secure-production

Name: CORS_ORIGIN
Value: https://clinical-frontend.vercel.app
[Note: Replace with your actual Vercel URL after getting it]
```

---

## Vercel Environment Variable (Frontend)

After Vercel deployment is complete and you have your Render backend URL:

```
Name: REACT_APP_API_BASE
Value: https://clinical-backend-XXXXX.onrender.com
[Replace XXXXX with your actual Render service ID]
```

---

## How to Find These Values

### 1. Neon Dashboard
1. Log in to https://neon.tech
2. Go to "Databases" → "clinical_system"
3. Click "Connection Details"
4. Copy the full connection string
5. Extract values from it (see mapping above)

### 2. Render Dashboard (After Creating Service)
1. Go to your service
2. Copy the service URL (for CORS_ORIGIN)
3. It will look like: `https://clinical-backend-XXXXX.onrender.com`

### 3. Vercel Dashboard (After Deploying)
1. Go to your project
2. Copy the deployment URL
3. It will look like: `https://clinical-frontend-XXXXX.vercel.app`

---

## ✅ Validation Checklist

Before deploying, verify you have:
- ✅ `DB_USER` - 15-30 chars, from Neon
- ✅ `DB_PASSWORD` - from Neon, may contain special chars
- ✅ `DB_HOST` - ends with `.neon.tech`
- ✅ `DB_PORT` - always `5432`
- ✅ `DB_NAME` - should be `clinical_system`
- ✅ `JWT_SECRET` - 32+ random characters (a-z, A-Z, 0-9, special chars)
- ✅ `CORS_ORIGIN` - starts with `https://`, ends with `.vercel.app`
- ✅ `REACT_APP_API_BASE` - your Render service URL

---

## 🔒 Security Best Practices

1. ✅ Never use special characters in password that conflict with URLs
2. ✅ Use random JWT_SECRET (don't use same one everywhere)
3. ✅ Never commit `.env` file to GitHub
4. ✅ All values in Render/Vercel dashboards are encrypted at rest
5. ✅ Use environment variables, never hardcode secrets
6. ✅ Rotate JWT_SECRET every 6 months

---

## 🆘 Troubleshooting Common Mistakes

### "SyntaxError: unexpected character in password"
- Your DB_PASSWORD has special chars that break URLs
- Copy it exactly as shown in Neon (it's already URL-safe)

### "Connection refused"
- Check DB_HOST is correct (ends with .neon.tech)
- Check DB_PORT is 5432
- Check DB_NAME is clinical_system

### "CORS error in browser console"
- Check CORS_ORIGIN value in Render
- It must match your Vercel URL exactly (including https://)
- Render needs to be restarted after changing CORS_ORIGIN

### "Cannot find module 'dotenv'"
- This is handled - don't worry
- Render will install all dependencies

---

## 📋 Copy-Paste Template

Use this when adding to Render:

```
DB_USER=[COPY_FROM_NEON]
DB_PASSWORD=[COPY_FROM_NEON]
DB_HOST=[COPY_FROM_NEON]
DB_PORT=5432
DB_NAME=clinical_system
PORT=3000
NODE_ENV=production
JWT_SECRET=clinical-management-system-secret-2026-secure-deployment
CORS_ORIGIN=https://clinical-frontend.vercel.app
```

Then come back and update `CORS_ORIGIN` with real Vercel URL after Vercel deployment ✅

---

**All values are ready - just follow the mappings above!** ✅
