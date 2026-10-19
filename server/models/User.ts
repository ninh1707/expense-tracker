import { loadData, saveData, isUsingMongo } from '../config/db';
import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed
  role?: 'admin' | 'user';
  disabled?: boolean;
  deletedAt?: string;
  currency: string;
  language: string;
  monthlyIncomeTarget?: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

const schema=new mongoose.Schema({_id:{type:String,required:true},email:{type:String,required:true},name:String,password:String,role:String,disabled:Boolean,deletedAt:String,currency:String,language:String,monthlyIncomeTarget:Number,avatar:String,createdAt:String,updatedAt:String},{versionKey:false,strict:false});
schema.index({email:1},{unique:true});
const Mongo: mongoose.Model<any> = (mongoose.models.FinTrackUser || mongoose.model('FinTrackUser',schema,'users')) as mongoose.Model<any>;
const JsonRepository = {
  async findOne(filter: Partial<IUser>): Promise<IUser | null> {
    const data = loadData();
    const user = data.users.find((u: IUser) => {
      for (const key of Object.keys(filter) as (keyof IUser)[]) {
        if (filter[key] !== undefined && u[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
    return user ? { ...user } : null;
  },

  async findById(id: string): Promise<IUser | null> {
    const data = loadData();
    const user = data.users.find((u: IUser) => u._id === id);
    return user ? { ...user } : null;
  },

  async create(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const data = loadData();
    const now = new Date().toISOString();
    const newUser: IUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    data.users.push(newUser);
    saveData(data);
    return { ...newUser };
  },

  async findByIdAndUpdate(id: string, update: Partial<IUser>): Promise<IUser | null> {
    const data = loadData();
    const index = data.users.findIndex((u: IUser) => u._id === id);
    if (index === -1) return null;
    
    data.users[index] = {
      ...data.users[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return { ...data.users[index] };
  },

  async countDocuments(): Promise<number> {
    const data = loadData();
    return data.users.length;
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
 async create(value:any){const now=new Date().toISOString();return (await Mongo.create({...value,_id:'user_'+Date.now()+'_'+Math.random().toString(36).slice(2),createdAt:now,updatedAt:now})).toObject() as any;},
 async findByIdAndUpdate(id:string,update:any){return (await Mongo.findByIdAndUpdate(id,{$set:{...update,updatedAt:new Date().toISOString()}},{new:true}).lean()) as any;},
 async findByIdAndDelete(id:string){return !!(await Mongo.findByIdAndDelete(id));},
 async countDocuments(){return Mongo.countDocuments();}
};
function escapeRegex(text:string) {return text.replace(/[^a-zA-Z0-9_]/g, (x)=>String.fromCharCode(92)+x);}
export const UserModel = new Proxy(JsonRepository, {get(target,key){if(isUsingMongo() && key in MongoRepository)return (MongoRepository as any)[key];return (target as any)[key];}}) as typeof JsonRepository;
