import mongoose from 'mongoose';
import dns from 'dns';

// Ensure MongoDB Atlas SRV resolution works reliably across all environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

export const defaultSampleData = {
  users: [
    {
      id: 'u-1',
      name: 'Omar Farooq (Owner)',
      email: 'admin@celltech.com',
      password: '$2b$10$8ORXpVGE3EzDfFQgcEqy1.4f7jIJlTGQZy1lGignBdrd63R.nNJYG',
      role: 'admin',
      title: 'Store Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      createdAt: new Date().toISOString().split('T')[0],
    },
    {
      id: 'u-2',
      name: 'Hamza Khan',
      email: 'hamza@celltech.com',
      password: '$2b$10$8ORXpVGE3EzDfFQgcEqy1.4f7jIJlTGQZy1lGignBdrd63R.nNJYG',
      role: 'staff',
      title: 'Senior Sales Executive',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      createdAt: new Date().toISOString().split('T')[0],
    },
  ],
  products: [],
  categories: [
    { id: 'cat-1', name: 'Smartphones' },
    { id: 'cat-2', name: 'Accessories & Chargers' },
    { id: 'cat-3', name: 'Earbuds & Headphones' },
    { id: 'cat-4', name: 'Smart Watches & Bands' },
    { id: 'cat-5', name: 'Covers & Protectors' },
  ],
  customers: [],
  suppliers: [],
  purchases: [],
  sales: [],
  expenses: [],
  stock_transactions: [],
};

// Global memory store for instant response & fallback
if (!global._nextDbStore) {
  global._nextDbStore = {
    users: [...defaultSampleData.users],
    products: [...defaultSampleData.products],
    categories: [...defaultSampleData.categories],
    imeis: [],
    customers: [...defaultSampleData.customers],
    suppliers: [...defaultSampleData.suppliers],
    supplier_ledgers: [],
    purchases: [...defaultSampleData.purchases],
    purchase_items: [],
    sales: [...defaultSampleData.sales],
    sale_items: [],
    invoices: [],
    payments: [],
    expenses: [...defaultSampleData.expenses],
    stock_transactions: [...defaultSampleData.stock_transactions],
  };
}

export const store = global._nextDbStore;

export function ensureSeedData() {
  if (!store.users || store.users.length === 0) {
    store.users = [...defaultSampleData.users];
  }
  if (!store.categories || store.categories.length === 0) {
    store.categories = [...defaultSampleData.categories];
  }
}

export async function loadCollection(collectionName) {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const docs = await mongoose.connection.db.collection(collectionName).find({}).toArray();
      if (docs.length > 0) {
        store[collectionName] = docs.map(({ _id, ...rest }) => rest);
        return store[collectionName];
      }
    }
  } catch (err) {
    console.error(`Error loading ${collectionName} from MongoDB:`, err.message);
  }
  return store[collectionName] || [];
}

export async function saveDocument(collectionName, doc) {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.collection(collectionName).updateOne(
        { id: doc.id },
        { $set: doc },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error(`Error saving to ${collectionName}:`, err.message);
  }
}

export async function deleteDocument(collectionName, id) {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.collection(collectionName).deleteOne({ id });
    }
  } catch (err) {
    console.error(`Error deleting from ${collectionName}:`, err.message);
  }
}

export async function loadFromMongoDB() {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();

      let hasDocs = false;
      for (const col of collections) {
        const key = col.name;
        if (store[key] !== undefined) {
          const docs = await db.collection(key).find({}).toArray();
          if (docs.length > 0) {
            hasDocs = true;
            store[key] = docs.map(({ _id, ...rest }) => rest);
          }
        }
      }

      if (!hasDocs) {
        ensureSeedData();
        await syncToMongoDB();
      }
    } else {
      ensureSeedData();
    }
  } catch (err) {
    console.error('Error loading from MongoDB Atlas:', err.message);
    ensureSeedData();
  }
}

export async function syncToMongoDB() {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const db = mongoose.connection.db;
      const keys = Object.keys(store);

      for (const key of keys) {
        if (store[key] && Array.isArray(store[key]) && store[key].length > 0) {
          const collection = db.collection(key);
          for (const item of store[key]) {
            if (item.id) {
              await collection.updateOne({ id: item.id }, { $set: item }, { upsert: true });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('MongoDB Atlas sync error:', err.message);
  }
}

export async function saveDB() {
  await syncToMongoDB();
}

let cachedPromise = null;

export const connectDB = async () => {
  const mongoURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/OmarFarooqMobileShop';

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(mongoURI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then(async (conn) => {
        console.log(`🍃 Connected to MongoDB: ${conn.connection.name || 'Atlas'}`);
        await loadFromMongoDB();
        return conn;
      })
      .catch((error) => {
        cachedPromise = null;
        console.warn('MongoDB connection note (in-memory mode):', error.message);
        ensureSeedData();
      });
  }

  await cachedPromise;
  return mongoose.connection;
};

export async function resetDatabaseData() {
  Object.keys(defaultSampleData).forEach((key) => {
    store[key] = [...defaultSampleData[key]];
  });
  await saveDB();
  return { message: 'Database reset and re-seeded with initial sample data' };
}

export default store;
