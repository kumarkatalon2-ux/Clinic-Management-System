#!/usr/bin/env node

const path = require('path');

// Load environment variables first
require('dotenv').config({ path: path.join(__dirname, '../..', 'config', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const consultationRoutes = require('./routes/consultations');
const prescriptionRoutes = require('./routes/prescriptions');
const labRoutes = require('./routes/labs');
const billingRoutes = require('./routes/billing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configure CORS for both local and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://clinic-management-system-ten-lyart.vercel.app',
  'https://clinic-management-system-3gev.onrender.com',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://clinic-management-system-3gev.onrender.com", "https://clinic-management-system-ten-lyart.vercel.app", "http://localhost:3000"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(express.json());

// Serve static files from frontend public folder
const frontendPath = path.join(__dirname, '../../src/frontend/public');
app.use(express.static(frontendPath));

// Default route - Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

// Dashboard route - Serve dashboard page
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(frontendPath, 'dashboard.html'));
});

// Test Login route - Serve test-login page
app.get('/test-login.html', (req, res) => {
  res.sendFile(path.join(frontendPath, 'test-login.html'));
});

// Health Check Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Clinical Management System - Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    phase: 'Phase 1 Complete',
    nextPhase: 'Authentication',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health/ready', (req, res) => {
  res.json({
    ready: true,
    database: 'ready for Phase 2',
    cache: 'ready for Phase 2',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/live', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    phase: 'Phase 1'
  });
});

// API Status
app.get('/api/status', (req, res) => {
  res.json({
    api: 'operational',
    version: '1.0.0',
    phase: 'Phase 1 - Scaffolding Complete',
    nextImplementation: 'Phase 2 - Authentication',
    endpoints: {
      health: '/health',
      patients: '/api/patients (mock)',
      auth: '/api/auth (Phase 2)',
      appointments: '/api/appointments (Phase 4)',
      consultations: '/api/consultations (Phase 5)',
      prescriptions: '/api/prescriptions (Phase 6)',
      labs: '/api/labs (Phase 7)',
      insurance: '/api/insurance (Phase 8)'
    }
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Patients Routes - Real CRUD endpoints
app.use('/api/patients', patientRoutes);

// Appointments Routes - Scheduling system
app.use('/api/appointments', appointmentRoutes);

// Consultations Routes - Telemedicine system
app.use('/api/consultations', consultationRoutes);

// Prescriptions Routes - Medication management
app.use('/api/prescriptions', prescriptionRoutes);

// Lab Tests Routes - Lab result management
app.use('/api/labs', labRoutes);

// Billing Routes - Invoices, payments, and insurance claims
app.use('/api/billing', billingRoutes);

// Serve frontend files for all other routes
app.get('*', (req, res) => {
  // If it's an HTML page request, serve login
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '../..', 'login.html'));
  } else {
    // For API calls that don't exist, return 404
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      path: req.path,
      method: req.method
    });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🏥 Clinical Management System - Backend Running 🏥        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

✅ Server Status: OPERATIONAL

📍 Server Details:
   • Host: http://localhost:${PORT}
   • Phase: Phase 1 Complete
   • Next: Phase 2 - Authentication
   • Environment: ${process.env.NODE_ENV || 'development'}

🔗 Available Endpoints:

   HEALTH CHECKS:
   • GET http://localhost:${PORT}/health
   • GET http://localhost:${PORT}/health/ready
   • GET http://localhost:${PORT}/health/live
   
   API STATUS:
   • GET http://localhost:${PORT}/api/status
   
   IMPLEMENTED (PHASE 1 & 2):
   • GET http://localhost:${PORT}/api/patients (mock data)
   • POST http://localhost:${PORT}/api/auth/login ✅ LIVE
   • POST http://localhost:${PORT}/api/auth/register ✅ LIVE
   
   COMING SOON:
   • Phase 3 (2-3 weeks): Patient Management
     - Full CRUD operations
   
   • Phase 4 (2 weeks): Appointment System
     - Scheduling & conflict detection
   
   • Phase 5 (1-2 weeks): Telemedicine
     - Video consultations
   
   • Phase 3 (2-3 weeks): Patient Management
     - Full CRUD operations
   
   • Phase 4 (2 weeks): Appointment System
     - Scheduling & conflict detection
   
   • Phase 5 (1-2 weeks): Telemedicine
     - Video consultations
   
   • Phase 6-8 (3-4 weeks): Prescriptions, Labs, Insurance
   
   • Phase 9-11 (3 weeks): Testing & Deployment

📊 Technology Stack:
   • Runtime: Node.js ${process.version.split('v')[1]}
   • Framework: Express.js
   • Language: JavaScript/TypeScript
   • Database: PostgreSQL (Phase 2)
   • Cache: Redis (Phase 2)
   • Authentication: JWT (Phase 2)

📁 Frontend:
   • Open http://localhost:${PORT} in your browser
   • Displays: System status, roadmap, features

📚 Documentation:
   • Full API: http://localhost:${PORT}/api/docs
   • Development: BUILD_PLAN.md
   • Architecture: README.md
   • Phase Details: /docs folder

⏸️  To stop: Press Ctrl+C
🔄 Auto-restart: Use npm run dev

════════════════════════════════════════════════════════════════════

  🚀 System Ready! Visit http://localhost:${PORT} to see the dashboard.
  
════════════════════════════════════════════════════════════════════
`);
});

// Error handling
server.on('error', (err) => {
  console.error('🔴 SERVER ERROR:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
  }
  process.exit(1);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('\n📊 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📊 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

module.exports = app;
