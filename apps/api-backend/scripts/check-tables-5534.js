const { Client } = require('pg');
(async () => {
  try {
    const client = new Client({ host: 'localhost', port: 5534, user: 'postgres', password: 'postgres', database: 'patio_sarduy' });
    await client.connect();
    const res = await client.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
  } catch (e) {
    console.error('ERR>>', e);
    process.exit(1);
  }
})();
