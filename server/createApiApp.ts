import express from 'express';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import adminRoutes from './routes/adminRoutes';
export function createApiApp(){const app=express();app.use(express.json());app.use('/api/auth',authRoutes);app.use('/api/transactions',transactionRoutes);app.use('/api/admin',adminRoutes);app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(err.status||500).json({success:false,message:err.message||'Lỗi máy chủ'}));return app;}
