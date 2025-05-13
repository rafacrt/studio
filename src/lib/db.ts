// src/lib/db.ts
import mysql from 'mysql2/promise';

// Database connection configuration
// These should ideally come from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'freelaos_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to test the connection (optional)
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the MySQL database.');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to the MySQL database:', error);
    // Depending on the error type, you might want to handle it differently
    if (error instanceof Error) {
        if ('code' in error && error.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        } else if ('code' in error && error.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        } else if ('code' in error && error.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        } else {
            console.error('Unknown database connection error:', error.message);
        }
    } else {
        console.error('An unknown error occurred during database connection:', error);
    }
    // Rethrow or handle as appropriate for your application
    // For a simple test, returning false or throwing might be sufficient
    // throw error; // or return false;
    return false;
  }
}

// Export the pool for use in other modules (e.g., server actions)
export default pool;

// Example of how to execute a query
// export async function query(sql: string, params?: any[]) {
//   const connection = await pool.getConnection();
//   try {
//     const [results] = await connection.execute(sql, params);
//     return results;
//   } finally {
//     connection.release();
//   }
// }
