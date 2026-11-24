import { QueryRunner } from 'typeorm';

export interface ITransactionHandler {
    begin(): Promise<QueryRunner>;
    commit(queryRunner: QueryRunner): Promise<void>;
    rollback(queryRunner: QueryRunner): Promise<void>;
}
