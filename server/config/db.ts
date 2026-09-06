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
}

let isMongoConnected = false;

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
  recurringPayments: []
});

export const loadData = (): DBState => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialState();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading local DB file:', error);
    return getInitialState();
  }
};

export const saveData = (data: DBState): void => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving local DB file:', error);
  }
};

export const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.startsWith('mongodb')) {
    try {
      console.log('Attempting to connect to MongoDB at:', mongoUri);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
      isMongoConnected = true;
      console.log('MongoDB successfully connected!');
      return true;
    } catch (err: any) {
      console.warn('MongoDB connection not available, using embedded document store:', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('No MONGODB_URI provided. Initialized embedded document store with JSON persistence at ./data/db.json');
  }
  return false;
};

export const isMongoDB = (): boolean => isMongoConnected;
