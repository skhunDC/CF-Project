import { readFile } from 'node:fs/promises';
import process from 'node:process';

const dbBinding = process.env.DB;
if (!dbBinding) {
  console.error('Run this through Wrangler so the DB binding is available, e.g. `npm run db:seed -- --local`.');
  process.exit(1);
}

const sql = await readFile(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8');
console.log('Schema preview loaded. Apply migrations with `npm run db:migrate` or `npm run db:migrate:remote`.');
console.log(sql.slice(0, 240) + '...');
