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

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    await client.connect();
    
    console.log('=== USERS TABLE ===');
    const usersCols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    usersCols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} ${r.is_nullable === 'NO' ? 'NOT NULL' : ''}`));
    
    const usersConstraints = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'users'
    `);
    console.log('\nConstraints:');
    usersConstraints.rows.forEach(r => console.log(`  ${r.constraint_name}: ${r.constraint_type}`));
    
    console.log('\n=== Checking unique constraints ===');
    const uniq = await client.query(`
      SELECT a.attname, ix.indexname
      FROM pg_class t
      JOIN pg_index idx ON t.oid = idx.indrelid
      JOIN pg_class i ON i.oid = idx.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
      LEFT JOIN pg_indexes ix ON ix.tablename = t.relname
      WHERE t.relname = 'users' AND idx.indisunique
    `);
    console.log('Unique indexes:');
    if (uniq.rows.length === 0) {
      console.log('  NONE - name column is NOT unique!');
    } else {
      uniq.rows.forEach(r => console.log(`  ${r.indexname} on ${r.attname}`));
    }
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
})();
