/**
 * FoodEaze Orders Module
 * Manages Firestore order creation, tracking, and history.
 */

import { db } from './firebase-config.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

function generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}

async function createOrder(orderData) {
    try {
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        if (!user) {
            return {
                success: false,
                message: 'User not authenticated'
            };
        }

        const orderId = generateOrderId();
        const cart = getCart();

        if (cart.length === 0) {
            return {
                success: false,
                message: 'Cart is empty'
            };
        }

        const userData = await getCurrentUserData();
        const cartSummary = getCartSummary();
        const discount = getCartDiscount();
        const discountAmount = Math.round((cartSummary.subtotal * discount) / 100);
        const finalTotal = cartSummary.subtotal - discountAmount + cartSummary.taxes;

        const order = {
            orderId,
            userId: user.uid,
            userName: userData?.name || '',
            email: userData?.email || user.email,
            phone: userData?.phone || '',
            wardNumber: userData?.wardNumber || '',
            roomNumber: userData?.roomNumber || '',
            dietPreference: userData?.dietPreference || '',
            items: cart,
            subtotal: cartSummary.subtotal,
            discount,
            discountAmount,
            taxes: cartSummary.taxes,
            total: finalTotal,
            paymentMethod: orderData.paymentMethod || 'Card',
            paymentStatus: 'Pending',
            status: 'Pending',
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString(),
            updatedAt: serverTimestamp(),
            estimatedDeliveryTime: 45,
            notes: orderData.notes || ''
        };

        await setDoc(doc(db, 'orders', orderId), order);
        await clearCart();
        removeDiscount();

        return {
            success: true,
            message: 'Order placed successfully!',
            orderId,
            order
        };
    } catch (error) {
        console.error('Error creating order:', error);
        return {
            success: false,
            message: 'Error placing order: ' + error.message
        };
    }
}

async function getOrderById(orderId) {
    try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (!orderDoc.exists()) {
            return {
                success: false,
                message: 'Order not found'
            };
        }

        return {
            success: true,
            order: {
                id: orderDoc.id,
                ...orderDoc.data()
            }
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error fetching order: ' + error.message
        };
    }
}

async function getUserOrders(userId = null) {
    try {
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        const uid = userId || user?.uid;

        if (!uid) {
            return {
                success: false,
                message: 'User not authenticated',
                orders: []
            };
        }

        const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', uid),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(ordersQuery);
        const orders = snapshot.docs.map((orderDoc) => ({
            id: orderDoc.id,
            ...orderDoc.data()
        }));

        return {
            success: true,
            orders,
            count: orders.length
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return {
            success: false,
            message: 'Error fetching orders: ' + error.message,
            orders: []
        };
    }
}

async function getAllOrders() {
    try {
        const ordersQuery = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(ordersQuery);
        const orders = snapshot.docs.map((orderDoc) => ({
            id: orderDoc.id,
            ...orderDoc.data()
        }));

        return {
            success: true,
            orders,
            count: orders.length
        };
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return {
            success: false,
            message: 'Error fetching orders',
            orders: []
        };
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];

        if (!validStatuses.includes(newStatus)) {
            return {
                success: false,
                message: 'Invalid status'
            };
        }

        await updateDoc(doc(db, 'orders', orderId), {
            status: newStatus,
            updatedAt: serverTimestamp()
        });

        return {
            success: true,
            message: `Order status updated to ${newStatus}`
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error updating order: ' + error.message
        };
    }
}

async function getOrderStatistics(userId = null) {
    try {
        const constraints = [];
        if (userId) constraints.push(where('userId', '==', userId));

        const snapshot = await getDocs(query(collection(db, 'orders'), ...constraints));
        const orders = snapshot.docs.map((orderDoc) => orderDoc.data());

        const stats = {
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'Pending').length,
            preparingOrders: orders.filter(o => o.status === 'Preparing').length,
            readyOrders: orders.filter(o => o.status === 'Ready').length,
            deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
            totalAmount: orders.reduce((sum, o) => sum + (o.total || 0), 0),
            averageOrderValue: 0
        };

        if (stats.totalOrders > 0) {
            stats.averageOrderValue = Math.round(stats.totalAmount / stats.totalOrders);
        }

        return {
            success: true,
            statistics: stats
        };
    } catch (error) {
        console.error('Error getting statistics:', error);
        return {
            success: false,
            message: 'Error getting statistics',
            statistics: {}
        };
    }
}

async function getOrdersByStatus(status) {
    try {
        const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return {
                success: false,
                message: 'Invalid status',
                orders: []
            };
        }

        const ordersQuery = query(
            collection(db, 'orders'),
            where('status', '==', status),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(ordersQuery);
        const orders = snapshot.docs.map((orderDoc) => ({
            id: orderDoc.id,
            ...orderDoc.data()
        }));

        return {
            success: true,
            orders,
            count: orders.length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error fetching orders',
            orders: []
        };
    }
}

async function cancelOrder(orderId, reason = '') {
    try {
        const result = await getOrderById(orderId);
        if (!result.success) return result;

        const order = result.order;
        if (!['Pending', 'Preparing'].includes(order.status)) {
            return {
                success: false,
                message: `Cannot cancel ${order.status} orders`
            };
        }

        await updateDoc(doc(db, 'orders', orderId), {
            status: 'Cancelled',
            cancellationReason: reason,
            updatedAt: serverTimestamp()
        });

        return {
            success: true,
            message: 'Order cancelled successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error cancelling order: ' + error.message
        };
    }
}

async function getOrderTimeline(orderId) {
    try {
        const result = await getOrderById(orderId);
        if (!result.success) return result;

        const order = result.order;
        const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];
        const timeline = statuses.map((status) => ({
            status,
            completed: statuses.indexOf(status) <= statuses.indexOf(order.status),
            active: status === order.status,
            timestamp: order.timestamp
        }));

        return {
            success: true,
            timeline,
            currentStatus: order.status
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error getting timeline: ' + error.message
        };
    }
}

async function getRecentOrders(maxOrders = 5) {
    try {
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        if (!user) {
            return {
                success: false,
                message: 'User not authenticated',
                orders: []
            };
        }

        const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(maxOrders)
        );
        const snapshot = await getDocs(ordersQuery);
        const orders = snapshot.docs.map((orderDoc) => ({
            id: orderDoc.id,
            ...orderDoc.data()
        }));

        return {
            success: true,
            orders
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error fetching recent orders',
            orders: []
        };
    }
}

function formatOrderDate(timestamp) {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getOrderStatusColor(status) {
    const colors = {
        'Pending': '#ffc107',
        'Preparing': '#17a2b8',
        'Ready': '#28a745',
        'Delivered': '#28a745',
        'Cancelled': '#dc3545'
    };

    return colors[status] || '#6c757d';
}

function getOrderStatusBadgeClass(status) {
    const classes = {
        'Pending': 'status-pending',
        'Preparing': 'status-preparing',
        'Ready': 'status-ready',
        'Delivered': 'status-delivered',
        'Cancelled': 'status-cancelled'
    };

    return classes[status] || 'status-pending';
}

Object.assign(window, {
    generateOrderId,
    createOrder,
    getOrderById,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    getOrderStatistics,
    getOrdersByStatus,
    cancelOrder,
    getOrderTimeline,
    getRecentOrders,
    formatOrderDate,
    getOrderStatusColor,
    getOrderStatusBadgeClass
});

export {
    createOrder,
    getOrderById,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    getOrderStatistics,
    getOrdersByStatus,
    cancelOrder,
    getOrderTimeline,
    getRecentOrders
};
