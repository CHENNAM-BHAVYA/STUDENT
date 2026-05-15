const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'sms.db');
const db = new sqlite3.Database(dbPath);

const schemaContent = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
// Filter out MySQL-specific commands and convert syntax for SQLite
const schema = schemaContent.split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => {
        const cleanStmt = stmt.replace(/--.*$/gm, '').trim().toUpperCase();
        return cleanStmt.length > 0 && !cleanStmt.startsWith('CREATE DATABASE') && !cleanStmt.startsWith('USE ');
    })
    .map(stmt => stmt.replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT'))
    .join(';');

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database:', err.message);
        } else {
            console.log('Database initialized successfully.');
            // Add a default admin if not exists
            const bcrypt = require('bcryptjs');
            const hashedPassword = bcrypt.hashSync('admin123', 8);
            db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`, 
                ['admin', hashedPassword, 'admin'], 
                function(err) {
                    if (err) console.error('Error creating default admin:', err.message);
                }
            );
        }
    });
});

module.exports = db;
