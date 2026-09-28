import express, { Request, Response } from 'express';
import { apiRouter } from '../server/apiRouter';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount router at both '/api' and '/' to handle both direct and rewritten requests on Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Export standard Vercel serverless function handler
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
