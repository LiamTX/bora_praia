import 'dotenv/config';
import { DataSource } from 'typeorm';

const int = (value: string | undefined, fallback: number): number =>
    value ? parseInt(value, 10) : fallback;

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    logging: process.env.DB_LOG === 'true',
    entities: [__dirname + '/entities/*.entity.{ts,js}'],
    migrations: [__dirname + '/migrations/*.{ts,js}'],
    migrationsRun: false,
    synchronize: false,
    extra: {
        max: int(process.env.DB_POOL_MAX, 10),
        min: int(process.env.DB_POOL_MIN, 0),
        idleTimeoutMillis: int(process.env.DB_POOL_IDLE_TIMEOUT_MS, 30000),
        connectionTimeoutMillis: int(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 10000),
        statement_timeout: int(process.env.DB_STATEMENT_TIMEOUT_MS, 30000),
        maxUses: int(process.env.DB_POOL_MAX_USES, 10000),
    },
});
