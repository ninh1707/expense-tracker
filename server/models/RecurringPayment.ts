import { loadData, saveData, isUsingMongo } from '../config/db';
import mongoose from 'mongoose';

export interface IRecurringPayment {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dueDate: number; // day of the month (1-31) or day
  nextDueDate: string; // YYYY-MM-DD
  reminderDaysBefore: number;
  autoRecordTransaction: boolean;
  status: 'active' | 'paused';
  notes?: string;
  paymentHistory?: {
    date: string;
    amount: number;
    transactionId?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const schema=new mongoose.Schema({_id:{type:String,required:true},userId:String,title:String,amount:Number,type:String,category:String,frequency:String,dueDate:Number,nextDueDate:String,reminderDaysBefore:Number,autoRecordTransaction:Boolean,status:String,notes:String,paymentHistory:[{_id:false,date:String,amount:Number,transactionId:String}],createdAt:String,updatedAt:String},{versionKey:false,strict:false});
schema.index({userId:1,nextDueDate:1});
const Mongo: mongoose.Model<any> = (mongoose.models.FinTrackRecurringPayment || mongoose.model('FinTrackRecurringPayment',schema,'recurringPayments')) as mongoose.Model<any>;
const JsonRepository = {
  async find(filter: { userId: string }): Promise<IRecurringPayment[]> {
    const data = loadData();
    return data.recurringPayments
      .filter((r: IRecurringPayment) => r.userId === filter.userId)
      .sort((a: IRecurringPayment, b: IRecurringPayment) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  },

  async findById(id: string): Promise<IRecurringPayment | null> {
    const data = loadData();
    const item = data.recurringPayments.find((r: IRecurringPayment) => r._id === id);
    return item ? { ...item } : null;
  },

  async create(recData: Omit<IRecurringPayment, '_id' | 'createdAt' | 'updatedAt' | 'paymentHistory'>): Promise<IRecurringPayment> {
    const data = loadData();
    const now = new Date().toISOString();
    const newRec: IRecurringPayment = {
      _id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      ...recData,
      paymentHistory: [],
      createdAt: now,
      updatedAt: now
    };
    data.recurringPayments.push(newRec);
    saveData(data);
    return { ...newRec };
  },

  async findByIdAndUpdate(id: string, update: Partial<IRecurringPayment>): Promise<IRecurringPayment | null> {
    const data = loadData();
    const index = data.recurringPayments.findIndex((r: IRecurringPayment) => r._id === id);
    if (index === -1) return null;

    data.recurringPayments[index] = {
      ...data.recurringPayments[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return { ...data.recurringPayments[index] };
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const data = loadData();
    const initialLen = data.recurringPayments.length;
    data.recurringPayments = data.recurringPayments.filter((r: IRecurringPayment) => r._id !== id);
    if (data.recurringPayments.length !== initialLen) {
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
 async create(value:any){const now=new Date().toISOString();return (await Mongo.create({...value,_id:'recurringpayment_'+Date.now()+'_'+Math.random().toString(36).slice(2),createdAt:now,updatedAt:now})).toObject() as any;},
 async findByIdAndUpdate(id:string,update:any){return (await Mongo.findByIdAndUpdate(id,{$set:{...update,updatedAt:new Date().toISOString()}},{new:true}).lean()) as any;},
 async findByIdAndDelete(id:string){return !!(await Mongo.findByIdAndDelete(id));},
 async countDocuments(){return Mongo.countDocuments();}
};
function escapeRegex(text:string) {return text.replace(/[^a-zA-Z0-9_]/g, (x)=>String.fromCharCode(92)+x);}
export const RecurringPaymentModel = new Proxy(JsonRepository, {get(target,key){if(isUsingMongo() && key in MongoRepository)return (MongoRepository as any)[key];return (target as any)[key];}}) as typeof JsonRepository;
