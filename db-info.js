const fs = require('fs');
const { Client } = require('pg');

// Load .env manually
const envPath = '.env';
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...val] = line.split('=');
      if (key) process.env[key.trim()] = val.join('=').trim();
    }
  });
}

const client = new Client({ connectionString: process.env.DATABASE_URL, statement_timeout: 5000 });

(async () => {
  try {
    console.log('Attempting connection...');
    await client.connect();
    console.log('Connected!');
    
    // Try to list all tables
    const result = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);
    
    console.log('Tables found:', result.rows.length);
    result.rows.forEach(r => console.log(`  ${r.table_schema}.${r.table_name}`));
    
  } catch (e) {
    console.log('Error type:', e.constructor.name);
    console.log('Code:', e.code);
    console.log('Message:', e.message);
    if (e.routine) console.log('Routine:', e.routine);
  } finally {
    await client.end();
  }
})();
