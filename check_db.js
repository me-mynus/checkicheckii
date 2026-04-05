const { Client } = require('pg');

const client = new Client(process.env.DATABASE_URL);

(async () => {
  try {
    await client.connect();
    console.log('✓ Connected to database');
    
    const result = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    
    if (result.rows.length === 0) {
      console.log('✗ No tables found in database. Schema not created yet.');
    } else {
      console.log('✓ Tables in database:', result.rows.map(r => r.table_name).join(', '));
    }
    
  } catch (error) {
    console.error('✗ Database error:', error.message);
  } finally {
    await client.end();
  }
})();
