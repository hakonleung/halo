#!/usr/bin/env node

/**
 * Auto Migration Script
 *
 * Automatically executes database migrations using direct PostgreSQL connection
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  const env = {};

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
  });

  return env;
}

async function executeWithPostgres(connectionString, sql) {
  // Use postgres package
  const { default: postgres } = await import('postgres');

  const pg = postgres(connectionString, {
    max: 1,
    ssl: 'require',
  });

  try {
    console.log('📦 Executing migration...\n');

    // Execute the SQL
    await pg.unsafe(sql);

    console.log('✅ Migration completed successfully!\n');
    console.log('💡 You can now use the background settings feature.\n');

    await pg.end();
    return true;
  } catch (error) {
    await pg.end();
    throw error;
  }
}

async function main() {
  console.log('🚀 Auto Migration Script\n');
  console.log('='.repeat(50) + '\n');

  // Load env
  const env = loadEnv();

  // Read migration SQL
  const migrationPath = path.join(__dirname, '../supabase/migrations/0002_sharp_oracle.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  console.log('📄 Found migration: 0002_sharp_oracle.sql\n');

  // Try different connection methods

  // Method 1: Direct DATABASE_URL
  if (env.DATABASE_URL) {
    console.log('🔗 Using DATABASE_URL...\n');
    try {
      await executeWithPostgres(env.DATABASE_URL, sql);
      console.log('='.repeat(50));
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed:', error.message, '\n');
    }
  }

  // Method 2: Construct from Supabase URL
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = env.SUPABASE_DB_PASSWORD || env.DATABASE_PASSWORD;

  if (supabaseUrl && dbPassword) {
    // Extract project ref from URL
    const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      const projectRef = match[1];
      const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

      console.log('🔗 Using constructed connection string...\n');
      try {
        await executeWithPostgres(connectionString, sql);
        console.log('='.repeat(50));
        process.exit(0);
      } catch (error) {
        console.error('❌ Failed:', error.message, '\n');
      }
    }
  }

  // Failed - show manual instructions
  console.log('⚠️  Cannot execute migration automatically.\n');
  console.log('Please add one of the following to .env.local:\n');
  console.log('Option 1 - Direct database URL:');
  console.log('   DATABASE_URL=postgresql://postgres:[password]@...\n');
  console.log('Option 2 - Database password:');
  console.log('   SUPABASE_DB_PASSWORD=your_db_password\n');
  console.log('💡 Or execute manually:');
  console.log('   1. Run: pnpm run db:copy');
  console.log('   2. Go to Supabase Dashboard → SQL Editor');
  console.log('   3. Paste and run the SQL\n');
  console.log('='.repeat(50));
  process.exit(1);
}

main();
