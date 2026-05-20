const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check if credentials are placeholders or empty
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseKey && 
  supabaseKey !== 'your-supabase-service-role-key' &&
  supabaseKey !== 'your-supabase-service-role-key-or-anon-key';

let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client successfully initialized.');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
  }
} else {
  console.log('--- WARNING: Supabase not configured. Using local JSON persistent database. ---');
}

// Local persistent database fallback setup
const LOCAL_DB_PATH = path.join(__dirname, '../uploads/local_db.json');

const ensureLocalDbExists = () => {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initialDb = {
      users: [
        {
          id: 'admin-id-12345',
          email: process.env.ADMIN_EMAIL || 'admin@maatravels.com',
          // bcrypt hashed 'adminpassword123'
          password_hash: '$2a$10$Q7aLgA4G4tS7Vn5hJqG/Zeg3oBspbXyLixjE0HfeBvH740qU6yOLe',
          name: 'MAA Travels Admin',
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ],
      vehicles: [],
      clients: [],
      contracts: [],
      payments: [],
      inquiries: []
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf8');
  }
};

const readLocalDb = () => {
  ensureLocalDbExists();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local DB:', err);
    return { users: [], vehicles: [], clients: [], contracts: [], payments: [], inquiries: [] };
  }
};

const writeLocalDb = (data) => {
  ensureLocalDbExists();
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local DB:', err);
  }
};

// Database operations abstraction
const db = {
  isMock: !isSupabaseConfigured,
  
  query: async (table, options = {}) => {
    if (isSupabaseConfigured && supabase) {
      let q = supabase.from(table).select(options.select || '*');
      if (options.eq) {
        Object.entries(options.eq).forEach(([col, val]) => {
          q = q.eq(col, val);
        });
      }
      if (options.order) {
        const [col, direction] = options.order.split(':');
        q = q.order(col, { ascending: direction === 'asc' });
      }
      if (options.limit) {
        q = q.limit(options.limit);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    } else {
      const store = readLocalDb();
      let records = store[table] || [];
      if (options.eq) {
        records = records.filter(row => {
          return Object.entries(options.eq).every(([col, val]) => String(row[col]) === String(val));
        });
      }
      // Simple sorting
      if (options.order) {
        const [col, direction] = options.order.split(':');
        const asc = direction === 'asc' ? 1 : -1;
        records.sort((a, b) => {
          if (a[col] < b[col]) return -1 * asc;
          if (a[col] > b[col]) return 1 * asc;
          return 0;
        });
      }
      if (options.limit) {
        records = records.slice(0, options.limit);
      }
      return records;
    }
  },

  insert: async (table, data) => {
    if (isSupabaseConfigured && supabase) {
      const { data: inserted, error } = await supabase.from(table).insert(data).select();
      if (error) throw error;
      return inserted[0];
    } else {
      const store = readLocalDb();
      const newRecord = {
        id: Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36),
        created_at: new Date().toISOString(),
        ...data
      };
      if (!store[table]) store[table] = [];
      store[table].push(newRecord);
      writeLocalDb(store);
      return newRecord;
    }
  },

  update: async (table, id, data) => {
    if (isSupabaseConfigured && supabase) {
      const { data: updated, error } = await supabase.from(table).update(data).eq('id', id).select();
      if (error) throw error;
      return updated[0];
    } else {
      const store = readLocalDb();
      if (!store[table]) return null;
      const index = store[table].findIndex(item => String(item.id) === String(id));
      if (index === -1) throw new Error('Record not found');
      store[table][index] = { ...store[table][index], ...data };
      writeLocalDb(store);
      return store[table][index];
    }
  },

  delete: async (table, id) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from(table).delete().eq('id', id).select();
      if (error) throw error;
      return data[0];
    } else {
      const store = readLocalDb();
      if (!store[table]) return null;
      const index = store[table].findIndex(item => String(item.id) === String(id));
      if (index === -1) throw new Error('Record not found');
      const [deleted] = store[table].splice(index, 1);
      writeLocalDb(store);
      return deleted;
    }
  }
};

// Supabase Auto Keep-Alive Interval (Runs every 12 hours to hit the API)
if (isSupabaseConfigured) {
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      console.log('Sending keep-alive query to Supabase database...');
      // Simple lightweight select to keep connection active
      const { error } = await supabase.from('vehicles').select('id').limit(1);
      if (error) {
        console.warn('Keep-alive warning (database might be empty or table missing, which is fine):', error.message);
      } else {
        console.log('Supabase connection successfully kept alive.');
      }
    } catch (err) {
      console.error('Error during database keep-alive check:', err);
    }
  }, TWELVE_HOURS);
}

module.exports = db;
