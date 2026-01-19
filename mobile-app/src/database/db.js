import * as SQLite from 'expo-sqlite';

let database = null;

// Initialize database
export const initDatabase = async () => {
  database = await SQLite.openDatabaseAsync('herblock.db');
  
  // Create tables
  await database.execAsync(`
    -- Collections table
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      species TEXT NOT NULL,
      scientific_name TEXT,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      accuracy REAL,
      collector_id TEXT NOT NULL,
      quantity REAL,
      unit TEXT DEFAULT 'kg',
      notes TEXT,
      timestamp TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      synced INTEGER DEFAULT 0,
      tx_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      synced_at TEXT
    );

    -- Credentials cache (for offline login)
    CREATE TABLE IF NOT EXISTS credentials (
      collector_id TEXT PRIMARY KEY,
      pin_hash TEXT NOT NULL,
      name TEXT,
      region TEXT,
      last_login TEXT
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_collections_status ON collections(status);
    CREATE INDEX IF NOT EXISTS idx_collections_synced ON collections(synced);
    CREATE INDEX IF NOT EXISTS idx_collections_timestamp ON collections(timestamp);
  `);

  console.log('Database initialized successfully');
  return database;
};

// Get database instance
const getDb = () => {
  if (!database) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return database;
};

// Database operations
export const db = {
  // Save a new collection
  saveCollection: async (collection) => {
    const db = getDb();
    await db.runAsync(
      `INSERT INTO collections 
        (id, product_id, species, scientific_name, lat, lon, accuracy, 
         collector_id, quantity, unit, notes, timestamp, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        collection.id,
        collection.product_id,
        collection.species,
        collection.scientific_name || null,
        collection.gps.lat,
        collection.gps.lon,
        collection.gps.accuracy || null,
        collection.collector_id,
        collection.quantity || null,
        collection.unit || 'kg',
        collection.notes || null,
        collection.timestamp,
        collection.status || 'pending',
      ]
    );
  },

  // Get all pending collections
  getPendingCollections: async () => {
    const db = getDb();
    const rows = await db.getAllAsync(
      `SELECT * FROM collections WHERE synced = 0 ORDER BY timestamp DESC`
    );
    return rows.map(row => ({
      id: row.id,
      product_id: row.product_id,
      species: row.species,
      scientific_name: row.scientific_name,
      gps: { lat: row.lat, lon: row.lon, accuracy: row.accuracy },
      collector_id: row.collector_id,
      quantity: row.quantity,
      unit: row.unit,
      notes: row.notes,
      timestamp: row.timestamp,
      status: row.status,
    }));
  },

  // Get collection history with filter
  getCollectionHistory: async (filter = 'all') => {
    const db = getDb();
    let query = 'SELECT * FROM collections';
    
    if (filter === 'synced') {
      query += ' WHERE synced = 1';
    } else if (filter === 'pending') {
      query += ' WHERE synced = 0';
    }
    
    query += ' ORDER BY timestamp DESC LIMIT 100';
    
    const rows = await db.getAllAsync(query);
    return rows.map(row => ({
      id: row.id,
      product_id: row.product_id,
      species: row.species,
      gps: { lat: row.lat, lon: row.lon },
      quantity: row.quantity,
      timestamp: row.timestamp,
      status: row.status,
      synced: row.synced === 1,
      txId: row.tx_id,
    }));
  },

  // Update collection status
  updateCollectionStatus: async (id, status) => {
    const db = getDb();
    await db.runAsync(
      `UPDATE collections SET status = ? WHERE id = ?`,
      [status, id]
    );
  },

  // Mark collection as synced
  markSynced: async (id, txId) => {
    const db = getDb();
    await db.runAsync(
      `UPDATE collections 
       SET synced = 1, status = 'synced', tx_id = ?, synced_at = datetime('now')
       WHERE id = ?`,
      [txId, id]
    );
  },

  // Delete a collection
  deleteCollection: async (id) => {
    const db = getDb();
    await db.runAsync(`DELETE FROM collections WHERE id = ?`, [id]);
  },

  // Clear all data
  clearAll: async () => {
    const db = getDb();
    await db.execAsync(`
      DELETE FROM collections;
      DELETE FROM credentials;
    `);
  },

  // Save credentials for offline login
  saveCredentials: async (collectorId, pinHash, name, region) => {
    const db = getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO credentials 
        (collector_id, pin_hash, name, region, last_login)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [collectorId, pinHash, name, region]
    );
  },

  // Check credentials for offline login
  checkCredentials: async (collectorId, pinHash) => {
    const db = getDb();
    const row = await db.getFirstAsync(
      `SELECT * FROM credentials WHERE collector_id = ? AND pin_hash = ?`,
      [collectorId, pinHash]
    );
    return row ? {
      id: row.collector_id,
      name: row.name,
      region: row.region,
    } : null;
  },

  // Get statistics
  getStats: async () => {
    const db = getDb();
    const stats = await db.getFirstAsync(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN synced = 1 THEN 1 ELSE 0 END) as synced,
        SUM(CASE WHEN synced = 0 AND status != 'rejected' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM collections
    `);
    return stats;
  },
};
