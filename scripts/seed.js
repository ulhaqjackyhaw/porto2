import { initDb } from '../src/libs/db.js';

async function main() {
  console.log('Connecting to MySQL and running migrations/seeders...');
  await initDb();
  console.log('✅ Database migration and seeding completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
