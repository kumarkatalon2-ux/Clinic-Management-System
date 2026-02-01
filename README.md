# 🏥 Clinical Management System

A professional, open-source clinical management system built with Node.js, Express, and PostgreSQL.

---

## ⚡ Quick Start

### Start the Application
```bash
cd src/backend
npm install
npm start
```

**Access at:** http://localhost:3000/login.html

**Demo Credentials:**
- Email: `admin@clinic.local`
- Password: `password123`

---

## 📊 Project Status

| Phase | Status | Details |
|-------|--------|---------|
| **Phase 1** | ✅ Complete | Login System, Dashboard, Authentication |
| **Phase 2** | 🔄 In Progress | Database Integration, API Development |
| **Phase 3+** | ⏳ Planned | Patient Mgmt, Appointments, Consultations |

---

## 📁 Project Structure

```
Clinical Project/
├── src/
│   ├── backend/              ← Express.js server & APIs
│   └── frontend/public/      ← HTML pages (login, dashboard)
├── docs/                     ← Complete documentation
├── config/                   ← Configuration files
├── scripts/                  ← Installation & utility scripts
└── tests/                    ← Test files & Postman collections
```

**👉 See `PROJECT_STRUCTURE.md` for detailed organization**

---

## 📚 Documentation Navigation

### 🆕 First Time Here?
1. Read: `docs/guides/START_HERE_DOCUMENTATION.md` (15 min)
2. Run: `npm start` in `src/backend/`
3. Login with demo credentials above
4. Explore the dashboard

### 📖 Complete Documentation
- **System Status:** `docs/STATUS_REPORT.md`
- **Resource Guide:** `docs/RESOURCE_GUIDE.md`
- **Project Structure:** `PROJECT_STRUCTURE.md`
- **Executive Summary:** `docs/EXECUTIVE_SUMMARY.md`

### 🔧 Developer Guides
| Document | Purpose |
|----------|---------|
| `docs/guides/START_HERE_DOCUMENTATION.md` | Getting started |
| `docs/guides/LOGIN_INSTRUCTIONS.md` | Login & testing |
| `docs/guides/QUICK_FIX_GUIDE.md` | Common issues |
| `docs/guides/LOGIN_TROUBLESHOOTING.md` | Debug help |

### 📋 Phase Documentation
| Document | Status |
|----------|--------|
| `docs/phases/PHASE_1_COMPLETION_REPORT.md` | ✅ Complete |
| `docs/phases/PHASE_2_DEVELOPMENT_PLAN.md` | 📋 Ready |

---

## 🎯 System Architecture

### Backend
- **Framework:** Express.js
- **Port:** 3000
- **Language:** JavaScript (Node.js)
- **Status:** ✅ Running & Tested

### Frontend
- **Type:** Static HTML with Vanilla JavaScript
- **Styling:** Tailwind CSS CDN
- **Location:** `src/frontend/public/`
- **Pages:**
  - `login.html` - Authentication interface
  - `dashboard.html` - Main user interface

### Authentication
- **Type:** JWT (JSON Web Tokens)
- **Storage:** LocalStorage (browser)
- **Tokens:** Access + Refresh
- **Demo User:** admin@clinic.local / password123

---

## 🔧 Development Commands

### Running the Server
```bash
cd src/backend
npm start
```

### Access Points
| URL | Purpose |
|-----|---------|
| http://localhost:3000/login.html | Login page |
| http://localhost:3000/dashboard.html | Dashboard |
| http://localhost:3000/api-test.html | API testing |
| http://localhost:3000/health | Health check |

### API Endpoints (Phase 1)
```
POST   /api/auth/login        - Login endpoint
GET    /health                - Server health
GET    /api/status            - API status
```

---

## 📦 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 22.19.0+ |
| **Server** | Express.js | 4.18+ |
| **Security** | Helmet.js | 7.0+ |
| **CORS** | CORS middleware | 2.8+ |
| **Database** | PostgreSQL | 15+ (Phase 2) |
| **Frontend** | HTML5 + JS | Modern |
| **Styling** | Tailwind CSS | Latest |

---

## ✨ Features

### Phase 1 ✅ Complete
- ✅ Professional login interface
- ✅ JWT authentication system
- ✅ Dashboard with user profile
- ✅ Responsive design
- ✅ Error handling & validation
- ✅ Security (Helmet, CORS)

### Phase 2 🔄 In Development
- 🔄 PostgreSQL database
- 🔄 Real user authentication
- 🔄 Patient management API
- 🔄 Appointment system
- 🔄 Consultation tracking

### Phase 3+ ⏳ Planned
- ⏳ Telemedicine integration
- ⏳ Prescription management
- ⏳ Lab results management
- ⏳ Insurance claims
- ⏳ HIPAA compliance

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill Node processes
taskkill /F /IM node.exe

# Try again
npm start
```

### Login Not Working
1. Check browser console (F12)
2. Read: `docs/guides/LOGIN_TROUBLESHOOTING.md`
3. Use diagnostic: http://localhost:3000/api-test.html

### Any Issues?
- Check: `docs/guides/QUICK_FIX_GUIDE.md`
- Read: `docs/STATUS_REPORT.md`
- See: `PROJECT_STRUCTURE.md`

---

## 📞 Support Resources

### Internal Documentation
- **Project Structure:** `PROJECT_STRUCTURE.md`
- **Resource Guide:** `docs/RESOURCE_GUIDE.md`
- **Session Notes:** `docs/sessions/`
- **Phase Details:** `docs/phases/`

### External Resources
- **Express.js:** https://expressjs.com
- **Node.js:** https://nodejs.org
- **JWT:** https://jwt.io
- **PostgreSQL:** https://postgresql.org

---

## 🚀 Next Steps

### Immediate (After Reading)
1. ✅ Run the application
2. ✅ Test login with demo credentials
3. ✅ Explore the dashboard
4. ✅ Read Project Structure

### This Week (Phase 2)
1. Setup PostgreSQL database
2. Replace mock authentication
3. Build patient management API
4. Create Postman collection

### This Month
1. Complete appointment system
2. Add consultation tracking
3. Build comprehensive tests
4. Document all APIs

---

## 📄 License

Open Source - Clinical Management System

---

## ✅ Quick Reference

| Need | Location |
|------|----------|
| **Quick start** | This file |
| **Full guide** | `docs/RESOURCE_GUIDE.md` |
| **First time?** | `docs/guides/START_HERE_DOCUMENTATION.md` |
| **Issues?** | `docs/guides/QUICK_FIX_GUIDE.md` |
| **Project layout** | `PROJECT_STRUCTURE.md` |
| **Current status** | `docs/STATUS_REPORT.md` |
| **Backend code** | `src/backend/` |
| **Frontend files** | `src/frontend/public/` |
| **Configuration** | `config/` |
| **All docs** | `docs/` |

---

**Last Updated:** January 31, 2026  
**Status:** ✅ Phase 1 Complete, Phase 2 Ready  
**Questions?** Read the documentation in `docs/`

