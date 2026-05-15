const app = document.getElementById('app');
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

function init() {
    if (currentUser) {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    const template = document.getElementById('login-template');
    if (!template) {
        console.error('Login template not found');
        return;
    }
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                currentUser = data;
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('token', data.token);
                showDashboard();
            } else {
                document.getElementById('login-error').innerText = data.message;
            }
        } catch (err) {
            document.getElementById('login-error').innerText = 'Server error';
        }
    };
}

function showDashboard() {
    const template = document.getElementById('dashboard-template');
    if (!template) {
        console.error('Dashboard template not found');
        return;
    }
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    document.getElementById('display-name').innerText = currentUser.username;
    document.getElementById('display-role').innerText = currentUser.role.toUpperCase();

    // Role-based visibility
    if (currentUser.role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
    if (currentUser.role !== 'faculty' && currentUser.role !== 'admin') {
        document.querySelectorAll('.faculty-only').forEach(el => el.style.display = 'none');
    }

    document.getElementById('logout-btn').onclick = () => {
        localStorage.clear();
        currentUser = null;
        showLogin();
    };

    // Navigation
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            loadPage(page);
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        };
    });

    loadPage('home');
}

async function loadPage(page) {
    const content = document.getElementById('page-content');
    const title = document.getElementById('page-title');
    content.innerHTML = '<div style="text-align:center; padding: 2rem;">Loading...</div>';

    switch (page) {
        case 'home':
            title.innerText = 'Dashboard Overview';
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card"><h3>Total Students</h3><div class="value">0</div></div>
                    <div class="stat-card"><h3>Total Faculty</h3><div class="value">0</div></div>
                    <div class="stat-card"><h3>Active Courses</h3><div class="value">0</div></div>
                </div>
                <div class="table-container">
                    <div style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border);">
                        <h2 style="font-size: 1.1rem;">Recent Activities</h2>
                    </div>
                    <div id="recent-activities-list">
                        <div style="padding: 2rem; color: var(--text-muted); text-align: center;">Loading activities...</div>
                    </div>
                </div>
            `;
            updateStats();
            break;
        case 'students':
            title.innerText = 'Student Records';
            await loadStudents();
            break;
        case 'results':
            title.innerText = 'Academic Results';
            await loadResults();
            break;
        default:
            content.innerHTML = `<h2>${page.charAt(0).toUpperCase() + page.slice(1)}</h2><p>Coming soon...</p>`;
    }
}

async function updateStats() {
    try {
        const token = localStorage.getItem('token');
        const [students, faculty, courses] = await Promise.all([
            fetch('/api/students', { headers: { 'x-access-token': token } }).then(r => r.json()),
            fetch('/api/faculty', { headers: { 'x-access-token': token } }).then(r => r.json()),
            fetch('/api/courses', { headers: { 'x-access-token': token } }).then(r => r.json())
        ]);

        const cards = document.querySelectorAll('.stat-card .value');
        if (cards.length >= 3) {
            cards[0].innerText = Array.isArray(students) ? students.length : 0;
            cards[1].innerText = Array.isArray(faculty) ? faculty.length : 0;
            cards[2].innerText = Array.isArray(courses) ? courses.length : 0;
        }

        const activityList = document.getElementById('recent-activities-list');
        if (activityList && Array.isArray(students)) {
            const recent = students.slice(-5).reverse();
            if (recent.length > 0) {
                activityList.innerHTML = `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; background: rgba(255,255,255,0.03);">
                                <th style="padding: 1rem 1.5rem; font-size: 0.85rem; color: var(--text-muted);">Activity</th>
                                <th style="padding: 1rem 1.5rem; font-size: 0.85rem; color: var(--text-muted);">Details</th>
                                <th style="padding: 1rem 1.5rem; font-size: 0.85rem; color: var(--text-muted);">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recent.map(s => `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 1rem 1.5rem;">New Student Enrolled</td>
                                    <td style="padding: 1rem 1.5rem;">${s.first_name} ${s.last_name}</td>
                                    <td style="padding: 1rem 1.5rem;"><span style="color: var(--accent); background: rgba(16, 185, 129, 0.1); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem;">Completed</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                activityList.innerHTML = '<div style="padding: 2rem; color: var(--text-muted); text-align: center;">No recent activities to show.</div>';
            }
        }
    } catch (err) {
        console.error('Failed to update stats', err);
    }
}

async function loadStudents() {
    const content = document.getElementById('page-content');
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/students', { headers: { 'x-access-token': token } });
        const students = await res.json();

        let html = `
            <div style="margin-bottom: 1.5rem; display: flex; justify-content: flex-end;">
                <button class="btn btn-primary" style="width: auto; padding: 0.6rem 1.2rem;" onclick="showAddStudentModal()">+ Add Student</button>
            </div>
            <div id="modal-container"></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Array.isArray(students) ? students.map(s => `
                            <tr>
                                <td>#${s.student_id}</td>
                                <td>${s.first_name} ${s.last_name}</td>
                                <td>${s.email}</td>
                                <td>${s.phone || '-'}</td>
                                <td>
                                    <button class="action-btn btn-edit">Edit</button>
                                    <button class="action-btn btn-delete" onclick="deleteStudent(${s.student_id})">Delete</button>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No students found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        content.innerHTML = html;
    } catch (err) {
        content.innerHTML = '<p>Error loading students.</p>';
    }
}

window.showAddStudentModal = () => {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px);">
            <div class="login-card" style="max-width: 500px; width: 90%;">
                <h3 style="margin-bottom: 1.5rem;">Add New Student</h3>
                <form id="add-student-form">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group"><label>First Name</label><input type="text" name="first_name" required></div>
                        <div class="form-group"><label>Last Name</label><input type="text" name="last_name" required></div>
                    </div>
                    <div class="form-group"><label>Email</label><input type="email" name="email" required></div>
                    <div class="form-group"><label>Phone</label><input type="text" name="phone"></div>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button type="button" class="btn" style="background: rgba(255,255,255,0.1);" onclick="this.closest('div.login-card').parentElement.remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Student</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('add-student-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const token = localStorage.getItem('token');

        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            modalContainer.innerHTML = '';
            loadStudents();
        } else {
            alert('Error adding student');
        }
    };
};

window.deleteStudent = async (id) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/students/${id}`, { 
        method: 'DELETE',
        headers: { 'x-access-token': token }
    });
    loadStudents();
};

async function loadResults() {
    const content = document.getElementById('page-content');
    const token = localStorage.getItem('token');
    try {
        const isAdminOrFaculty = currentUser.role === 'admin' || currentUser.role === 'faculty';
        const endpoint = currentUser.role === 'student' ? `/api/marks/${currentUser.id}` : '/api/marks';
        const res = await fetch(endpoint, { headers: { 'x-access-token': token } });
        const data = await res.json();

        let html = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            ${isAdminOrFaculty ? '<th>Student</th>' : ''}
                            <th>Subject</th>
                            <th>Marks</th>
                            <th>Semester</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Array.isArray(data) && data.length > 0 ? data.map(m => `
                            <tr>
                                ${isAdminOrFaculty ? `<td>${m.first_name} ${m.last_name}</td>` : ''}
                                <td>${m.subject_name}</td>
                                <td>${m.marks}/100</td>
                                <td>Semester ${m.semester}</td>
                                <td><span class="action-btn" style="background: ${m.marks >= 40 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${m.marks >= 40 ? 'var(--accent)' : 'var(--danger)'}; padding: 0.2rem 0.6rem; border-radius: 4px;">${m.marks >= 40 ? 'Pass' : 'Fail'}</span></td>
                            </tr>
                        `).join('') : '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No results found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        content.innerHTML = html;
    } catch (err) {
        content.innerHTML = '<p>Error loading results.</p>';
    }
}

init();
