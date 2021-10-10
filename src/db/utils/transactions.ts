import { Connection, QueryRunner } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

export const autoRetryTransaction = async <T>(
  connection: Connection,
  fn: (queryRunner: QueryRunner) => Promise<T>,
  isolationLevel: IsolationLevel = 'SERIALIZABLE',
  retryCount = Number.MAX_SAFE_INTEGER,
) => {
  for (let i = 0; i < retryCount; i++) {
    const queryRunner = connection.createQueryRunner();
    let result: T;
    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);
    try {
      result = await fn(queryRunner);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (shouldRetryTransaction(error)) {
        console.warn('AutoRetryTransaction try', i);
        continue;
      } else {
        throw new Error(error);
      }
    } finally {
      await queryRunner.release();
    }
    return result;
  }
  throw new Error('Exceeded retry limit ' + retryCount);
};

function shouldRetryTransaction(err: any) {
  const code = typeof err === 'object' ? String(err.code) : null;
  return code === '40001' || code === '40P01';
}
