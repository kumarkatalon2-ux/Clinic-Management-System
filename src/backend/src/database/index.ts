import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'clinical_db',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    'src/entities/**/*.ts'
  ],
  migrations: [
    'src/database/migrations/**/*.ts'
  ],
  subscribers: [
    'src/database/subscribers/**/*.ts'
  ],
  cache: {
    type: 'ioredis',
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 0,
      ttl: 60 * 60, // 1 hour
    }
  },
});
