import { Request, Response } from 'express';
import { checkConnection as checkDbConnection } from '../db';
import { checkGrokConnection } from '../services/grokService';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  grokApi: 'connected' | 'disconnected';
  timestamp: string;
}

/**
 * Health check endpoint handler
 * Verifies database and Grok API connectivity
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const [dbConnected, grokConnected] = await Promise.all([
    checkDbConnection(),
    checkGrokConnection()
  ]);

  const response: HealthResponse = {
    status: dbConnected && grokConnected ? 'healthy' : 'unhealthy',
    database: dbConnected ? 'connected' : 'disconnected',
    grokApi: grokConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  };

  const statusCode = response.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(response);
}
