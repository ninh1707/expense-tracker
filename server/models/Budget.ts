import { loadData, saveData, isUsingMongo } from '../config/db';
import mongoose from 'mongoose';

export interface IBudget {
  _id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  month?: string; // YYYY-MM
  alertThreshold: number; // e.g. 80 (%)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const schema=new mongoose.Schema({_id:{type:String,required:true},userId:String,category:String,amount:Number,period:String,month:String,alertThreshold:Number,notes:String,createdAt:String,updatedAt:String},{versionKey:false,strict:false});
schema.index({userId:1,category:1,month:1});
const Mongo: mongoose.Model<any> = (mongoose.models.FinTrackBudget || mongoose.model('FinTrackBudget',schema,'budgets')) as mongoose.Model<any>;
const JsonRepository = {
  async find(filter: { userId: string; month?: string }): Promise<IBudget[]> {
    const data = loadData();
    return data.budgets.filter((b: IBudget) => {
      if (b.userId !== filter.userId) return false;
      if (filter.month && b.month && b.month !== filter.month) return false;
      return true;
    });
  },

  async findById(id: string): Promise<IBudget | null> {
    const data = loadData();
    const item = data.budgets.find((b: IBudget) => b._id === id);
    return item ? { ...item } : null;
  },

  async create(budgetData: Omit<IBudget, '_id' | 'createdAt' | 'updatedAt'>): Promise<IBudget> {
    const data = loadData();
    const now = new Date().toISOString();
    const newBudget: IBudget = {
      _id: 'bgt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      ...budgetData,
      alertThreshold: budgetData.alertThreshold || 80,
      createdAt: now,
      updatedAt: now
    };
    data.budgets.push(newBudget);
    saveData(data);
    return { ...newBudget };
  },

  async findByIdAndUpdate(id: string, update: Partial<IBudget>): Promise<IBudget | null> {
    const data = loadData();
    const index = data.budgets.findIndex((b: IBudget) => b._id === id);
    if (index === -1) return null;

    data.budgets[index] = {
      ...data.budgets[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return { ...data.budgets[index] };
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const data = loadData();
    const initialLen = data.budgets.length;
    data.budgets = data.budgets.filter((b: IBudget) => b._id !== id);
    if (data.budgets.length !== initialLen) {
      saveData(data);
      return true;
    }
    return false;
  }
};

// Repository selection is performed at query time, after connectDB has chosen a backend.
const MongoRepository = {
 async find(filter:any) {
   const {startDate,endDate,search,...criteria}=filter;
   const query:any={...criteria};
   if(startDate||endDate)query.date={...(startDate?{$gte:startDate}:{}),...(endDate?{$lte:endDate}:{})};
   if(search)query.$or=[{description:{$regex:escapeRegex(String(search)),$options:'i'}},{category:{$regex:escapeRegex(String(search)),$options:'i'}}];
   return (await Mongo.find(query).lean()) as any;
 },
 async findOne(filter:any){return (await Mongo.findOne(filter).lean()) as any;},
 async findById(id:string){return (await Mongo.findById(id).lean()) as any;},
 async create(value:any){const now=new Date().toISOString();return (await Mongo.create({...value,_id:'budget_'+Date.now()+'_'+Math.random().toString(36).slice(2),createdAt:now,updatedAt:now})).toObject() as any;},
 async findByIdAndUpdate(id:string,update:any){return (await Mongo.findByIdAndUpdate(id,{$set:{...update,updatedAt:new Date().toISOString()}},{new:true}).lean()) as any;},
 async findByIdAndDelete(id:string){return !!(await Mongo.findByIdAndDelete(id));},
 async countDocuments(){return Mongo.countDocuments();}
};
function escapeRegex(text:string) {return text.replace(/[^a-zA-Z0-9_]/g, (x)=>String.fromCharCode(92)+x);}
export const BudgetModel = new Proxy(JsonRepository, {get(target,key){if(isUsingMongo() && key in MongoRepository)return (MongoRepository as any)[key];return (target as any)[key];}}) as typeof JsonRepository;
