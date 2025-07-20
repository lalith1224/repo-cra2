const { Pool } = require('pg');
require('dotenv').config();

const testConnection = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'print_repository',
    user: process.env.DB_USER || 'rizwanahamed',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    console.log('Testing database connection with the following settings:');
    console.log({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'print_repository',
      user: process.env.DB_USER || 'rizwanamed'
    });

    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', result.rows[0].current_time);
    
    // Check if orders table exists
    const tableCheck = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders')"
    );
    console.log('Orders table exists:', tableCheck.rows[0].exists);
    
    client.release();
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await pool.end();
  }
};

testConnection();
