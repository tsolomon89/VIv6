import { db } from '../src/core/db.js';

try {
    console.log("Migrating dimension_values...");
    db.prepare("ALTER TABLE dimension_values RENAME COLUMN data TO metadata").run();
    console.log("Success: Renamed data to metadata.");
} catch (e: any) {
    if (e.message.includes("no such column")) {
        console.log("Column 'data' not found, checking if 'metadata' exists...");
        try {
             db.prepare("SELECT metadata FROM dimension_values LIMIT 1").get();
             console.log("Column 'metadata' already exists.");
        } catch (e2) {
             console.error("Migration failed:", e2);
        }
    } else {
        console.error("Migration error:", e);
    }
}
