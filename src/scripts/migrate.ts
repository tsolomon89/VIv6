/**
 * Migration CLI
 *
 * Usage:
 *   npm run migrate          # Run all pending migrations
 *   npm run migrate:status   # Show migration status
 */

import 'dotenv/config';
import { initDb } from '../core/db.js';
import { runMigrations, getMigrationStatus } from '../core/migrations/runner.js';

const command = process.argv[2];

async function main(): Promise<void> {
    // Initialize database (creates tables from schema.sql if needed)
    initDb();

    switch (command) {
        case 'status': {
            const status = getMigrationStatus();
            console.log('\n📋 Migration Status:');
            console.log('─'.repeat(60));

            if (status.length === 0) {
                console.log('  No migrations applied yet.');
            } else {
                for (const m of status) {
                    console.log(`  ✓ ${m.name}`);
                    console.log(`    Applied: ${m.applied_at}`);
                }
            }
            console.log('');
            break;
        }

        case 'run':
        case undefined: {
            console.log('\n🔄 Running migrations...');
            console.log('─'.repeat(60));

            const result = await runMigrations();

            if (result.applied.length === 0 && result.skipped.length === 0) {
                console.log('  No migrations found.');
            } else {
                if (result.skipped.length > 0) {
                    console.log(`  Skipped: ${result.skipped.length} (already applied)`);
                }

                if (result.applied.length > 0) {
                    console.log(`\n  ✨ Applied ${result.applied.length} migration(s):`);
                    result.applied.forEach(m => console.log(`     ✓ ${m}`));
                } else {
                    console.log('  ✓ All migrations already applied.');
                }
            }
            console.log('');
            break;
        }

        default:
            console.log(`
Usage: npx tsx src/scripts/migrate.ts [command]

Commands:
  run       Run all pending migrations (default)
  status    Show migration status
`);
            process.exit(1);
    }
}

main().catch(err => {
    console.error('\n❌ Migration error:', err.message);
    process.exit(1);
});
