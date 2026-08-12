import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const adminLoginForm = document.getElementById('adminLoginForm');
const adminMessage = document.getElementById('adminMessage');
const logoutLink = document.getElementById('logoutLink');
const showMenuFormBtn = document.getElementById('showMenuFormBtn');
const menuForm = document.getElementById('menuForm');
const cancelMenuFormBtn = document.getElementById('cancelMenuFormBtn');
const printReportBtn = document.getElementById('printReportBtn');
const reportType = document.getElementById('reportType');

const collections = {
    admins: 'admins',
    users: 'users',
    orders: 'orders',
    foodMenu: 'foodMenu',
    notifications: 'notifications'
};

const DEFAULT_ADMIN_EMAIL = 'admin@foodeaze.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin@1234';

let dashboardOrders = [];
let dashboardMenuItems = [];
let dashboardPatients = [];

function showMessage(type, text) {
    if (!adminMessage) return;
    adminMessage.className = `message ${type}`;
    adminMessage.textContent = text;
    adminMessage.style.display = 'block';
}

function getCurrentPageName() {
    return window.location.pathname.split('/').pop();
}

function setAdminSession(adminDoc) {
    localStorage.setItem('foodEazeAdminSession', JSON.stringify(adminDoc));
}

function clearAdminSession() {
    localStorage.removeItem('foodEazeAdminSession');
}

async function ensureDefaultAdmin() {
    try {
        const snapshot = await getDocs(collection(db, collections.admins));
        if (!snapshot.empty) return null;

        const credential = await createUserWithEmailAndPassword(auth, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
        const adminId = DEFAULT_ADMIN_EMAIL.toLowerCase();

        await setDoc(doc(db, collections.admins, adminId), {
            adminName: 'System Administrator',
            email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
            role: 'Super Admin',
            createdAt: serverTimestamp(),
            uid: credential.user.uid
        });

        await signOut(auth);
        return { email: DEFAULT_ADMIN_EMAIL.toLowerCase(), password: DEFAULT_ADMIN_PASSWORD };
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            return null;
        }
        console.error(error);
        return null;
    }
}

async function getVerifiedAdminProfile(user) {
    if (!user?.email) return null;

    const normalizedEmail = user.email.toLowerCase();
    const adminQuery = query(collection(db, collections.admins), where('email', '==', normalizedEmail));
    const snapshot = await getDocs(adminQuery);

    if (snapshot.empty) {
        return null;
    }

    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();

    return {
        id: adminDoc.id,
        uid: user.uid,
        email: adminData.email || normalizedEmail,
        name: adminData.adminName || adminData.name || 'Admin',
        role: adminData.role || 'Admin',
        createdAt: adminData.createdAt || null
    };
}

async function ensureAdminAccess() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        clearAdminSession();
        return null;
    }

    const adminProfile = await getVerifiedAdminProfile(currentUser);
    if (!adminProfile) {
        await signOut(auth);
        clearAdminSession();
        return null;
    }

    setAdminSession(adminProfile);
    return adminProfile;
}

async function loginAdmin(email, password) {
    try {
        await ensureDefaultAdmin();
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        const adminProfile = await getVerifiedAdminProfile(user);

        if (!adminProfile) {
            await signOut(auth);
            clearAdminSession();
            return {
                success: false,
                message: 'Access Denied. You are not an authorized administrator.'
            };
        }

        setAdminSession(adminProfile);
        return { success: true, admin: adminProfile };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message || 'Admin login failed.'
        };
    }
}

async function logoutAdmin() {
    try {
        await signOut(auth);
        clearAdminSession();
        window.location.replace('admin-login.html');
    } catch (error) {
        console.error(error);
    }
}

function getStatusBadge(status) {
    return `<span class="badge ${String(status || 'pending').toLowerCase()}">${status || 'Pending'}</span>`;
}

function formatDate(value) {
    if (!value) return 'N/A';
    if (typeof value.toDate === 'function') return value.toDate().toLocaleString();
    if (typeof value === 'string') return new Date(value).toLocaleString();
    return new Date(value).toLocaleString();
}

async function createNotification(title, message, type = 'info') {
    try {
        await addDoc(collection(db, collections.notifications), {
            title,
            message,
            type,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Notification error', error);
    }
}

async function loadDashboard() {
    const statsContainer = document.getElementById('statsGrid');
    const latestOrdersContainer = document.getElementById('latestOrdersContainer');
    const notificationsContainer = document.getElementById('notificationsContainer');
    const adminWelcomeCard = document.getElementById('adminWelcomeCard');

    const admin = await ensureAdminAccess();
    if (!admin) return;

    if (adminWelcomeCard) {
        adminWelcomeCard.innerHTML = `<strong>${admin.name || 'Administrator'}</strong><br><span>${admin.role || 'Admin'}</span>`;
    }

    const [patientsSnap, ordersSnap, menuSnap, notificationsSnap] = await Promise.all([
        getDocs(collection(db, collections.users)),
        getDocs(query(collection(db, collections.orders), orderBy('timestamp', 'desc'))),
        getDocs(collection(db, collections.foodMenu)),
        getDocs(query(collection(db, collections.notifications), orderBy('createdAt', 'desc')))
    ]);

    dashboardPatients = patientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    dashboardOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    dashboardMenuItems = menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const notifications = notificationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const patients = dashboardPatients;
    const orders = dashboardOrders;
    const menuItems = dashboardMenuItems;

    const stats = {
        patients: patients.length,
        todayOrders: orders.filter(order => {
            const created = order.createdAt || order.timestamp;
            if (!created) return false;
            const d = typeof created.toDate === 'function' ? created.toDate() : new Date(created);
            return d.toDateString() === new Date().toDateString();
        }).length,
        pending: orders.filter(order => order.status === 'Pending').length,
        preparing: orders.filter(order => order.status === 'Preparing').length,
        ready: orders.filter(order => order.status === 'Ready').length,
        delivered: orders.filter(order => order.status === 'Delivered').length,
        cancelled: orders.filter(order => order.status === 'Cancelled').length,
        revenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
    };

    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card"><div class="value">${stats.patients}</div><div class="label">Total Registered Patients</div></div>
            <div class="stat-card"><div class="value">${stats.todayOrders}</div><div class="label">Today's Orders</div></div>
            <div class="stat-card"><div class="value">${stats.pending}</div><div class="label">Pending Orders</div></div>
            <div class="stat-card"><div class="value">${stats.preparing}</div><div class="label">Preparing Orders</div></div>
            <div class="stat-card"><div class="value">${stats.ready}</div><div class="label">Ready Orders</div></div>
            <div class="stat-card"><div class="value">${stats.delivered}</div><div class="label">Delivered Orders</div></div>
            <div class="stat-card"><div class="value">${stats.cancelled}</div><div class="label">Cancelled Orders</div></div>
            <div class="stat-card"><div class="value">₹${stats.revenue}</div><div class="label">Total Revenue</div></div>
        `;
    }

    if (latestOrdersContainer) {
        if (!orders.length) {
            latestOrdersContainer.innerHTML = '<div class="empty-state">No orders yet.</div>';
        } else {
            latestOrdersContainer.innerHTML = `
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Order ID</th><th>Patient</th><th>Status</th><th>Total</th></tr></thead>
                        <tbody>
                            ${orders.slice(0, 6).map(order => `
                                <tr>
                                    <td>${order.orderId || order.id}</td>
                                    <td>${order.userName || 'Patient'}</td>
                                    <td>${getStatusBadge(order.status)}</td>
                                    <td>₹${order.total || 0}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    if (notificationsContainer) {
        if (!notifications.length) {
            notificationsContainer.innerHTML = '<div class="empty-state">No notifications yet.</div>';
        } else {
            notificationsContainer.innerHTML = notifications.slice(0, 6).map(item => `
                <div class="card" style="margin-bottom:8px; padding:12px;">
                    <strong>${item.title || 'Notification'}</strong>
                    <div>${item.message || ''}</div>
                    <small>${formatDate(item.createdAt)}</small>
                </div>
            `).join('');
        }
    }

    await renderPatients(patients);
    await renderOrders(orders);
    await renderMenu(menuItems);
    await renderAnalytics(orders, menuItems);
    await renderWards(orders);
    await renderReports(orders);
    await renderSettings(admin);
}

async function renderPatients(patients) {
    const container = document.getElementById('patientsContainer');
    const searchInput = document.getElementById('patientSearch');

    const render = () => {
        const query = (searchInput?.value || '').toLowerCase();
        const filtered = patients.filter(patient => [patient.name, patient.email, patient.wardNumber, patient.roomNumber].join(' ').toLowerCase().includes(query));
        if (!filtered.length) {
            container.innerHTML = '<div class="empty-state">No patients found.</div>';
            return;
        }
        container.innerHTML = `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Ward</th><th>Room</th><th>Diet</th><th>Registered</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${filtered.map(patient => `
                            <tr>
                                <td>${patient.name || '-'}</td>
                                <td>${patient.email || '-'}</td>
                                <td>${patient.phone || '-'}</td>
                                <td>${patient.wardNumber || '-'}</td>
                                <td>${patient.roomNumber || '-'}</td>
                                <td>${patient.dietPreference || '-'}</td>
                                <td>${formatDate(patient.createdAt)}</td>
                                <td class="inline-actions">
                                    <button class="btn btn-secondary" data-action="view" data-id="${patient.id}">View</button>
                                    <button class="btn btn-primary" data-action="edit" data-id="${patient.id}">Edit</button>
                                    <button class="btn btn-accent" data-action="delete" data-id="${patient.id}">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', async () => {
                const patientId = button.getAttribute('data-id');
                const patientDoc = await getDoc(doc(db, collections.users, patientId));
                const patient = patientDoc.data();
                if (!patient) return;
                if (button.getAttribute('data-action') === 'delete') {
                    if (confirm(`Delete patient ${patient.name || patient.email}?`)) {
                        await deleteDoc(doc(db, collections.users, patientId));
                        await loadDashboard();
                    }
                } else if (button.getAttribute('data-action') === 'edit') {
                    const diet = prompt('Update diet preference', patient.dietPreference || 'Normal Diet');
                    if (diet) {
                        await updateDoc(doc(db, collections.users, patientId), { dietPreference: diet, updatedAt: serverTimestamp() });
                        await loadDashboard();
                    }
                } else {
                    alert(`Patient: ${patient.name || '-'}\nEmail: ${patient.email || '-'}\nPhone: ${patient.phone || '-'}\nWard: ${patient.wardNumber || '-'}\nRoom: ${patient.roomNumber || '-'}`);
                }
            });
        });
    };

    render();
    searchInput?.addEventListener('input', render);
}

async function renderOrders(orders) {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    if (!orders.length) {
        container.innerHTML = '<div class="empty-state">No orders available.</div>';
        return;
    }

    container.innerHTML = `
        <div class="table-wrap">
            <table>
                <thead><tr><th>Order ID</th><th>Patient</th><th>Ward</th><th>Room</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>${order.orderId || order.id}</td>
                            <td>${order.userName || 'Patient'}</td>
                            <td>${order.wardNumber || '-'}</td>
                            <td>${order.roomNumber || '-'}</td>
                            <td>${(order.items || []).map(item => `${item.name} x${item.quantity}`).join(', ')}</td>
                            <td>₹${order.total || 0}</td>
                            <td>${formatDate(order.createdAt || order.timestamp)}</td>
                            <td>
                                <select data-order-id="${order.id}" class="status-select">
                                    ${['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (event) => {
            const orderId = event.target.getAttribute('data-order-id');
            await updateOrderStatus(orderId, event.target.value);
            await loadDashboard();
        });
    });
}

async function renderMenu(menuItems) {
    const container = document.getElementById('menuContainer');
    if (!container) return;

    if (!menuItems.length) {
        container.innerHTML = '<div class="empty-state">No menu items yet.</div>';
        return;
    }

    container.innerHTML = `
        <div class="table-wrap">
            <table>
                <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr></thead>
                <tbody>
                    ${menuItems.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.category}</td>
                            <td>₹${item.price}</td>
                            <td>${item.available === false ? 'Disabled' : 'Available'}</td>
                            <td class="inline-actions">
                                <button class="btn btn-secondary" data-action="edit" data-id="${item.id}">Edit</button>
                                <button class="btn btn-primary" data-action="toggle" data-id="${item.id}">${item.available === false ? 'Enable' : 'Disable'}</button>
                                <button class="btn btn-accent" data-action="delete" data-id="${item.id}">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.getAttribute('data-id');
            const action = button.getAttribute('data-action');
            if (action === 'delete') {
                await deleteDoc(doc(db, collections.foodMenu, id));
            } else if (action === 'toggle') {
                const itemDoc = await getDoc(doc(db, collections.foodMenu, id));
                const current = itemDoc.data();
                await updateDoc(doc(db, collections.foodMenu, id), { available: !(current.available === true) });
            } else if (action === 'edit') {
                const itemDoc = await getDoc(doc(db, collections.foodMenu, id));
                const item = itemDoc.data();
                document.getElementById('menuItemId').value = id;
                document.getElementById('foodName').value = item.name || '';
                document.getElementById('foodCategory').value = item.category || '';
                document.getElementById('foodPrice').value = item.price || '';
                document.getElementById('foodImage').value = item.imageUrl || '';
                document.getElementById('foodDescription').value = item.description || '';
                document.getElementById('foodAvailability').value = item.available === false ? 'false' : 'true';
                menuForm.style.display = 'block';
            }
            await loadDashboard();
        });
    });
}

async function renderAnalytics(orders, menuItems) {
    const container = document.getElementById('analyticsContainer');
    if (!container) return;

    const statusCounts = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map(status => ({
        label: status,
        count: orders.filter(order => order.status === status).length
    }));

    const foodCounts = menuItems.reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + 1;
        return acc;
    }, {});

    const maxCount = Math.max(1, ...statusCounts.map(item => item.count));

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="value">${orders.length}</div><div class="label">Total Orders</div></div>
            <div class="stat-card"><div class="value">${menuItems.length}</div><div class="label">Available Menus</div></div>
            <div class="stat-card"><div class="value">₹${orders.reduce((sum, order) => sum + Number(order.total || 0), 0)}</div><div class="label">Revenue</div></div>
        </div>
        <div class="panel-grid">
            <div class="card">
                <h4>Orders by Status</h4>
                <div style="display:grid; gap:10px; margin-top:10px;">
                    ${statusCounts.map(item => `
                        <div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.95rem;">
                                <span>${item.label}</span><strong>${item.count}</strong>
                            </div>
                            <div style="height:8px; background:#e5e7eb; border-radius:999px; overflow:hidden;">
                                <div style="height:100%; width:${(item.count / maxCount) * 100}%; background:#003366; border-radius:999px;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="card">
                <h4>Most Ordered Food</h4>
                <div class="pill-list">
                    ${Object.entries(foodCounts).slice(0, 6).map(([name, count]) => `<span>${name}: ${count}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

async function renderWards(orders) {
    const container = document.getElementById('wardsContainer');
    if (!container) return;

    const grouped = orders.reduce((acc, order) => {
        const ward = order.wardNumber || 'Unassigned';
        if (!acc[ward]) acc[ward] = [];
        acc[ward].push(order);
        return acc;
    }, {});

    if (!Object.keys(grouped).length) {
        container.innerHTML = '<div class="empty-state">No ward data yet.</div>';
        return;
    }

    container.innerHTML = Object.entries(grouped).map(([ward, items]) => `
        <div class="card" style="margin-bottom:10px;">
            <h4>${ward}</h4>
            <div class="pill-list">
                ${items.map(order => `<span>${order.roomNumber || 'Room N/A'} · ${order.userName || 'Patient'}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

async function renderReports(orders) {
    const container = document.getElementById('reportsContainer');
    if (!container) return;

    const type = reportType?.value || 'daily';
    const filtered = (orders || []).filter(order => {
        const created = order.createdAt || order.timestamp;
        if (!created) return false;
        const date = typeof created.toDate === 'function' ? created.toDate() : new Date(created);
        const now = new Date();
        if (type === 'daily') return date.toDateString() === now.toDateString();
        if (type === 'weekly') {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo;
        }
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return date >= monthAgo;
    });

    container.innerHTML = `
        <div class="table-wrap">
            <table>
                <thead><tr><th>Order ID</th><th>Patient</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
                <tbody>
                    ${filtered.length ? filtered.map(order => `
                        <tr>
                            <td>${order.orderId || order.id}</td>
                            <td>${order.userName || 'Patient'}</td>
                            <td>${getStatusBadge(order.status)}</td>
                            <td>₹${order.total || 0}</td>
                            <td>${formatDate(order.createdAt || order.timestamp)}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="5" class="empty-state">No records found.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

async function renderSettings(admin) {
    const container = document.getElementById('settingsContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="card" style="margin-bottom:10px;">
            <h4>Admin Profile</h4>
            <p><strong>Name:</strong> ${admin.name || 'Admin'}</p>
            <p><strong>Email:</strong> ${admin.email || '-'}</p>
            <p><strong>Role:</strong> ${admin.role || 'Admin'}</p>
        </div>
        <div class="card">
            <h4>Change Password</h4>
            <input type="password" id="newAdminPassword" placeholder="New password">
            <button class="btn btn-primary" id="changePasswordBtn">Update Password</button>
        </div>
    `;

    document.getElementById('changePasswordBtn')?.addEventListener('click', async () => {
        const newPassword = document.getElementById('newAdminPassword').value;
        if (!newPassword) return;
        try {
            const user = auth.currentUser;
            if (!user) {
                alert('No signed-in admin found.');
                return;
            }
            await updatePassword(user, newPassword);
            alert('Password updated.');
        } catch (error) {
            alert(error.message);
        }
    });
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await updateDoc(doc(db, collections.orders, orderId), {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        await createNotification('Order Status Updated', `Order ${orderId} moved to ${newStatus}.`, 'info');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

async function handleMenuSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('menuItemId').value;
    const payload = {
        name: document.getElementById('foodName').value,
        category: document.getElementById('foodCategory').value,
        price: Number(document.getElementById('foodPrice').value),
        imageUrl: document.getElementById('foodImage').value,
        description: document.getElementById('foodDescription').value,
        available: document.getElementById('foodAvailability').value === 'true',
        createdAt: serverTimestamp()
    };

    if (id) {
        await updateDoc(doc(db, collections.foodMenu, id), payload);
        await createNotification('Menu Updated', `${payload.name} was updated.`, 'info');
    } else {
        await addDoc(collection(db, collections.foodMenu), payload);
        await createNotification('Menu Added', `${payload.name} was added to the menu.`, 'info');
    }

    menuForm.style.display = 'none';
    menuForm.reset();
    document.getElementById('menuItemId').value = '';
    await loadDashboard();
}

function setupSidebarNavigation() {
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(link => {
        link.addEventListener('click', (event) => {
            const hash = link.getAttribute('href');
            if (hash === '#logout') {
                event.preventDefault();
                logoutAdmin();
                return;
            }
            if (!hash || hash.startsWith('#')) {
                event.preventDefault();
                document.querySelectorAll('main section').forEach(section => {
                    section.style.display = 'none';
                });
                const target = document.querySelector(hash);
                if (target) {
                    target.style.display = 'block';
                }
                links.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

function initializeAdminAuthFlow() {
    const currentPage = getCurrentPageName();

    if (currentPage === 'admin-login.html') {
        onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            const adminProfile = await getVerifiedAdminProfile(user);
            if (adminProfile) {
                setAdminSession(adminProfile);
                window.location.replace('admin-dashboard.html');
            }
        });

        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = document.getElementById('adminEmail').value.trim();
                const password = document.getElementById('adminPassword').value;
                const btn = document.getElementById('adminLoginBtn');

                if (!email || !password) {
                    showMessage('error', 'Please enter both email and password.');
                    return;
                }

                btn.disabled = true;
                btn.textContent = 'Authenticating...';
                showMessage('loading', 'Authenticating admin credentials...');

                const result = await loginAdmin(email, password);

                btn.disabled = false;
                btn.textContent = 'Login to Admin Panel';

                if (result.success) {
                    showMessage('success', 'Admin access verified. Redirecting...');
                    window.location.replace('admin-dashboard.html');
                } else {
                    showMessage('error', result.message || 'Invalid admin credentials.');
                }
            });
        }
    }

    if (currentPage === 'admin-dashboard.html') {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                clearAdminSession();
                window.location.replace('admin-login.html');
                return;
            }

            const adminProfile = await getVerifiedAdminProfile(user);
            if (!adminProfile) {
                await signOut(auth);
                clearAdminSession();
                window.location.replace('admin-login.html');
                return;
            }

            setAdminSession(adminProfile);
            setupSidebarNavigation();
            showMenuFormBtn?.addEventListener('click', () => {
                menuForm.style.display = 'block';
            });
            cancelMenuFormBtn?.addEventListener('click', () => {
                menuForm.style.display = 'none';
                menuForm.reset();
                document.getElementById('menuItemId').value = '';
            });
            menuForm?.addEventListener('submit', handleMenuSubmit);
            printReportBtn?.addEventListener('click', () => window.print());
            reportType?.addEventListener('change', () => renderReports(dashboardOrders));
            await loadDashboard();
        });
    }
}

initializeAdminAuthFlow();

window.logoutAdmin = logoutAdmin;
window.updateOrderStatus = updateOrderStatus;
