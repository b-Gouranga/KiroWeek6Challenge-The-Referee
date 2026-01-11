import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { initializeDatabase } from './db';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database connection and schema
    await initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
