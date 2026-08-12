/**
 * FoodEaze Cart Module
 * Maintains a local render cache and syncs authenticated carts to Firestore.
 */

import { db } from './firebase-config.js';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

function initializeCart() {
    const cart = localStorage.getItem('cart');
    if (!cart) {
        localStorage.setItem('cart', JSON.stringify([]));
        return [];
    }
    return JSON.parse(cart);
}

function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cartItems) {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

function getCartCollectionRef(userId) {
    return collection(db, 'users', userId, 'cart');
}

async function syncCartItemToFirestore(item) {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user) return;

    await setDoc(doc(db, 'users', user.uid, 'cart', item.id), {
        ...item,
        updatedAt: serverTimestamp()
    });
}

async function deleteCartItemFromFirestore(itemId) {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user) return;

    await deleteDoc(doc(db, 'users', user.uid, 'cart', itemId));
}

async function loadUserCartFromFirestore() {
    const user = typeof getAuthenticatedUser === 'function'
        ? await getAuthenticatedUser()
        : (typeof getCurrentUser === 'function' ? getCurrentUser() : null);

    if (!user) {
        saveCart([]);
        return [];
    }

    const snapshot = await getDocs(getCartCollectionRef(user.uid));
    const cart = snapshot.docs.map((cartDoc) => cartDoc.data());
    saveCart(cart);
    return cart;
}

async function addToCart(itemId, quantity = 1) {
    const item = getMenuItemById(itemId);
    if (!item) {
        return {
            success: false,
            message: 'Item not found'
        };
    }

    if (quantity <= 0) {
        return {
            success: false,
            message: 'Please select a quantity before adding to cart'
        };
    }

    const cart = getCart();
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    let cartItem;

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.quantity * existingItem.price;
        cartItem = existingItem;
    } else {
        cartItem = {
            id: itemId,
            name: item.name,
            price: item.price,
            calories: item.calories,
            protein: item.protein,
            quantity,
            total: item.price * quantity,
            category: item.category
        };
        cart.push(cartItem);
    }

    saveCart(cart);
    await syncCartItemToFirestore(cartItem);

    return {
        success: true,
        message: `${item.name} added to cart!`,
        cartCount: getCartItemCount()
    };
}

async function removeFromCart(itemId) {
    let cart = getCart();
    const item = cart.find(cartItem => cartItem.id === itemId);

    if (item) {
        cart = cart.filter(cartItem => cartItem.id !== itemId);
        saveCart(cart);
        await deleteCartItemFromFirestore(itemId);
        return {
            success: true,
            message: `${item.name} removed from cart!`
        };
    }

    return {
        success: false,
        message: 'Item not found in cart'
    };
}

async function updateCartItemQuantity(itemId, quantity) {
    if (quantity <= 0) {
        return removeFromCart(itemId);
    }

    const cart = getCart();
    const item = cart.find(cartItem => cartItem.id === itemId);

    if (item) {
        item.quantity = quantity;
        item.total = item.quantity * item.price;
        saveCart(cart);
        await syncCartItemToFirestore(item);
        return {
            success: true,
            message: 'Quantity updated'
        };
    }

    return {
        success: false,
        message: 'Item not found in cart'
    };
}

async function clearCart() {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    if (user) {
        const snapshot = await getDocs(getCartCollectionRef(user.uid));
        const batch = writeBatch(db);
        snapshot.docs.forEach((cartDoc) => batch.delete(cartDoc.ref));
        await batch.commit();
    }

    saveCart([]);
    return {
        success: true,
        message: 'Cart cleared'
    };
}

function getCartSummary() {
    const cart = getCart();
    const summary = {
        itemCount: cart.length,
        totalItems: 0,
        subtotal: 0,
        taxes: 0,
        total: 0,
        totalCalories: 0,
        totalProtein: 0,
        items: cart
    };

    cart.forEach(item => {
        summary.totalItems += item.quantity;
        summary.subtotal += item.total;
        summary.totalCalories += item.calories * item.quantity;
        summary.totalProtein += item.protein * item.quantity;
    });

    summary.taxes = Math.round(summary.subtotal * 0.05);
    summary.total = summary.subtotal + summary.taxes;
    return summary;
}

function isItemInCart(itemId) {
    return getCart().some(item => item.id === itemId);
}

function getCartItem(itemId) {
    return getCart().find(item => item.id === itemId);
}

function getCartItemCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

function applyDiscount(discountPercent) {
    if (discountPercent < 0 || discountPercent > 100) {
        return {
            success: false,
            message: 'Invalid discount percentage'
        };
    }

    localStorage.setItem('cartDiscount', discountPercent);
    return {
        success: true,
        message: `${discountPercent}% discount applied`
    };
}

function removeDiscount() {
    localStorage.removeItem('cartDiscount');
    return {
        success: true,
        message: 'Discount removed'
    };
}

function getCartDiscount() {
    return parseInt(localStorage.getItem('cartDiscount'), 10) || 0;
}

function getCartTotalWithDiscount() {
    const summary = getCartSummary();
    const discount = getCartDiscount();
    const discountAmount = Math.round((summary.subtotal * discount) / 100);

    return {
        subtotal: summary.subtotal,
        discount,
        discountAmount,
        taxes: summary.taxes,
        total: summary.subtotal - discountAmount + summary.taxes
    };
}

function validateCart() {
    const cart = getCart();

    if (cart.length === 0) {
        return {
            valid: false,
            message: 'Your cart is empty. Please add items before checkout.'
        };
    }

    for (const item of cart) {
        if (item.quantity <= 0) {
            return {
                valid: false,
                message: `Invalid quantity for ${item.name}`
            };
        }
    }

    return {
        valid: true,
        message: 'Cart is valid'
    };
}

async function mergeCart(newCartItems) {
    let currentCart = getCart();

    newCartItems.forEach(newItem => {
        const existingItem = currentCart.find(item => item.id === newItem.id);
        if (existingItem) {
            existingItem.quantity += newItem.quantity;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            currentCart.push(newItem);
        }
    });

    saveCart(currentCart);
    await Promise.all(currentCart.map(syncCartItemToFirestore));
    return {
        success: true,
        message: 'Carts merged successfully'
    };
}

function getCartItemsGroupedByCategory() {
    const grouped = {};
    getCart().forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });
    return grouped;
}

function getMostOrderedItems(limit = 5) {
    return [...getCart()].sort((a, b) => b.quantity - a.quantity).slice(0, limit);
}

function getEstimatedDeliveryTime() {
    const deliveryTime = 45;
    const deliveryDateTime = new Date(Date.now() + deliveryTime * 60000);
    return {
        estimatedTime: deliveryTime,
        deliveryTime: deliveryDateTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    };
}

function exportCart() {
    return JSON.stringify(getCart(), null, 2);
}

function importCart(cartJson) {
    try {
        const importedCart = JSON.parse(cartJson);
        if (Array.isArray(importedCart)) {
            saveCart(importedCart);
            return {
                success: true,
                message: 'Cart imported successfully'
            };
        }
        return {
            success: false,
            message: 'Invalid cart format'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error importing cart: ' + error.message
        };
    }
}

Object.assign(window, {
    initializeCart,
    getCart,
    saveCart,
    loadUserCartFromFirestore,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartSummary,
    isItemInCart,
    getCartItem,
    getCartItemCount,
    applyDiscount,
    removeDiscount,
    getCartDiscount,
    getCartTotalWithDiscount,
    validateCart,
    mergeCart,
    getCartItemsGroupedByCategory,
    getMostOrderedItems,
    getEstimatedDeliveryTime,
    exportCart,
    importCart
});

export {
    initializeCart,
    getCart,
    loadUserCartFromFirestore,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartSummary,
    getCartDiscount,
    removeDiscount
};
