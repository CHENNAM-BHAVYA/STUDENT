-- Database Initialization
CREATE DATABASE IF NOT EXISTS student_management_system;
USE student_management_system;

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    course_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    fees DECIMAL(10,2)
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    dob DATE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    course_id INTEGER,
    FOREIGN KEY(course_id) REFERENCES courses(course_id)
);

-- Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    faculty_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    faculty_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    student_id INTEGER,
    attendance_date DATE,
    status VARCHAR(20), -- 'Present', 'Absent'
    FOREIGN KEY(student_id) REFERENCES students(student_id)
);

-- Marks Table
CREATE TABLE IF NOT EXISTS marks (
    mark_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    student_id INTEGER,
    subject_name VARCHAR(100) NOT NULL,
    marks INTEGER,
    semester INTEGER,
    FOREIGN KEY(student_id) REFERENCES students(student_id)
);

-- Users Table (Login & Roles)
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL -- 'admin', 'faculty', 'student'
);
