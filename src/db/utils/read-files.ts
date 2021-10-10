import { readFileSync } from 'fs';
import { join } from 'path';

export const readMigration = (migration: string, path?: string) =>
  readFileSync(join(__dirname, `${path}/migration/${migration}.up.sql`), 'utf8');
