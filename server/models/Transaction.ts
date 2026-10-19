import { loadData, saveData, isUsingMongo } from '../config/db';
import mongoose from 'mongoose';

export type TransactionType = 'income' | 'expense';

export interface ITransaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: string;
  tags?: string[];
  recurringPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

const schema=new mongoose.Schema({_id:{type:String,required:true},userId:{type:String,index:true},type:String,amount:Number,category:String,date:String,description:String,paymentMethod:String,tags:[String],recurringPaymentId:String,createdAt:String,updatedAt:String},{versionKey:false,strict:false});
schema.index({userId:1,date:-1});
const Mongo: mongoose.Model<any> = (mongoose.models.FinTrackTransaction || mongoose.model('FinTrackTransaction',schema,'transactions')) as mongoose.Model<any>;
const JsonRepository = {
  async find(filter: { userId: string; [key: string]: any }): Promise<ITransaction[]> {
    const data = loadData();
    return data.transactions
      .filter((t: ITransaction) => {
        if (t.userId !== filter.userId) return false;
        if (filter.type && t.type !== filter.type) return false;
        if (filter.category && t.category !== filter.category) return false;
        if (filter.startDate && t.date < filter.startDate) return false;
        if (filter.endDate && t.date > filter.endDate) return false;
        if (filter.search) {
          const s = filter.search.toLowerCase();
          const matchDesc = (t.description || '').toLowerCase().includes(s);
          const matchCat = (t.category || '').toLowerCase().includes(s);
          if (!matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a: ITransaction, b: ITransaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async paginate(filter: { userId: string; [key: string]: any }, page: number, limit: number) {
    const all = await this.find(filter);
    const filtered = all.filter(t => {
      if (filter.minAmount !== undefined && t.amount < filter.minAmount) return false;
      if (filter.maxAmount !== undefined && t.amount > filter.maxAmount) return false;
      if (filter.paymentMethod && t.paymentMethod !== filter.paymentMethod) return false;
      return true;
    });
    return { items: filtered.slice((page - 1) * limit, page * limit), total: filtered.length };
  },

  async findById(id: string): Promise<ITransaction | null> {
    const data = loadData();
    const item = data.transactions.find((t: ITransaction) => t._id === id);
    return item ? { ...item } : null;
  },

  async create(txData: Omit<ITransaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<ITransaction> {
    const data = loadData();
    const now = new Date().toISOString();
    const newTx: ITransaction = {
      _id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      ...txData,
      createdAt: now,
      updatedAt: now
    };
    data.transactions.push(newTx);
    saveData(data);
    return { ...newTx };
  },

  async findByIdAndUpdate(id: string, update: Partial<ITransaction>): Promise<ITransaction | null> {
    const data = loadData();
    const index = data.transactions.findIndex((t: ITransaction) => t._id === id);
    if (index === -1) return null;

    data.transactions[index] = {
      ...data.transactions[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return { ...data.transactions[index] };
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const data = loadData();
    const initialLen = data.transactions.length;
    data.transactions = data.transactions.filter((t: ITransaction) => t._id !== id);
    if (data.transactions.length !== initialLen) {
      saveData(data);
      return true;
    }
    return false;
  }
};

// Repository selection is performed at query time, after connectDB has chosen a backend.
const MongoRepository = {
 async find(filter:any) {
   const {startDate,endDate,search,minAmount,maxAmount,...criteria}=filter;
   const query:any={...criteria};
   if(startDate||endDate)query.date={...(startDate?{$gte:startDate}:{}),...(endDate?{$lte:endDate}:{})};
   if(minAmount!==undefined || maxAmount!==undefined) query.amount={...(minAmount!==undefined?{$gte:minAmount}:{}),...(maxAmount!==undefined?{$lte:maxAmount}:{})};
   if(search)query.$or=[{description:{$regex:escapeRegex(String(search)),$options:'i'}},{category:{$regex:escapeRegex(String(search)),$options:'i'}}];
   return (await Mongo.find(query).lean()) as any;
 },
 async paginate(filter:any,page:number,limit:number) {
   const {startDate,endDate,search,minAmount,maxAmount,...criteria}=filter;
   const query:any={...criteria};
   if(startDate||endDate) query.date={...(startDate?{$gte:startDate}:{}),...(endDate?{$lte:endDate}:{})};
   if(minAmount!==undefined||maxAmount!==undefined) query.amount={...(minAmount!==undefined?{$gte:minAmount}:{}),...(maxAmount!==undefined?{$lte:maxAmount}:{})};
   if(search) query.$or=[{description:{$regex:escapeRegex(String(search)),$options:'i'}},{category:{$regex:escapeRegex(String(search)),$options:'i'}}];
   const [items,total]=await Promise.all([
     Mongo.find(query).sort({date:-1,_id:-1}).skip((page-1)*limit).limit(limit).lean(),
     Mongo.countDocuments(query),
   ]);
   return {items:items as ITransaction[],total};
 },
 async findOne(filter:any){return (await Mongo.findOne(filter).lean()) as any;},
 async findById(id:string){return (await Mongo.findById(id).lean()) as any;},
 async create(value:any){const now=new Date().toISOString();return (await Mongo.create({...value,_id:'transaction_'+Date.now()+'_'+Math.random().toString(36).slice(2),createdAt:now,updatedAt:now})).toObject() as any;},
 async findByIdAndUpdate(id:string,update:any){return (await Mongo.findByIdAndUpdate(id,{$set:{...update,updatedAt:new Date().toISOString()}},{new:true}).lean()) as any;},
 async findByIdAndDelete(id:string){return !!(await Mongo.findByIdAndDelete(id));},
 async countDocuments(){return Mongo.countDocuments();}
};
function escapeRegex(text:string) {return text.replace(/[^a-zA-Z0-9_]/g, (x)=>String.fromCharCode(92)+x);}
export const TransactionModel = new Proxy(JsonRepository, {get(target,key){if(isUsingMongo() && key in MongoRepository)return (MongoRepository as any)[key];return (target as any)[key];}}) as typeof JsonRepository;
