-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    enrollment_date DATE DEFAULT (DATE('now')),
    status TEXT DEFAULT 'Active'
);

-- Users Table (for Authentication)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'faculty', 'student')) DEFAULT 'student',
    reference_id INTEGER -- Maps to student_id or faculty_id
);

-- Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    designation TEXT
);

-- Marks Table
CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    marks_obtained INTEGER NOT NULL,
    total_marks INTEGER DEFAULT 100,
    semester INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
