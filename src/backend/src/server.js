import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Clinical Management System - Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health/ready', (req, res) => {
  res.json({
    ready: true,
    database: 'connected',
    cache: 'connected',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/live', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

// Auth Routes Placeholder
app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ message: 'Login endpoint - Coming soon in Phase 2' });
});

app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ message: 'Register endpoint - Coming soon in Phase 2' });
});

// Patients Routes Placeholder
app.get('/api/patients', (req, res) => {
  res.json([
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active' }
  ]);
});

app.get('/api/patients/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'Patient details - Coming soon in Phase 3' });
});

// Appointments Routes Placeholder
app.get('/api/appointments', (req, res) => {
  res.json([]);
});

// Consultations Routes Placeholder
app.get('/api/consultations', (req, res) => {
  res.json([]);
});

// Prescriptions Routes Placeholder
app.get('/api/prescriptions', (req, res) => {
  res.json([]);
});

// Labs Routes Placeholder
app.get('/api/labs', (req, res) => {
  res.json([]);
});

// Insurance Routes Placeholder
app.get('/api/insurance', (req, res) => {
  res.json([]);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Clinical Management System - Backend Running            ║
╚════════════════════════════════════════════════════════════╝

🚀 Server started on http://localhost:${PORT}

📍 Available endpoints:
  • Health: http://localhost:${PORT}/health
  • Ready: http://localhost:${PORT}/health/ready
  • Live: http://localhost:${PORT}/health/live
  • API: http://localhost:${PORT}/api

📚 Route Modules (Placeholders):
  • POST /api/auth/login - Coming soon in Phase 2
  • POST /api/auth/register - Coming soon in Phase 2
  • GET /api/patients - Returning mock data
  • GET /api/appointments - Coming soon in Phase 4
  • GET /api/consultations - Coming soon in Phase 5
  • GET /api/prescriptions - Coming soon in Phase 6
  • GET /api/labs - Coming soon in Phase 7
  • GET /api/insurance - Coming soon in Phase 8

Waiting for requests...
  `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
