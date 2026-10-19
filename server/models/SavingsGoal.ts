import { loadData, saveData, isUsingMongo } from '../config/db';
import mongoose from 'mongoose';

export interface ISavingsGoal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  color?: string;
  icon?: string;
  notes?: string;
  history: {
    id: string;
    date: string;
    amount: number;
    type: 'deposit' | 'withdraw';
    note?: string;
  }[];
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const schema=new mongoose.Schema({_id:{type:String,required:true},userId:String,name:String,targetAmount:Number,currentAmount:Number,deadline:String,category:String,color:String,icon:String,notes:String,history:[{_id:false,id:String,date:String,amount:Number,type:String,note:String}],isCompleted:Boolean,createdAt:String,updatedAt:String},{versionKey:false,strict:false});
schema.index({userId:1,deadline:1});
const Mongo: mongoose.Model<any> = (mongoose.models.FinTrackSavingsGoal || mongoose.model('FinTrackSavingsGoal',schema,'savingsGoals')) as mongoose.Model<any>;
const JsonRepository = {
  async find(filter: { userId: string }): Promise<ISavingsGoal[]> {
    const data = loadData();
    return data.savingsGoals
      .filter((s: ISavingsGoal) => s.userId === filter.userId)
      .sort((a: ISavingsGoal, b: ISavingsGoal) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  },

  async findById(id: string): Promise<ISavingsGoal | null> {
    const data = loadData();
    const item = data.savingsGoals.find((s: ISavingsGoal) => s._id === id);
    return item ? { ...item } : null;
  },

  async create(goalData: Omit<ISavingsGoal, '_id' | 'createdAt' | 'updatedAt' | 'history' | 'isCompleted'>): Promise<ISavingsGoal> {
    const data = loadData();
    const now = new Date().toISOString();
    const newGoal: ISavingsGoal = {
      _id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      ...goalData,
      currentAmount: goalData.currentAmount || 0,
      history: goalData.currentAmount ? [{
        id: 'hist_' + Date.now(),
        date: now.split('T')[0],
        amount: goalData.currentAmount,
        type: 'deposit',
        note: 'Initial deposit'
      }] : [],
      isCompleted: (goalData.currentAmount || 0) >= goalData.targetAmount,
      createdAt: now,
      updatedAt: now
    };
    data.savingsGoals.push(newGoal);
    saveData(data);
    return { ...newGoal };
  },

  async findByIdAndUpdate(id: string, update: Partial<ISavingsGoal>): Promise<ISavingsGoal | null> {
    const data = loadData();
    const index = data.savingsGoals.findIndex((s: ISavingsGoal) => s._id === id);
    if (index === -1) return null;

    data.savingsGoals[index] = {
      ...data.savingsGoals[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return { ...data.savingsGoals[index] };
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const data = loadData();
    const initialLen = data.savingsGoals.length;
    data.savingsGoals = data.savingsGoals.filter((s: ISavingsGoal) => s._id !== id);
    if (data.savingsGoals.length !== initialLen) {
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
 async create(value:any){const now=new Date().toISOString();return (await Mongo.create({...value,_id:'savingsgoal_'+Date.now()+'_'+Math.random().toString(36).slice(2),createdAt:now,updatedAt:now})).toObject() as any;},
 async findByIdAndUpdate(id:string,update:any){return (await Mongo.findByIdAndUpdate(id,{$set:{...update,updatedAt:new Date().toISOString()}},{new:true}).lean()) as any;},
 async findByIdAndDelete(id:string){return !!(await Mongo.findByIdAndDelete(id));},
 async countDocuments(){return Mongo.countDocuments();}
};
function escapeRegex(text:string) {return text.replace(/[^a-zA-Z0-9_]/g, (x)=>String.fromCharCode(92)+x);}
export const SavingsGoalModel = new Proxy(JsonRepository, {get(target,key){if(isUsingMongo() && key in MongoRepository)return (MongoRepository as any)[key];return (target as any)[key];}}) as typeof JsonRepository;
