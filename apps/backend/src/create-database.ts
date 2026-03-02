import { Client, QueryResult } from 'pg';
import { config } from 'dotenv';
config();

async function createDatabaseIfNotExists() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
  const dbUser = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'root';
  const dbName = process.env.DB_NAME || 'ecommerce';

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
  });

  try {
    await client.connect();

    const result: QueryResult = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      dbName,
    ]);

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database ${dbName} created`);
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && error !== null && 'message' in error) {
      console.error('❌ Error creating database:', (error as { message?: string }).message);
    } else {
      console.error('❌ Error creating database:', error);
    }
  } finally {
    await client.end();
  }
}

void createDatabaseIfNotExists();
