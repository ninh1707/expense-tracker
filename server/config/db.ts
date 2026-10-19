import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DBState {
  users: any[];
  transactions: any[];
  budgets: any[];
  savingsGoals: any[];
  recurringPayments: any[];
  globalCategories?: any[];
  activityLogs?: any[];
}

let isMongoConnected = false;
export const isUsingMongo = () => isMongoConnected;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state if file doesn't exist
const getInitialState = (): DBState => ({
  users: [],
  transactions: [],
  budgets: [],
  savingsGoals: [],
  recurringPayments: [],
  globalCategories: [],
  activityLogs: []
});

export const loadData = (): DBState => {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialState();
    saveData(initial);
    return initial;
  }
  // A damaged JSON file must never be treated as an empty database.
  // Otherwise an ordinary update could overwrite all existing accounts and transactions.
  const state = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as DBState;
  for (const key of ['users', 'transactions', 'budgets', 'savingsGoals', 'recurringPayments'] as const) {
    if (!Array.isArray(state[key])) throw new Error(`Dữ liệu không hợp lệ: ${key}`);
  }
  return state;
};

export const saveData = (data: DBState): void => {
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  try {
    if (fs.existsSync(DB_FILE)) {
      const backups = path.join(DATA_DIR, 'backups');
      fs.mkdirSync(backups, {recursive:true});
      const stamp = new Date().toISOString().replace(/[-:T.Z]/g,'').slice(0,14);
      const backupPath = path.join(backups, `db-${stamp}-${Date.now()}.json`);
      fs.copyFileSync(DB_FILE, backupPath);
      const files = fs.readdirSync(backups).filter(x=>x.startsWith('db-')&&x.endsWith('.json')).sort().reverse();
      for (const obsolete of files.slice(10)) fs.unlinkSync(path.join(backups,obsolete));
    }
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
  } catch (error) {
    try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch { /* keep original error */ }
    throw error;
  }
};

export const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.startsWith('mongodb')) {
    try {
      console.log('Đang kết nối MongoDB...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
      isMongoConnected = true;
      console.log('MongoDB successfully connected!');
      return true;
    } catch (err: any) {
      isMongoConnected = false;
      throw new Error('Không thể kết nối MongoDB được cấu hình trong MONGODB_URI: ' + err.message + '. Đã dừng để tránh đọc/ghi nhầm dữ liệu JSON Store.');
    }
  } else {
    console.log('No MONGODB_URI provided. Initialized embedded document store with JSON persistence at ./data/db.json');
  }
  return false;
};

export const isMongoDB = (): boolean => isMongoConnected;
