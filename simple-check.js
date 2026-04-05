const fs = require('fs');
const { Client } = require('pg');

const envPath = '.env';
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...val] = line.split('=');
      if (key) process.env[key.trim()] = val.join('=').trim();
    }
  });
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    await client.connect();
    
    // Get table structure
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    result.rows.forEach(r => {
      console.log(`  ${r.column_name}: ${r.data_type}${r.is_nullable === 'NO' ? ' NOT NULL' : ''}${r.column_default ? ' DEFAULT ' + r.column_default : ''}`);
    });
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
})();
