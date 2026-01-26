#!/usr/bin/env node

/**
 * Database Migration Script
 *
 * This script executes database migrations to Supabase.
 * It reads the migration files and executes them via Supabase CLI or direct SQL execution.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
            console.log('⚠️  Auto-link failed. You may need to authenticate first.\n');
            console.log('💡 To link manually, run:');
            console.log(`   ${supabaseCmd} link --project-ref ${projectRef}\n`);
            console.log('   Or execute migrations manually via Supabase Dashboard.\n');
            return false;
          }
        } else {
          console.log('⚠️  Could not extract project ref from Supabase URL.\n');
          console.log('💡 To link manually, run:');
          console.log(`   ${supabaseCmd} link --project-ref your-project-ref\n`);
          console.log('   Or execute migrations manually via Supabase Dashboard.\n');
          return false;
        }
      } else {
        console.log('⚠️  Project not linked and no Supabase URL found in .env.local.\n');
        console.log('💡 To link manually, run:');
        console.log(`   ${supabaseCmd} link --project-ref your-project-ref\n`);
        console.log('   Or execute migrations manually via Supabase Dashboard.\n');
        return false;
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
        console.log('\n⚠️  Migration push failed. This might be due to version mismatch.\n');
        console.log('💡 Options:');
        console.log('   1. Execute SQL directly via Supabase Dashboard (see below)');
        console.log('   2. Repair migration history:');
        console.log(`      ${supabaseCmd} migration repair --status reverted 00001`);
        console.log('   3. Pull remote migrations:');
        console.log(`      ${supabaseCmd} db pull\n`);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('\n❌ Error executing migrations with CLI:', error.message);
    return false;
  }
}

function executeWithSQL(env) {
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
      console.log('💡 To execute migrations:');
      console.log(`   1. Go to Supabase Dashboard: ${dashboardUrl}`);
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Copy and paste the contents of:');
      console.log('      - supabase/schema.sql (recommended, includes everything)');
      console.log('      OR');
      console.log('      - supabase/migrations/0000_public_marvel_boy.sql');
      console.log('      - supabase/custom.sql');
      console.log('   4. Click "Run"\n');
    } else {
      console.log('💡 To execute migrations manually:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Copy and paste the contents of:');
      console.log('      - supabase/schema.sql (recommended, includes everything)');
      console.log('      OR');
      console.log('      - supabase/migrations/0000_public_marvel_boy.sql');
      console.log('      - supabase/custom.sql');
      console.log('   3. Click "Run"\n');
    }
  }

  return false;
}

function main() {
  console.log('🔧 Database Migration Script\n');
  console.log('='.repeat(50) + '\n');

  // Check if migration files exist
  if (!fs.existsSync(MIGRATION_DIR)) {
    console.error('❌ Migration directory not found:', MIGRATION_DIR);
    process.exit(1);
  }

  // Load environment variables from .env.local
  const env = loadEnvLocal();
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('✅ Found Supabase configuration in .env.local\n');
  } else {
    console.log('ℹ️  No Supabase URL found in .env.local\n');
  }

  // Try to use Supabase CLI first
  const cliType = checkSupabaseCLI();
  if (cliType) {
    if (executeWithCLI(cliType, env)) {
      process.exit(0);
    }
  } else {
    console.log('ℹ️  Supabase CLI not found.\n');
    console.log('💡 Install Supabase CLI:');
    console.log('   pnpm add -D supabase (already done)');
    console.log('   Or: npm install -g supabase\n');
  }

  // Fallback to manual instructions
  executeWithSQL(env);

  console.log('='.repeat(50));
  process.exit(0);
}

main();
