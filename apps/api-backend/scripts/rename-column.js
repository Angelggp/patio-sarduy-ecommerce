require('dotenv').config();
const { Client } = require('pg');
(async () => {
  const c = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'patio_sarduy',
  });
  try {
    await c.connect();
    await c.query('ALTER TABLE "product" RENAME COLUMN "mainPopularUsePopularUse" TO "mainPopularUsePopularuse"');
    console.log('renamed');
    await c.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
