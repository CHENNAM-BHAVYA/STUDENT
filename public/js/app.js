// State Management
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
const app = document.getElementById('app');

// Initialize
function init() {
    setTimeout(() => {
        if (currentUser) {
            showDashboard();
        } else {
            showLogin();
        }
    }, 500); // Small delay for aesthetic loader
}

// Show Login Page
function showLogin() {
    const template = document.getElementById('login-template');
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    const form = document.getElementById('login-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        const errorEl = document.getElementById('login-error');
        
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
                errorEl.innerText = data.message || 'Login failed';
            }
        } catch (err) {
            errorEl.innerText = 'Server connection failed';
        }
    };
}

// Show Dashboard
function showDashboard() {
    const template = document.getElementById('dashboard-template');
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    document.getElementById('user-name').innerText = currentUser.username;
    document.getElementById('user-role').innerText = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

    // Logout
    document.getElementById('logout-btn').onclick = () => {
        localStorage.clear();
        currentUser = null;
        showLogin();
    };

    // Navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            loadPage(page);
        };
    });

    loadPage('home');
}

// Load Page Content
async function loadPage(page) {
    const content = document.getElementById('page-content');
    const title = document.getElementById('page-title');
    const token = localStorage.getItem('token');

    content.innerHTML = '<div class="loader-wrapper" style="position:static; background:transparent;"><div class="loader"></div></div>';

    switch (page) {
        case 'home':
            title.innerText = 'Overview';
            await renderOverview(content, token);
            break;
        case 'students':
            title.innerText = 'Student Records';
            await renderStudents(content, token);
            break;
        default:
            content.innerHTML = `<div style="text-align:center; padding: 50px;">
                <i class="fas fa-tools" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 20px;"></i>
                <h2>${page.charAt(0).toUpperCase() + page.slice(1)} Module</h2>
                <p style="color: #64748b;">This feature is under development.</p>
            </div>`;
    }
}

async function renderOverview(container, token) {
    try {
        const res = await fetch('/api/stats', { headers: { 'x-access-token': token } });
        const stats = await res.json();
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon stat-blue"><i class="fas fa-user-graduate"></i></div>
                    <div class="stat-info"><h3>Students</h3><div class="value">${stats.students || 0}</div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon stat-purple"><i class="fas fa-chalkboard-teacher"></i></div>
                    <div class="stat-info"><h3>Faculty</h3><div class="value">${stats.faculty || 0}</div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon stat-green"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-info"><h3>Assessments</h3><div class="value">${stats.marks || 0}</div></div>
                </div>
            </div>
            <div class="table-container">
                <div style="padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: 1.1rem; font-weight: 600;">System Health</h2>
                    <span class="status-pill status-active">Online</span>
                </div>
                <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                    Welcome to the EduPulse management portal. Select a module from the sidebar to begin.
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p>Error loading dashboard data.</p>';
    }
}

async function renderStudents(container, token) {
    try {
        const res = await fetch('/api/students', { headers: { 'x-access-token': token } });
        const students = await res.json();
        
        container.innerHTML = `
            <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                <p style="color: var(--text-muted)">Manage and view all enrolled students.</p>
                <button class="btn btn-primary" onclick="alert('Feature coming soon!')"><i class="fas fa-plus"></i> Add Student</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Date Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.length > 0 ? students.map(s => `
                            <tr>
                                <td style="font-weight: 500;">${s.first_name} ${s.last_name}</td>
                                <td>${s.email}</td>
                                <td><span class="status-pill status-active">${s.status}</span></td>
                                <td>${s.enrollment_date}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align:center; padding: 40px; color: var(--text-muted);">No records found</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p>Error loading student records.</p>';
    }
}

init();
