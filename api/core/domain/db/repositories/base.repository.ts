export interface IBaseRepository<T, A> {
    execute(data: A, queryRunner?: any): Promise<T>;
}
