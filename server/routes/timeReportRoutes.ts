import { Router, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { TransactionModel } from '../models/Transaction';
const router=Router();
router.use(authenticateToken as any);
const validDate=(s:any)=> typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s;
router.get('/by-period',async(req:AuthenticatedRequest,res,next:NextFunction)=>{
 try {
 const from=req.query.from,to=req.query.to;
 if(!validDate(from)||!validDate(to)||(from as string) > (to as string))return res.status(400).json({message:'Khoảng ngày không hợp lệ.'});
 if((Date.parse(to as string)-Date.parse(from as string))/86400000>366)return res.status(400).json({message:'Tối đa 366 ngày.'});
 const transactions=await TransactionModel.find({userId:req.user!.userId});
 const filtered=transactions.filter(t=>t.date>=from!&&t.date<=to!);
 const detailsMap=new Map<string,{type:string;category:string;amount:number;count:number}>();
 for(const t of filtered){const key=t.type+'|'+t.category;let r=detailsMap.get(key);if(!r){r={type:t.type,category:t.category||'Chưa phân loại',amount:0,count:0};detailsMap.set(key,r);}r.amount+=Number(t.amount)||0;r.count++;}
 const details=[...detailsMap.values()].sort((a,b)=>b.amount-a.amount);
 const income=filtered.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
 const expense=filtered.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
 res.json({from,to,income,expense,balance:income-expense,details});
 } catch (error) { next(error); }
});
export default router;
