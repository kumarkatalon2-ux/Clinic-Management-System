import { Router, Request, Response } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Clinical API is running',
  });
});

healthRoutes.get('/ready', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

healthRoutes.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'live',
    timestamp: new Date().toISOString(),
  });
});
