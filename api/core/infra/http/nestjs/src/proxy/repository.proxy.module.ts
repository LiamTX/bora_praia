import { DynamicModule, Module } from '@nestjs/common';
import { DataSource, EntitySchema, Repository } from 'typeorm';
import { DATABASE } from '../db/database.provider';
import { DatabaseModule } from '../db/database.module';

export interface RepositoryProxyRegistration<T> {
    provide: string | symbol;
    schema: EntitySchema<T>;
}

@Module({})
export class RepositoryProxyModule {
    static register<T>(registrations: RepositoryProxyRegistration<T>[] = []): DynamicModule {
        const providers = registrations.map((registration) => ({
            provide: registration.provide,
            useFactory: (dataSource: DataSource): Repository<T> =>
                dataSource.getRepository(registration.schema),
            inject: [DATABASE],
        }));

        return {
            module: RepositoryProxyModule,
            imports: [DatabaseModule],
            providers,
            exports: providers.map((p) => p.provide),
        };
    }
}
