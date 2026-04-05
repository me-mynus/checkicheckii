import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { Client } from 'https://deno.land/x/postgres@v0.19.3/mod.ts';

const createClient = () => {
  const databaseUrl = Deno.env.get('DATABASE_URL');
  console.log('DATABASE_URL exists:', !!databaseUrl);
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return new Client(databaseUrl);
};

serve(async (req: Request) => {
  console.log('Function called');
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check for authentication - Supabase sends the JWT in Authorization header
  const authHeader = req.headers.get('Authorization') || req.headers.get('apikey');
  if (!authHeader) {
    console.log('No auth header found');
    return new Response(
      JSON.stringify({ error: 'Missing authorization' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Auth header present, proceeding...');
  //     { status: 401, headers: corsHeaders }
  //   );
  // }

  try {
    console.log('Creating database client...');
    const client = createClient();
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');
    
    console.log('Running test query...');
    const result = await client.queryObject('SELECT 1 as test');
    console.log('Query result:', result.rows);
    
    await client.end();
    console.log('Connection closed');
    
    return new Response(
      JSON.stringify({ message: 'Database connection successful', data: result.rows }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Database error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
