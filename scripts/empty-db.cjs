/**
 * Empty the database (drops every user collection).
 *
 * Usage:  npm run empty-db -- --yes
 *
 * The --yes flag is required as a safety guard — this is IRREVERSIBLE.
 * Reads MONGODB_URI from .env.local.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require(path.join(process.cwd(), 'node_modules', 'mongoose'));

if (!process.argv.includes('--yes')) {
    console.error('\nThis drops ALL collections in your database — IRREVERSIBLE.');
    console.error('Re-run with:  npm run empty-db -- --yes\n');
    process.exit(1);
}

const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    process.exit(1);
}

const env = {};
fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
});

const uri = env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

(async () => {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    const db = mongoose.connection.db;
    const dbName = db.databaseName;

    const collections = await db.listCollections().toArray();
    const names = collections
        .map(c => c.name)
        .filter(n => !n.startsWith('system.'))
        .filter(n => !n.startsWith('__'));

    if (names.length === 0) {
        console.log(`Database "${dbName}" is already empty.`);
    } else {
        console.log(`Emptying database "${dbName}" — dropping ${names.length} collection(s):`);
        names.forEach(n => console.log(`  - ${n}`));
        await Promise.all(names.map(n => db.collection(n).drop()));
        console.log('Done. All collections dropped.');
    }

    await mongoose.disconnect();
})().catch(e => {
    console.error('ERROR:', e.message);
    console.error('Hint: make sure the MongoDB cluster is running / reachable from this machine.');
    process.exit(1);
});
