import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db';
import { AuthService } from './server/services/authService';

import authRoutes from './server/routes/authRoutes';
import transactionRoutes from './server/routes/transactionRoutes';
import budgetRoutes from './server/routes/budgetRoutes';
import savingsRoutes from './server/routes/savingsRoutes';
import recurringRoutes from './server/routes/recurringRoutes';
import reportRoutes from './server/routes/reportRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON and form bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Database (MongoDB if URI available, else embedded JSON store)
  await connectDB();

  // Ensure Demo User with realistic initial data is pre-populated
  try {
    await AuthService.seedDemoUser();
  } catch (err) {
    console.error('Demo user init error:', err);
  }

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Mount API routes (MVC Pattern)
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/budgets', budgetRoutes);
  app.use('/api/savings', savingsRoutes);
  app.use('/api/recurring', recurringRoutes);
  app.use('/api/reports', reportRoutes);

  // Global error handler for API
  app.use('/api/*', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

  // Frontend Integration: Vite middleware in development, static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
