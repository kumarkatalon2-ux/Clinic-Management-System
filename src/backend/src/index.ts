import 'express-async-errors';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import 'dotenv/config';
import { AppDataSource } from '@database/index';
import { errorHandler } from '@middleware/errorHandler';
import { authRoutes } from '@routes/auth.routes';
import { patientRoutes } from '@routes/patient.routes';
import { appointmentRoutes } from '@routes/appointment.routes';
import { consultationRoutes } from '@routes/consultation.routes';
import { prescriptionRoutes } from '@routes/prescription.routes';
import { labRoutes } from '@routes/lab.routes';
import { insuranceRoutes } from '@routes/insurance.routes';
import { healthRoutes } from '@routes/health.routes';
import { logger } from '@utils/logger';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging
app.use(pinoHttp({
  logger,
  serializers: {
    req: (request) => ({
      id: request.id,
      method: request.method,
      url: request.url,
      headers: request.headers,
      remoteAddress: request.remoteAddress,
    }),
  },
}));

// Health Check
app.use('/health', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/insurance', insuranceRoutes);

// OpenAPI/Swagger documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'API Documentation available at /api/swagger',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      patients: '/api/patients',
      appointments: '/api/appointments',
      consultations: '/api/consultations',
      prescriptions: '/api/prescriptions',
      labs: '/api/labs',
      insurance: '/api/insurance'
    }
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path,
  });
});

// Error Handler
app.use(errorHandler);

// Initialize Database and Start Server
async function startServer() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📚 API documentation: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await AppDataSource.destroy();
  process.exit(0);
});

startServer();

export default app;
