#!/usr/bin/env node

/**
 * Database Migration Script
 *
 * This script executes database migrations to Supabase.
 * It supports multiple methods:
 * 1. Direct SQL execution via Supabase REST API (recommended)
 * 2. Supabase CLI (if available and linked)
 * 3. Manual execution instructions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const MIGRATION_DIR = path.join(__dirname, '../supabase/migrations');
const SCHEMA_SQL = path.join(__dirname, '../supabase/schema.sql');
const ENV_LOCAL = path.join(__dirname, '../.env.local');

/**
 * Load environment variables from .env.local
 */
function loadEnvLocal() {
  const env = {};
  if (!fs.existsSync(ENV_LOCAL)) {
    return env;
  }

  const content = fs.readFileSync(ENV_LOCAL, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
  }

  return env;
}

/**
 * Extract project ref from Supabase URL
 */
function extractProjectRef(supabaseUrl) {
  if (!supabaseUrl) return null;
  // URL format: https://xxxxx.supabase.co
  const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

/**
 * Execute SQL via Supabase REST API
 */
async function executeViaAPI(sql, env) {
  return new Promise((resolve, reject) => {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      resolve(false);
      return;
    }

    const projectRef = extractProjectRef(supabaseUrl);
    if (!projectRef) {
      console.log('⚠️  Could not extract project ref from Supabase URL.\n');
      resolve(false);
      return;
    }

    console.log('🚀 Executing migrations via Supabase REST API...\n');

    const url = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`;
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=minimal',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
          console.log('✅ Migration executed successfully via API!\n');
          resolve(true);
        } else {
          console.log(`⚠️  API returned status ${res.statusCode}`);
          console.log('Response:', data, '\n');
          console.log('💡 Trying alternative method...\n');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('⚠️  API request failed:', error.message, '\n');
      console.log('💡 Trying alternative method...\n');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Execute SQL directly using psql via Supabase connection string
 */
async function executeViaPostgres(sql, env) {
  const dbUrl = env.DATABASE_URL || env.SUPABASE_DB_URL;

  if (!dbUrl) {
    return false;
  }

  console.log('🚀 Executing migrations via PostgreSQL client...\n');

  try {
    // Write SQL to temp file
    const tempFile = path.join(__dirname, '../.migration-temp.sql');
    fs.writeFileSync(tempFile, sql);

    // Execute using psql
    execSync(`psql "${dbUrl}" -f "${tempFile}"`, { stdio: 'inherit' });

    // Clean up
    fs.unlinkSync(tempFile);

    console.log('\n✅ Migration executed successfully via PostgreSQL!\n');
    return true;
  } catch (error) {
    console.log('⚠️  PostgreSQL execution failed:', error.message, '\n');
    return false;
  }
}

function checkSupabaseCLI() {
  // Check for local installation (via pnpm/npm)
  try {
    execSync('pnpm exec supabase --version', { stdio: 'ignore' });
    return 'local';
  } catch {
    // Check for global installation
    try {
      execSync('supabase --version', { stdio: 'ignore' });
      return 'global';
    } catch {
      return false;
    }
  }
}

function executeWithCLI(cliType, env) {
  const supabaseCmd = cliType === 'local' ? 'pnpm exec supabase' : 'supabase';
  console.log(`🚀 Using Supabase CLI (${cliType}) to execute migrations...\n`);

  try {
    // Check if project is linked
    let isLinked = false;
    try {
      execSync(`${supabaseCmd} status`, { stdio: 'ignore' });
      isLinked = true;
    } catch {
      // Try to auto-link using .env.local
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const projectRef = extractProjectRef(supabaseUrl);
        if (projectRef) {
          console.log(`🔗 Auto-linking to project: ${projectRef}...\n`);
          try {
            // Try to link using project ref from URL
            execSync(`${supabaseCmd} link --project-ref ${projectRef}`, {
              stdio: 'inherit',
            });
            isLinked = true;
            console.log('✅ Project linked successfully!\n');
          } catch {
            console.log('⚠️  Auto-link failed.\n');
            return false;
          }
        }
      }
    }

    if (isLinked) {
      // Try to push migrations
      console.log('📦 Pushing migrations to Supabase...');
      try {
        execSync(`${supabaseCmd} db push`, { stdio: 'inherit' });
        console.log('\n✅ Migrations executed successfully!\n');
        return true;
      } catch {
        console.log('\n⚠️  Migration push failed.\n');
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('\n❌ Error executing migrations with CLI:', error.message);
    return false;
  }
}

function showManualInstructions(env) {
  console.log('📝 Migration files found:\n');

  // List migration files
  const migrationFiles = fs
    .readdirSync(MIGRATION_DIR)
    .filter((file) => file.endsWith('.sql') && !file.startsWith('.'))
    .sort();

  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  console.log(`   ${migrationFiles.length + 1}. custom.sql\n`);

  if (fs.existsSync(SCHEMA_SQL)) {
    console.log('📄 Complete schema file: supabase/schema.sql\n');

    if (env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
      const projectRef = extractProjectRef(supabaseUrl);
      const dashboardUrl = projectRef
        ? `https://app.supabase.com/project/${projectRef}`
        : 'https://app.supabase.com';
      console.log('💡 To execute migrations manually:');
      console.log(`   1. Go to Supabase Dashboard: ${dashboardUrl}`);
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Copy and paste the contents of supabase/schema.sql');
      console.log('   4. Click "Run"\n');
    }
  }
}

async function main() {
  console.log('🔧 Database Migration Script\n');
  console.log('='.repeat(50) + '\n');

  // Check if migration files exist
  if (!fs.existsSync(MIGRATION_DIR)) {
    console.error('❌ Migration directory not found:', MIGRATION_DIR);
    process.exit(1);
  }

  // Load environment variables from .env.local
  const env = loadEnvLocal();

  // Read the latest migration or full schema
  let sql = '';
  const latestMigration = path.join(MIGRATION_DIR, '0002_sharp_oracle.sql');

  if (fs.existsSync(latestMigration)) {
    sql = fs.readFileSync(latestMigration, 'utf-8');
    console.log('📄 Found latest migration: 0002_sharp_oracle.sql\n');
  } else if (fs.existsSync(SCHEMA_SQL)) {
    sql = fs.readFileSync(SCHEMA_SQL, 'utf-8');
    console.log('📄 Using complete schema: schema.sql\n');
  } else {
    console.error('❌ No migration files found');
    process.exit(1);
  }

  // Method 1: Try PostgreSQL direct connection
  if (env.DATABASE_URL || env.SUPABASE_DB_URL) {
    if (await executeViaPostgres(sql, env)) {
      process.exit(0);
    }
  }

  // Method 2: Try Supabase CLI
  const cliType = checkSupabaseCLI();
  if (cliType) {
    if (executeWithCLI(cliType, env)) {
      process.exit(0);
    }
  }

  // Method 3: Show manual instructions
  console.log('ℹ️  Automatic migration failed. Please execute manually.\n');
  showManualInstructions(env);

  console.log('='.repeat(50));
  process.exit(0);
}

main();
