/**
 * FoodEaze Authentication Module
 * Handles Firebase Authentication and patient profile records.
 */

import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    fetchSignInMethodsForEmail
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

let authReadyPromise = null;

function waitForAuthState() {
    if (!authReadyPromise) {
        authReadyPromise = new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }

    return authReadyPromise;
}

function sanitizeString(value) {
    if (typeof value !== 'string') return value;
    let sanitized = value.trim();
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    sanitized = sanitized.replace(/(javascript:|vbscript:|data:)/gi, '');
    sanitized = sanitized.replace(/\b(onerror|onclick|onload|onmouseover|onfocus|onblur|document\.cookie|window\.location|eval|function)\b/gi, '');
    return sanitized;
}

function containsDangerousPatterns(value) {
    if (typeof value !== 'string') return false;
    const normalized = value.toLowerCase();
    const patterns = [
        '<script',
        '<iframe',
        '<img',
        'javascript:',
        'vbscript:',
        'data:',
        'onerror',
        'onclick',
        'onload',
        'eval(',
        'function(',
        'document.cookie',
        'window.location',
        'insert into',
        'delete from',
        'drop table',
        'update ',
        'select ',
        'union select',
        ' or 1=1',
        '--',
        ';--',
        '/*',
        '*/'
    ];
    return patterns.some(pattern => normalized.includes(pattern));
}

function sanitizeForFirestore(value) {
    if (typeof value !== 'string') return value;
    return sanitizeString(value).replace(/["'`]/g, '');
}

function sanitizeUpdates(updates) {
    const clean = {};
    Object.keys(updates).forEach(key => {
        clean[key] = typeof updates[key] === 'string' ? sanitizeForFirestore(updates[key]) : updates[key];
    });
    return clean;
}

function validateName(name) {
    const normalized = String(name).trim();
    return /^[A-Za-z ]{3,50}$/.test(normalized);
}

function validateWardNumber(value) {
    return /^[A-Za-z0-9-]{1,10}$/.test(String(value).trim());
}

function validateRoomNumber(value) {
    return /^[A-Za-z0-9-]{1,10}$/.test(String(value).trim());
}

function validateEmail(email) {
    const normalized = String(email).trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

function validatePhoneNumber(phone) {
    return /^[0-9]{10}$/.test(String(phone).trim());
}

function sanitizeSearchQuery(value) {
    if (typeof value !== 'string') return '';
    let query = value.trim().replace(/\s+/g, ' ');
    query = query.replace(/<[^>]*>/g, '');
    query = query.replace(/['"`]/g, '');
    if (containsDangerousPatterns(query)) return '';
    return query.toLowerCase();
}

function sanitizeOrderString(value) {
    return sanitizeForFirestore(value);
}

function setFieldState(input, isValid, message = '') {
    if (!input) return;
    input.classList.toggle('input-valid', isValid);
    input.classList.toggle('input-invalid', !isValid);
    let errorElement = input.parentElement.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        input.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;
    if (message && !isValid) {
        errorElement.classList.add('show');
    } else {
        errorElement.classList.remove('show');
    }
}

function clearFormErrors(form = document) {
    const context = form instanceof HTMLElement ? form : document;
    context.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
    context.querySelectorAll('.input-invalid, .input-valid').forEach(el => {
        el.classList.remove('input-invalid', 'input-valid');
    });
}

function showNotification(message, type = 'info', duration = 4000) {
    if (!message) return;
    let notification = document.getElementById('globalNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'globalNotification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.maxWidth = '320px';
        notification.style.padding = '14px 18px';
        notification.style.borderRadius = '12px';
        notification.style.boxShadow = '0 12px 30px rgba(0,0,0,0.18)';
        notification.style.color = '#fff';
        notification.style.zIndex = '9999';
        notification.style.fontSize = '0.95rem';
        notification.style.lineHeight = '1.4';
        document.body.appendChild(notification);
    }
    const backgroundMap = {
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#007bff'
    };
    notification.textContent = message;
    notification.style.backgroundColor = backgroundMap[type] || backgroundMap.info;
    notification.style.display = 'block';
    clearTimeout(notification.dismissTimer);
    notification.dismissTimer = setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

function focusFirstInvalidField(form = document) {
    const context = form instanceof HTMLElement ? form : document;
    const invalidField = context.querySelector('.input-invalid');
    if (invalidField) {
        invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        invalidField.focus();
    }
}

function validatePasswordStrength(password) {
    const value = String(password);
    const lengthValid = value.length >= 8 && value.length <= 32;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    const invalidContent = containsDangerousPatterns(value);

    let score = 0;
    if (lengthValid) score += 25;
    if (hasUpper && hasLower) score += 25;
    if (hasNumber) score += 25;
    if (hasSpecial) score += 25;

    let message = 'Password is valid.';
    if (!lengthValid) {
        message = 'Password must be 8-32 characters long.';
    } else if (!hasUpper) {
        message = 'Password must contain at least one uppercase letter.';
    } else if (!hasLower) {
        message = 'Password must contain at least one lowercase letter.';
    } else if (!hasNumber) {
        message = 'Password must contain at least one number.';
    } else if (!hasSpecial) {
        message = 'Password must contain at least one special character.';
    } else if (invalidContent) {
        message = 'Password contains invalid characters.';
    }

    return {
        valid: lengthValid && hasUpper && hasLower && hasNumber && hasSpecial && !invalidContent,
        score,
        message
    };
}

async function registerUser(name, email, phone, wardNumber, roomNumber, password) {
    try {
        const safeName = sanitizeForFirestore(name);
        const safeEmail = sanitizeForFirestore(String(email).trim().toLowerCase());
        const safePhone = sanitizeForFirestore(phone);
        const safeWardNumber = sanitizeForFirestore(wardNumber);
        const safeRoomNumber = sanitizeForFirestore(roomNumber);

        const userCredential = await createUserWithEmailAndPassword(auth, safeEmail, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: safeName,
            email: safeEmail,
            phone: safePhone,
            wardNumber: safeWardNumber,
            roomNumber: safeRoomNumber,
            dietPreference: 'Normal Diet',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await signOut(auth);
        authReadyPromise = null;

        return {
            success: true,
            message: 'Registration successful! Please login.',
            uid: user.uid
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: getErrorMessage(error.code)
        };
    }
}

async function loginUser(email, password, rememberMe = false) {
    try {
        const safeEmail = sanitizeForFirestore(String(email).trim().toLowerCase());
        const userCredential = await signInWithEmailAndPassword(auth, safeEmail, password);
        const user = userCredential.user;

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('userEmail', safeEmail);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('userEmail');
        }

        authReadyPromise = null;

        return {
            success: true,
            message: 'Login successful!',
            uid: user.uid
        };
    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error.code, error.message)
        };
    }
}

async function logoutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('cart');
        authReadyPromise = null;
        return {
            success: true,
            message: 'Logout successful!'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error during logout. Please try again.'
        };
    }
}

async function getCurrentUserData() {
    const user = await waitForAuthState();

    if (!user) return null;

    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) return null;

        return {
            uid: user.uid,
            ...userDoc.data()
        };
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

async function isUserLoggedIn() {
    const user = await waitForAuthState();
    return user !== null;
}

function getCurrentUser() {
    return auth.currentUser;
}

async function getAuthenticatedUser() {
    return waitForAuthState();
}

async function changePassword(newPassword) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return {
                success: false,
                message: 'No user logged in'
            };
        }

        await updatePassword(user, newPassword);
        return {
            success: true,
            message: 'Password changed successfully!'
        };
    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error.code, error.message)
        };
    }
}

async function updateUserProfile(updates) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return {
                success: false,
                message: 'No user logged in'
            };
        }

        const cleanUpdates = sanitizeUpdates(updates);
        await updateDoc(doc(db, 'users', user.uid), {
            ...cleanUpdates,
            updatedAt: serverTimestamp()
        });

        return {
            success: true,
            message: 'Profile updated successfully!'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error updating profile: ' + error.message
        };
    }
}

async function sendPasswordResetEmail(email) {
    try {
        const safeEmail = sanitizeForFirestore(String(email).trim().toLowerCase());
        await firebaseSendPasswordResetEmail(auth, safeEmail);
        return {
            success: true,
            message: 'Password reset email sent to ' + safeEmail
        };
    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error.code, error.message)
        };
    }
}

function getErrorMessage(code, fallbackMessage = '') {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please login or use a different email.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters long.',
        'auth/user-not-found': 'No user found with this email. Please register first.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
        'auth/missing-email': 'Please enter an email address.',
        'auth/missing-password': 'Please enter a password.',
        'permission-denied': 'Registration could not save your profile. Please check Firestore permissions.',
        'unavailable': 'Firebase is temporarily unavailable. Please check your connection and try again.',
        'failed-precondition': 'Firebase rejected the request. Please check your Firestore setup.'
    };

    return errorMessages[code] || fallbackMessage || 'An error occurred. Please try again.';
}

function setupAuthStateListener(callback) {
    onAuthStateChanged(auth, callback);
}

async function isEmailRegistered(email) {
    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        return methods.length > 0;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

async function setupAuthRedirects() {
    const user = await waitForAuthState();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['index.html', 'login.html', 'register.html'];
    const protectedPages = [
        'dashboard.html',
        'menu.html',
        'cart.html',
        'order-history.html',
        'order-status.html',
        'profile.html',
        'diet-preference.html'
    ];

    if (!user && protectedPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return;
    }

    if (user && ['login.html', 'register.html'].includes(currentPage)) {
        window.location.href = 'dashboard.html';
    }
}


Object.assign(window, {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUserData,
    isUserLoggedIn,
    getCurrentUser,
    getAuthenticatedUser,
    changePassword,
    updateUserProfile,
    sendPasswordResetEmail,
    getErrorMessage,
    setupAuthStateListener,
    isEmailRegistered,
    setupAuthRedirects,
    validatePasswordStrength,
    validateEmail,
    validatePhoneNumber,
    validateName,
    validateWardNumber,
    validateRoomNumber,
    sanitizeString,
    sanitizeForFirestore,
    sanitizeSearchQuery,
    sanitizeOrderString,
    showNotification,
    setFieldState,
    clearFormErrors,
    focusFirstInvalidField
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUserData,
    isUserLoggedIn,
    getCurrentUser,
    getAuthenticatedUser,
    changePassword,
    updateUserProfile,
    sendPasswordResetEmail,
    setupAuthStateListener,
    validatePasswordStrength,
    validateEmail,
    validatePhoneNumber,
    validateName,
    validateWardNumber,
    validateRoomNumber,
    sanitizeString,
    sanitizeForFirestore,
    sanitizeSearchQuery,
    sanitizeOrderString,
    showNotification,
    setFieldState,
    clearFormErrors,
    focusFirstInvalidField
};
