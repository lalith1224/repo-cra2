const { Pool } = require('pg');
const { logger } = require('./utils/logger');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Drop existing tables if they exist
    await client.query(`
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS Faculty CASCADE; -- 🆕 Drop Faculty table if exists
    `);

    // Create new tables with updated schema
    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        roll_number VARCHAR(50) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        stored_filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER NOT NULL,
        file_mimetype VARCHAR(100) NOT NULL,
        total_pages INTEGER NOT NULL,
        color_pages INTEGER DEFAULT 0,
        bw_pages INTEGER DEFAULT 0,
        price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_id VARCHAR(255),
        print_options JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '12 hours')
      );
    `);

    // 🆕 Create Faculty table
    await client.query(`
      CREATE TABLE Faculty (
        id SERIAL PRIMARY KEY,
        department_name VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);

    // 🆕 Insert sample faculty credentials
    await client.query(`
      INSERT INTO Faculty (department_name, password)
      VALUES 
        ('CSE', '1234'),
        ('ECE', 'pass456')
      ON CONFLICT (department_name) DO NOTHING;
    `);

    // Add indexes
    await client.query(`
      CREATE INDEX idx_orders_roll_number ON orders(roll_number);
      CREATE INDEX idx_orders_status ON orders(status);
      CREATE INDEX idx_orders_payment_status ON orders(payment_status);
      CREATE INDEX idx_orders_created_at ON orders(created_at);
    `);

    await client.query('COMMIT');
    logger.info('Database initialized successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    logger.info('Database setup completed');
    process.exit(0);
  })
  .catch(error => {
    logger.error('Database setup failed:', error);
    process.exit(1);
  });
