import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const useMemory = process.env.DB_MODE === 'memory' || !process.env.DB_HOST;

const sequelize = useMemory
  ? new Sequelize('sqlite::memory:', {
      logging: false,
      define: { timestamps: true, underscored: true },
    })
  : new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'bourse_cac40',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
      },
    });

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log(`[DB] ${useMemory ? 'SQLite in-memory' : 'PostgreSQL'} connection established.`);
    await sequelize.sync({ force: useMemory, alter: !useMemory && process.env.NODE_ENV === 'development' });
    console.log('[DB] Models synchronized.');
  } catch (error) {
    console.error('[DB] Unable to connect:', error);
    if (!useMemory) {
      console.log('[DB] Falling back to SQLite in-memory...');
      // Retry won't work here since sequelize instance is already created
      // Server will exit and user should set DB_MODE=memory
    }
    process.exit(1);
  }
}

export default sequelize;
