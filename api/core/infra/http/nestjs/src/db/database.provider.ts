import { AppDataSource } from '@typeorm/postgresql.ormconfig';

export const DATABASE = 'DATABASE';

export const databaseProvider = {
    provide: DATABASE,
    useFactory: async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        return AppDataSource;
    },
};
