const db = require('./db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    db.serialize(() => {
        // Insert Courses
        const courses = [
            ['Computer Science', '4 Years', 50000],
            ['Information Technology', '4 Years', 45000],
            ['Data Science', '2 Years', 60000]
        ];

        const courseStmt = db.prepare(`INSERT OR IGNORE INTO courses (course_name, duration, fees) VALUES (?, ?, ?)`);
        courses.forEach(course => courseStmt.run(course));
        courseStmt.finalize();

        // Insert Faculty
        const faculty = [
            ['Dr. Alan Smith', 'Computer Science', 'alan.smith@university.edu', '1234567890'],
            ['Prof. Jane Johnson', 'Information Technology', 'jane.johnson@university.edu', '2345678901'],
            ['Dr. Michael Lee', 'Data Science', 'michael.lee@university.edu', '3456789012']
        ];

        const facultyStmt = db.prepare(`INSERT OR IGNORE INTO faculty (faculty_name, department, email, phone) VALUES (?, ?, ?, ?)`);
        faculty.forEach(f => facultyStmt.run(f));
        facultyStmt.finalize();

        // Insert Students
        const students = [
            ['Alice', 'Williams', 'Female', '2002-05-15', 'alice@example.com', '9876543210', '123 Street, City', 1],
            ['Bob', 'Brown', 'Male', '2001-08-20', 'bob@example.com', '8765432109', '456 Avenue, Town', 2],
            ['Charlie', 'Davis', 'Male', '2003-03-10', 'charlie@example.com', '7654321098', '789 Road, Village', 3],
            ['Diana', 'Evans', 'Female', '2002-11-22', 'diana@example.com', '6543210987', '321 Lane, Metro', 1],
            ['Ethan', 'Foster', 'Male', '2001-01-30', 'ethan@example.com', '5432109876', '654 Way, Suburb', 2],
            ['Fiona', 'Garcia', 'Female', '2002-07-05', 'fiona@example.com', '4321098765', '987 Blvd, Coast', 3],
            ['George', 'Harris', 'Male', '2003-09-12', 'george@example.com', '3210987654', '147 Drive, Hills', 1],
            ['Hannah', 'Irvine', 'Female', '2002-04-18', 'hannah@example.com', '2109876543', '258 Circle, Plains', 2]
        ];

        const studentStmt = db.prepare(`INSERT OR IGNORE INTO students (first_name, last_name, gender, dob, email, phone, address, course_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        students.forEach(s => studentStmt.run(s));
        studentStmt.finalize();

        // Insert Attendance
        const attendance = [
            [1, '2026-05-14', 'Present'],
            [2, '2026-05-14', 'Present'],
            [3, '2026-05-14', 'Absent'],
            [1, '2026-05-15', 'Present'],
            [4, '2026-05-15', 'Present'],
            [5, '2026-05-15', 'Present']
        ];

        const attStmt = db.prepare(`INSERT INTO attendance (student_id, attendance_date, status) VALUES (?, ?, ?)`);
        attendance.forEach(a => attStmt.run(a));
        attStmt.finalize();

        // Insert Marks
        const marks = [
            [1, 'Mathematics', 85, 1],
            [1, 'Physics', 78, 1],
            [2, 'Computer Science', 92, 1],
            [3, 'Algorithms', 45, 1],
            [4, 'Database Systems', 88, 2]
        ];

        const marksStmt = db.prepare(`INSERT INTO marks (student_id, subject_name, marks, semester) VALUES (?, ?, ?, ?)`);
        marks.forEach(m => marksStmt.run(m));
        marksStmt.finalize();

        console.log('Sample data seeded successfully.');
    });
};

seedData();
