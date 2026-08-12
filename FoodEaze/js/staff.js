/**
 * FoodEaze Staff Module
 * Handles staff dashboard and order management
 */

// ==================== Staff Dashboard ====================

/**
 * Initialize staff dashboard
 */
async function initializeStaffDashboard() {
    try {
        const user = getCurrentUser();

        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Check if user is staff (you may need to add a staff role check)
        await loadStaffDashboardData();
        setupStaffEventListeners();
    } catch (error) {
        console.error('Error initializing staff dashboard:', error);
        showNotification('Error loading staff dashboard', 'danger');
    }
}

/**
 * Load staff dashboard data
 */
async function loadStaffDashboardData() {
    try {
        showLoadingSpinner('dashboardContent', 'Loading dashboard data...');

        // Load statistics
        const statsResult = await getOrderStatistics();
        if (statsResult.success) {
            renderStaffStatistics(statsResult.statistics);
        }

        // Load all orders
        const ordersResult = await getAllOrders();
        if (ordersResult.success) {
            renderStaffOrdersTable(ordersResult.orders);
        }

        hideLoadingSpinner('dashboardContent');
    } catch (error) {
        console.error('Error loading staff dashboard data:', error);
        hideLoadingSpinner('dashboardContent');
    }
}

/**
 * Render staff dashboard statistics
 * @param {object} stats - Statistics object
 */
function renderStaffStatistics(stats) {
    const container = document.querySelector('.dashboard-grid');

    if (container) {
        container.innerHTML = `
            <div class="stat-card primary">
                <div class="stat-icon"><img src="../images/orders.transparent.png" alt="" style="width: 70px; height: 70px; object-fit: contain; display: block; margin: 0 auto;"></div>
                <div class="stat-label">Total Orders</div>
                <div class="stat-value">${stats.totalOrders}</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon"><img src="../images/pending.transparent.png" alt="" style="width: 70px; height: 70px; object-fit: contain; display: block; margin: 0 auto;"></div>
                <div class="stat-label">Pending Orders</div>
                <div class="stat-value">${stats.pendingOrders}</div>
            </div>
            <div class="stat-card info">
                <div class="stat-icon"><img src="../images/preparing.transparent.png" alt="" style="width: 70px; height: 70px; object-fit: contain; display: block; margin: 0 auto;"></div>
                <div class="stat-label">Preparing</div>
                <div class="stat-value">${stats.preparingOrders}</div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon"><img src="../images/delivered.transparent.png" alt="" style="width: 70px; height: 70px; object-fit: contain; display: block; margin: 0 auto;"></div>
                <div class="stat-label">Ready</div>
                <div class="stat-value">${stats.readyOrders}</div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon"><img src="../images/delivered.transparent.png" alt="" style="width: 70px; height: 70px; object-fit: contain; display: block; margin: 0 auto;"></div>
                <div class="stat-label">Delivered</div>
                <div class="stat-value">${stats.deliveredOrders}</div>
            </div>
        `;
    }
}

/**
 * Render staff orders table
 * @param {array} orders - Orders array
 */
function renderStaffOrdersTable(orders) {
    const container = document.querySelector('.orders-table tbody');

    if (container) {
        if (orders.length === 0) {
            container.innerHTML = '<tr><td colspan="10" class="text-center p-lg">No orders found</td></tr>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <tr>
                <td class="order-id">${order.orderId}</td>
                <td>${order.userName}</td>
                <td>${order.wardNumber}</td>
                <td>${order.roomNumber}</td>
                <td>${order.phone}</td>
                <td>${order.items.map(item => item.name).join(', ')}</td>
                <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td>${formatOrderDate(order.timestamp)}</td>
                <td>
                    <select class="status-select" value="${order.status}" 
                        onchange="updateOrderStatusStaff('${order.orderId}', this.value)">
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </td>
                <td>
                    <a href="#" class="btn btn-small btn-primary" onclick="viewOrderDetails('${order.orderId}')">View</a>
                </td>
            </tr>
        `).join('');
    }
}

/**
 * Update order status from staff panel
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 */
async function updateOrderStatusStaff(orderId, status) {
    try {
        const result = await updateOrderStatus(orderId, status);

        if (result.success) {
            showNotification(result.message, 'success');
            // Reload dashboard
            await loadStaffDashboardData();
        } else {
            showNotification(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status', 'danger');
    }
}

/**
 * View order details in modal
 * @param {string} orderId - Order ID
 */
async function viewOrderDetails(orderId) {
    try {
        const result = await getOrderById(orderId);

        if (result.success) {
            displayOrderDetailsModal(result.order);
        } else {
            showNotification(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error viewing order details:', error);
        showNotification('Error loading order details', 'danger');
    }
}

/**
 * Display order details in modal
 * @param {object} order - Order object
 */
function displayOrderDetailsModal(order) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${item.total}</td>
        </tr>
    `).join('');

    const modalContent = `
        <div class="modal" id="orderDetailsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Order Details - ${order.orderId}</h2>
                    <button type="button" class="modal-close" onclick="closeModal('orderDetailsModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="order-details-card">
                        <h3>Patient Information</h3>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Name:</span>
                            <span class="order-detail-value">${order.userName}</span>
                        </div>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Contact:</span>
                            <span class="order-detail-value">${order.phone}</span>
                        </div>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Ward:</span>
                            <span class="order-detail-value">${order.wardNumber}</span>
                        </div>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Room:</span>
                            <span class="order-detail-value">${order.roomNumber}</span>
                        </div>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Diet Preference:</span>
                            <span class="order-detail-value">${order.dietPreference}</span>
                        </div>
                    </div>

                    <div class="order-details-card">
                        <h3>Order Items</h3>
                        <table class="orders-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>

                    <div class="order-details-card">
                        <h3>Order Summary</h3>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Subtotal:</span>
                            <span class="order-detail-value">₹${order.subtotal}</span>
                        </div>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Discount:</span>
                            <span class="order-detail-value">-₹${order.discountAmount || 0}</span>
                        </div>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Taxes:</span>
                            <span class="order-detail-value">₹${order.taxes}</span>
                        </div>
                        <div class="order-detail-row">
                            <span class="order-detail-label"><strong>Total:</strong></span>
                            <span class="order-detail-value"><strong>₹${order.total}</strong></span>
                        </div>
                    </div>

                    <div class="order-details-card">
                        <h3>Status & Details</h3>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Status:</span>
                            <span class="order-status ${getOrderStatusBadgeClass(order.status)}">${order.status}</span>
                        </div>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Order Time:</span>
                            <span class="order-detail-value">${formatOrderDate(order.timestamp)}</span>
                        </div>
                        <div class="order-detail-row">
                            <span class="order-detail-label">Payment Method:</span>
                            <span class="order-detail-value">${order.paymentMethod}</span>
                        </div>
                        ${order.notes ? `
                        <div class="order-detail-row">
                            <span class="order-detail-label">Notes:</span>
                            <span class="order-detail-value">${order.notes}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('orderDetailsModal')">Close</button>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Insert new modal
    document.body.insertAdjacentHTML('beforeend', modalContent);
    openModal('orderDetailsModal');
    setupModalCloseButtons();
}

/**
 * Setup staff event listeners
 */
function setupStaffEventListeners() {
    // Filter orders by status
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', async (e) => {
            const status = e.target.value;
            await filterOrdersByStatus(status);
        });
    }

    // Search orders
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterOrdersTable(query);
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadStaffDashboardData();
        });
    }

    setupSidebarNavigation();
    setupModalCloseButtons();
}

/**
 * Filter orders by status
 * @param {string} status - Order status
 */
async function filterOrdersByStatus(status) {
    try {
        if (status === 'all') {
            const result = await getAllOrders();
            renderStaffOrdersTable(result.orders);
        } else {
            const result = await getOrdersByStatus(status);
            renderStaffOrdersTable(result.orders);
        }
    } catch (error) {
        console.error('Error filtering orders:', error);
        showNotification('Error filtering orders', 'danger');
    }
}

/**
 * Filter orders table by search query
 * @param {string} query - Search query
 */
function filterOrdersTable(query) {
    const table = document.querySelector('.orders-table tbody');
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

/**
 * Export orders to CSV
 */
async function exportOrdersToCSV() {
    try {
        const result = await getAllOrders();

        if (!result.success) {
            showNotification('Error exporting orders', 'danger');
            return;
        }

        let csv = 'Order ID,Patient Name,Ward,Room,Contact,Items,Quantity,Order Date,Status,Total\n';

        result.orders.forEach(order => {
            csv += `"${order.orderId}","${order.userName}","${order.wardNumber}","${order.roomNumber}","${order.phone}","${order.items.map(i => i.name).join(';')}","${order.items.reduce((sum, i) => sum + i.quantity, 0)}","${formatOrderDate(order.timestamp)}","${order.status}","${order.total}"\n`;
        });

        downloadCSV(csv, 'foodeaze-orders.csv');
        showNotification('Orders exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting orders:', error);
        showNotification('Error exporting orders', 'danger');
    }
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - Filename
 */
function downloadCSV(csvContent, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Print orders report
 */
async function printOrdersReport() {
    try {
        const result = await getAllOrders();

        if (!result.success) {
            showNotification('Error generating report', 'danger');
            return;
        }

        const printWindow = window.open('', '', 'width=900,height=600');
        let reportHTML = `
            <html>
            <head>
                <title>FoodEaze - Orders Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #003366; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    h1 { color: #003366; }
                    .summary { margin-bottom: 20px; }
                    .summary div { margin: 5px 0; }
                </style>
            </head>
            <body>
                <h1>FoodEaze - Orders Report</h1>
                <div class="summary">
                    <div><strong>Total Orders:</strong> ${result.orders.length}</div>
                    <div><strong>Date Generated:</strong> ${new Date().toLocaleString('en-IN')}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Patient</th>
                            <th>Ward</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        result.orders.forEach(order => {
            reportHTML += `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.userName}</td>
                    <td>${order.wardNumber}</td>
                    <td>${order.items.map(i => i.name).join(', ')}</td>
                    <td>₹${order.total}</td>
                    <td>${order.status}</td>
                    <td>${formatOrderDate(order.timestamp)}</td>
                </tr>
            `;
        });

        reportHTML += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(reportHTML);
        printWindow.document.close();
        printWindow.print();
    } catch (error) {
        console.error('Error printing report:', error);
        showNotification('Error generating report', 'danger');
    }
}

/**
 * Get staff dashboard analytics
 */
async function getStaffAnalytics() {
    try {
        const result = await getAllOrders();

        if (!result.success) {
            return null;
        }

        const analytics = {
            totalOrders: result.orders.length,
            totalRevenue: result.orders.reduce((sum, order) => sum + order.total, 0),
            averageOrderValue: 0,
            ordersPerStatus: {
                pending: 0,
                preparing: 0,
                ready: 0,
                delivered: 0
            },
            topItems: {},
            todayOrders: 0,
            todayRevenue: 0
        };

        const today = new Date().toDateString();

        result.orders.forEach(order => {
            // Count by status
            const status = order.status.toLowerCase();
            if (analytics.ordersPerStatus.hasOwnProperty(status)) {
                analytics.ordersPerStatus[status]++;
            }

            // Count today's orders
            const orderDate = new Date(order.timestamp.toDate ? order.timestamp.toDate() : order.timestamp).toDateString();
            if (orderDate === today) {
                analytics.todayOrders++;
                analytics.todayRevenue += order.total;
            }

            // Count top items
            order.items.forEach(item => {
                analytics.topItems[item.name] = (analytics.topItems[item.name] || 0) + item.quantity;
            });
        });

        if (analytics.totalOrders > 0) {
            analytics.averageOrderValue = Math.round(analytics.totalRevenue / analytics.totalOrders);
        }

        return analytics;
    } catch (error) {
        console.error('Error getting analytics:', error);
        return null;
    }
}
