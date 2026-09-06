import { loadData, saveData } from '../config/db';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed
  currency: string;
  language: string;
  monthlyIncomeTarget?: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export const UserModel = {
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
