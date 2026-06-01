import 'dotenv/config';
import dataSource from '../src/database/data-source';

(async () => {
  try {
    console.log('Using DB config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });
    await dataSource.initialize();
    const res = await dataSource.runMigrations();
    console.log('Migrations result:', res);
    await dataSource.destroy();
  } catch (e) {
    console.error('Migration error:', e);
    process.exit(1);
  }
})();
