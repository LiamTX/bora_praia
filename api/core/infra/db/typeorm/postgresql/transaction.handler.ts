import { DataSource, QueryRunner } from 'typeorm';
import { ITransactionHandler } from '@domain/db/transaction.handler';

export class TransactionHandler implements ITransactionHandler {
    constructor(private readonly dataSource: DataSource) {}

    async begin(): Promise<QueryRunner> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        return queryRunner;
    }

    async commit(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.commitTransaction();
        await queryRunner.release();
    }

    async rollback(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
    }
}
