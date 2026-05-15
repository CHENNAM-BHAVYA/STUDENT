const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'sms.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database:', err.message);
        } else {
            console.log('Database initialized successfully.');
            seedAdmin();
        }
    });
});

function seedAdmin() {
    const bcrypt = require('bcryptjs');
    const adminPass = bcrypt.hashSync('admin123', 10);
    
    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`, 
        ['admin', adminPass, 'admin'], 
        (err) => {
            if (err) console.error('Seed error:', err.message);
        }
    );
}

module.exports = db;
