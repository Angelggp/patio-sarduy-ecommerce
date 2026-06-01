const { Client } = require('pg');
(async () => {
  try {
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'patio_sarduy',
    });
    await client.connect();
    const res = await client.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
