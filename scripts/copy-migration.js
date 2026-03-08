#!/usr/bin/env node

/**
 * Copy Migration SQL to Clipboard
 *
 * This script copies the migration SQL to your clipboard
 * so you can easily paste it into Supabase Dashboard
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const latestMigration = path.join(__dirname, '../supabase/migrations/0002_sharp_oracle.sql');

if (!fs.existsSync(latestMigration)) {
  console.error('❌ Migration file not found:', latestMigration);
  process.exit(1);
}

const sql = fs.readFileSync(latestMigration, 'utf-8');

console.log('📋 Migration SQL:\n');
console.log('='.repeat(50));
console.log(sql);
console.log('='.repeat(50));
console.log('\n✅ SQL ready to copy!\n');
console.log('💡 Next steps:');
console.log(
  '   1. Copy the SQL above (or run: pbcopy < supabase/migrations/0002_sharp_oracle.sql)',
);
console.log('   2. Go to: https://app.supabase.com/project/xdfetilfsbluedyqtrza/sql');
console.log('   3. Paste and click "Run"\n');

// Try to copy to clipboard on macOS
try {
  execSync('pbcopy', { input: sql, stdio: ['pipe', 'ignore', 'ignore'] });
  console.log('✨ SQL copied to clipboard!\n');
} catch {
  // Not on macOS or pbcopy not available
}
