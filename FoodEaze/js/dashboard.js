/**
 * FoodEaze Dashboard Module
 * Handles dashboard UI rendering and interactions
 */

const emptyDashboardStatistics = {
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    deliveredOrders: 0,
    totalAmount: 0
};

function isUserDashboardPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    return currentPage === 'dashboard.html' && Boolean(document.getElementById('statsContainer'));
}

// ==================== Dashboard Initialization ====================

/**
 * Initialize dashboard
 */
async function initializeDashboard() {
    try {
        const user = typeof getAuthenticatedUser === 'function'
            ? await getAuthenticatedUser()
            : (typeof getCurrentUser === 'function' ? getCurrentUser() : null);

        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const userData = typeof getCurrentUserData === 'function' ? await getCurrentUserData() : null;

        if (userData) {
            renderDashboardHeader(userData);
        } else {
            renderDashboardUnavailableHeader();
        }

        await loadDashboardStatistics(user.uid);
        await loadRecentOrders(user.uid);
        setupDashboardEventListeners();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showNotification('Error loading dashboard', 'danger');
        renderEmptyDashboardState();
    }
}

function renderEmptyDashboardState() {
    renderDashboardUnavailableHeader();
    renderDashboardCards(emptyDashboardStatistics);
    renderRecentOrdersTable([]);
}

function renderDashboardUnavailableHeader() {
    const header = document.querySelector('.content-header');

    if (header) {
        header.innerHTML = `
            <div>
                <h1 class="user-welcome">Welcome!</h1>
                <p class="user-details-mini">User data will appear after login</p>
            </div>
            <button class="btn btn-secondary" onclick="openUserMenu()">Profile Settings</button>
        `;
    }
}

/**
 * Render dashboard header with user info
 * @param {object} userData - User data object
 */
function renderDashboardHeader(userData) {
    const header = document.querySelector('.content-header');

    if (header) {
        header.innerHTML = `
            <div>
                <h1 class="user-welcome">Welcome, ${userData.name}!</h1>
                <p class="user-details-mini">Ward: ${userData.wardNumber} | Room: ${userData.roomNumber}</p>
            </div>
            <button class="btn btn-secondary" onclick="openUserMenu()">Profile Settings</button>
        `;
    }
}

/**
 * Load dashboard statistics
 * @param {string} userId - User ID
 */
async function loadDashboardStatistics(userId) {
    try {
        if (typeof getOrderStatistics !== 'function') {
            renderDashboardCards(emptyDashboardStatistics);
            return;
        }

        const result = await getOrderStatistics(userId);

        if (result.success) {
            renderDashboardCards(result.statistics);
        } else {
            renderDashboardCards(emptyDashboardStatistics);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        renderDashboardCards(emptyDashboardStatistics);
    }
}

/**
 * Render dashboard statistics cards
 * @param {object} stats - Statistics object
 */
function renderDashboardCards(stats) {
    const container = document.querySelector('.dashboard-grid');

    if (container) {
        container.innerHTML = `
            <div class="stat-card primary">
                <div class="stat-icon"><img src="../images/orders.png" alt="" style="width: 115px; height: 115px; object-fit: contain; display: block; margin: 0 auto 12px auto;"></div>
                <div class="stat-label">Total Orders</div>
                <div class="stat-value">${stats.totalOrders}</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon"><img src="../images/pending.png" alt="" style="width: 115px; height: 115px; object-fit: contain; display: block; margin: 0 auto 12px auto;"></div>
                <div class="stat-label">Pending Orders</div>
                <div class="stat-value">${stats.pendingOrders}</div>
            </div>
            <div class="stat-card info">
                <div class="stat-icon"><img src="../images/preparing.png" alt="" style="width: 115px; height: 115px; object-fit: contain; display: block; margin: 0 auto 12px auto;"></div>
                <div class="stat-label">Preparing</div>
                <div class="stat-value">${stats.preparingOrders}</div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon"><img src="../images/delivered.png" alt="" style="width: 115px; height: 115px; object-fit: contain; display: block; margin: 0 auto 12px auto;"></div>
                <div class="stat-label">Delivered Orders</div>
                <div class="stat-value">${stats.deliveredOrders}</div>
            </div>
        `;
    }
}

/**
 * Load recent orders for dashboard
 * @param {string} userId - User ID
 */
async function loadRecentOrders(userId) {
    try {
        if (typeof getUserOrders !== 'function') {
            renderRecentOrdersTable([]);
            return;
        }

        const result = await getUserOrders(userId);

        if (result.success && result.orders.length > 0) {
            renderRecentOrdersTable(result.orders.slice(0, 5));
        } else {
            renderRecentOrdersTable([]);
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        renderRecentOrdersTable([]);
    }
}

/**
 * Render recent orders table
 * @param {array} orders - Orders array
 */
function renderRecentOrdersTable(orders) {
    const container = document.querySelector('.orders-table tbody');

    if (container) {
        if (!orders.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center p-lg">
                        No orders available<br>
                        <span style="color: #6c757d;">Your Firestore order history will appear here.</span>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <tr>
                <td class="order-id">${order.orderId}</td>
                <td>${order.items.map(item => item.name).join(', ')}</td>
                <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td>₹${order.total}</td>
                <td><span class="order-status ${getDashboardOrderStatusBadgeClass(order.status)}">${order.status}</span></td>
                <td><a href="order-status.html?id=${order.orderId}" class="btn btn-small btn-primary">View</a></td>
            </tr>
        `).join('');
    }
}

function getDashboardOrderStatusBadgeClass(status) {
    if (typeof getOrderStatusBadgeClass === 'function') {
        return getOrderStatusBadgeClass(status);
    }

    const classes = {
        'Pending': 'status-pending',
        'Preparing': 'status-preparing',
        'Ready': 'status-ready',
        'Delivered': 'status-delivered',
        'Cancelled': 'status-cancelled'
    };

    return classes[status] || 'status-pending';
}

/**
 * Setup dashboard event listeners
 */
function setupDashboardEventListeners() {
    // Quick action buttons
    const browseMenuBtn = document.querySelector('[onclick*="menu.html"]');
    if (browseMenuBtn) {
        browseMenuBtn.onclick = () => window.location.href = 'menu.html';
    }

    const trackOrdersBtn = document.querySelector('[onclick*="order-status.html"]');
    if (trackOrdersBtn) {
        trackOrdersBtn.onclick = () => window.location.href = 'order-status.html';
    }

    const orderHistoryBtn = document.querySelector('[onclick*="order-history.html"]');
    if (orderHistoryBtn) {
        orderHistoryBtn.onclick = () => window.location.href = 'order-history.html';
    }

    const profileBtn = document.querySelector('[onclick*="profile.html"]');
    if (profileBtn) {
        profileBtn.onclick = () => window.location.href = 'profile.html';
    }
}

/**
 * Open user profile menu
 */
function openUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
}

/**
 * Setup sidebar navigation
 */
function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');

    sidebarLinks.forEach(link => {
        // Remove active class from all links
        document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));

        // Add active class to current page
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }

        // Add click event listener
        link.addEventListener('click', function (e) {
            document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * Setup responsive sidebar toggle
 */
function setupSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// ==================== Notification Functions ====================

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, danger, warning, info)
 * @param {number} duration - Display duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    const container = document.querySelector('.container-fluid') || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    if (duration > 0) {
        setTimeout(() => {
            alertDiv.remove();
        }, duration);
    }
}

// ==================== Loading States ====================

/**
 * Show loading spinner
 * @param {string} containerId - Container element ID
 * @param {string} message - Loading message
 */
function showLoadingSpinner(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);

    if (container) {
        container.innerHTML = `
            <div class="flex-center p-lg">
                <div class="spinner spinner-lg"></div>
                <p class="ml-md">${message}</p>
            </div>
        `;
    }
}

/**
 * Hide loading spinner
 * @param {string} containerId - Container element ID
 */
function hideLoadingSpinner(containerId) {
    const container = document.getElementById(containerId);

    if (container) {
        container.innerHTML = '';
    }
}

// ==================== Modal Functions ====================

/**
 * Open modal
 * @param {string} modalId - Modal element ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close modal
 * @param {string} modalId - Modal element ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

/**
 * Setup modal close buttons
 */
function setupModalCloseButtons() {
    const modals = document.querySelectorAll('.modal');

    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modal.id);
            });
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// ==================== Form Validation ====================

/**
 * Validate form fields
 * @param {object} formData - Form data object
 * @param {array} rules - Validation rules array
 */
function validateForm(formData, rules) {
    const errors = {};

    rules.forEach(rule => {
        const value = formData[rule.field];

        if (rule.required && (!value || value.trim() === '')) {
            errors[rule.field] = `${rule.label} is required`;
        } else if (rule.type === 'email' && value) {
            if (!validateEmail(value)) {
                errors[rule.field] = 'Please enter a valid email address';
            }
        } else if (rule.type === 'phone' && value) {
            if (!validatePhoneNumber(value)) {
                errors[rule.field] = 'Please enter a valid 10-digit phone number';
            }
        } else if (rule.minLength && value && value.length < rule.minLength) {
            errors[rule.field] = `${rule.label} must be at least ${rule.minLength} characters`;
        } else if (rule.maxLength && value && value.length > rule.maxLength) {
            errors[rule.field] = `${rule.label} must not exceed ${rule.maxLength} characters`;
        } else if (rule.pattern && value && !rule.pattern.test(value)) {
            errors[rule.field] = `${rule.label} format is invalid`;
        }
    });

    return {
        valid: Object.keys(errors).length === 0,
        errors: errors
    };
}

/**
 * Display form validation errors
 * @param {object} errors - Errors object
 */
function displayFormErrors(errors) {
    // Clear existing error messages
    document.querySelectorAll('.form-error').forEach(el => el.remove());

    // Display new errors
    Object.keys(errors).forEach(field => {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
            input.classList.add('is-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error text-danger';
            errorDiv.textContent = errors[field];
            input.parentElement.insertBefore(errorDiv, input.nextSibling);
        }
    });
}

/**
 * Clear form errors
 */
function clearFormErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

// ==================== Utility Functions ====================

/**
 * Format currency
 * @param {number} amount - Amount to format
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format date
 * @param {Date|string} date - Date to format
 */
function formatDate(date) {
    if (!date) return 'N/A';

    const dateObj = date instanceof Date ? date : new Date(date);

    return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format time
 * @param {Date|string} date - Date to format
 */
function formatTime(date) {
    if (!date) return 'N/A';

    const dateObj = date instanceof Date ? date : new Date(date);

    return dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Get time ago string
 * @param {Date|string} date - Date to compare
 */
function getTimeAgo(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const seconds = Math.floor((new Date() - dateObj) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

/**
 * Logout user from dashboard
 */
async function logoutFromDashboard() {
    const result = typeof logoutUser === 'function'
        ? await logoutUser()
        : { success: false, message: 'Logout is unavailable' };

    if (result.success) {
        showNotification(result.message, 'success', 2000);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } else {
        showNotification(result.message, 'danger');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (isUserDashboardPage()) {
        initializeDashboard();
    }

    setupSidebarNavigation();
    setupSidebarToggle();
    setupModalCloseButtons();
});
