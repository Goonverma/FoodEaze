# FoodEaze - Hospital Food Ordering & Queue Management System

A comprehensive, fully responsive web application for managing hospital food ordering and delivery, built for Central Coalfields Limited (CCL) Hospital.

## 🎯 Project Overview

FoodEaze is a modern, patient-centric food ordering platform designed specifically for hospital environments. It streamlines the process of ordering meals while providing real-time tracking and personalized diet preferences. The system features separate interfaces for patients and kitchen staff, ensuring efficient order management and timely delivery.

### Key Features

**For Patients:**
- 🔐 Secure user registration and authentication with Firebase
- 🍽️ Browse diverse menu with filtering by category and diet type
- 🏥 Personalized diet preferences (Normal, Diabetic, Low Salt, High Protein, Weight Management, Senior Citizen)
- 🛒 Shopping cart with discount system and tax calculation
- 📋 Real-time order tracking with timeline visualization
- 📱 Responsive design optimized for all devices
- 💳 Multiple payment methods support
- ⏱️ Estimated delivery time tracking
- 📞 Contact history and order management
- 🔄 Order status notifications

**For Kitchen Staff:**
- 📊 Real-time dashboard with order statistics
- ⏳ Order queue management with status updates
- 👥 Patient information and delivery details
- 📈 Analytics and reporting
- 🖨️ Print and export capabilities
- 📲 Quick order status updates

## 🏗️ Technology Stack

- **Frontend**: HTML5, CSS3 (Custom Variables & Responsive Design), Vanilla JavaScript ES6+
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Firebase Firestore (Real-time NoSQL)
- **Design Approach**: Mobile-first responsive design
- **No Dependencies**: Pure vanilla implementation - no frameworks (React, Angular, Vue, Bootstrap, jQuery, etc.)

## 🎨 Design System

### Color Palette
- **Primary**: `#003366` (CCL Hospital Blue) - Main actions and headers
- **Secondary**: `#FFFFFF` (White) - Backgrounds and cards
- **Accent**: `#FFC107` (Gold) - Highlights and CTAs
- **Success**: `#28a745` (Green) - Positive actions
- **Danger**: `#dc3545` (Red) - Destructive actions
- **Warning**: `#ffc107` (Yellow) - Warnings
- **Info**: `#17a2b8` (Cyan) - Information

### Responsive Breakpoints
- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **Desktop**: 768px - 1024px
- **Large**: 1024px - 1920px
- **Extra Large**: ≥ 1920px

## 📁 Project Structure

```
FoodEaze/
├── css/
│   ├── style.css              # Global styling (900+ lines)
│   ├── dashboard.css          # Dashboard layouts (600+ lines)
│   └── responsive.css         # Mobile-first responsive (500+ lines)
├── js/
│   ├── firebase-config.js     # Firebase initialization
│   ├── auth.js                # Authentication module (300+ lines)
│   ├── menu.js                # Menu and filtering (300+ lines)
│   ├── cart.js                # Shopping cart (250+ lines)
│   ├── orders.js              # Order management (350+ lines)
│   ├── dashboard.js           # Shared utilities (400+ lines)
│   └── staff.js               # Staff dashboard (350+ lines)
├── index.html                 # Landing page
├── register.html              # User registration
├── login.html                 # User login
├── dashboard.html             # User dashboard
├── menu.html                  # Browse menu
├── cart.html                  # Shopping cart
├── diet-preference.html       # Diet customization
├── order-status.html          # Order tracking
├── order-history.html         # Order history
├── profile.html               # User profile
├── staff-dashboard.html       # Staff dashboard
├── manage-orders.html         # Staff order management
└── README.md                  # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Firebase account

### Step 1: Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Authentication (Email/Password)
3. Enable Firestore Database
4. Get your Firebase configuration credentials
5. Update `js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 2: Firestore Setup

Create the following collections in Firestore:

**Users Collection:**
```
{
  uid: string,
  name: string,
  email: string,
  phone: string,
  wardNumber: string,
  roomNumber: string,
  dietPreference: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Orders Collection:**
```
{
  orderId: string,
  userId: string,
  userName: string,
  email: string,
  phone: string,
  wardNumber: string,
  roomNumber: string,
  dietPreference: string,
  items: [
    {
      id: string,
      name: string,
      price: number,
      quantity: number,
      total: number
    }
  ],
  subtotal: number,
  discount: number,
  discountAmount: number,
  taxes: number,
  total: number,
  paymentMethod: string,
  paymentStatus: string,
  status: string (Pending|Preparing|Ready|Delivered),
  timestamp: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  estimatedDeliveryTime: number,
  notes: string
}
```

### Step 3: Deploy

Option A: Local Testing
```bash
# Simply open index.html in your browser
open index.html  # macOS
start index.html # Windows
```

Option B: Web Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js with http-server
npx http-server
```

Option C: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

## 📖 Usage Guide

### For Patients

1. **Registration**
   - Click "Register" on the landing page
   - Fill in personal and ward information
   - Verify email (if configured)

2. **Browse Menu**
   - Navigate to "Order Food" section
   - Filter by meal category or diet type
   - Add items to cart with desired quantity

3. **Checkout**
   - Review cart items
   - Select payment method
   - Add special requests
   - Click "Place Order"

4. **Track Order**
   - View real-time status updates
   - See estimated delivery time
   - Check order history

5. **Manage Profile**
   - Update diet preferences
   - Change password
   - View personal information

### For Staff

1. **Dashboard**
   - View order statistics
   - Monitor pending orders
   - See recent order activity

2. **Manage Orders**
   - Update order status
   - Search and filter orders
   - View detailed order information
   - Export reports (CSV)
   - Print order lists

## 📋 API Reference

### Authentication Module (`js/auth.js`)

```javascript
// Register user
await registerUser(name, email, phone, wardNumber, roomNumber, password)

// Login user
await loginUser(email, password, rememberMe)

// Logout
await logoutUser()

// Get current user data
await getCurrentUserData()

// Check if logged in
isUserLoggedIn()

// Change password
await changePassword(newPassword)

// Update profile
await updateUserProfile(updates)

// Send password reset email
await sendPasswordResetEmail(email)
```

### Menu Module (`js/menu.js`)

```javascript
// Get all menu items
getAllMenuItems(category, diet)

// Get items by category
getItemsByCategory(category)

// Search menu items
searchMenuItems(query)

// Get recommended items for diet
getRecommendedItems(dietType)

// Get health tips for diet
getHealthTips(dietType)

// Get diet summary
getDietSummary(dietType)
```

### Cart Module (`js/cart.js`)

```javascript
// Add to cart
addToCart(itemId, quantity)

// Remove from cart
removeFromCart(itemId)

// Update quantity
updateCartItemQuantity(itemId, quantity)

// Get cart
getCart()

// Get cart summary
getCartSummary()

// Apply discount
applyDiscount(percentage)

// Validate cart
validateCart()
```

### Orders Module (`js/orders.js`)

```javascript
// Create order
await createOrder(orderData)

// Get order by ID
await getOrderById(orderId)

// Get user's orders
await getUserOrders(userId)

// Get all orders (staff)
await getAllOrders()

// Update order status
await updateOrderStatus(orderId, newStatus)

// Get order statistics
await getOrderStatistics(userId)

// Get recent orders
await getRecentOrders(limit)
```

### Dashboard Utilities (`js/dashboard.js`)

```javascript
// Show notification
showNotification(message, type, duration)

// Show/hide loading spinner
showLoadingSpinner()
hideLoadingSpinner()

// Open/close modal
openModal(modalId)
closeModal(modalId)

// Format utilities
formatCurrency(amount)
formatDate(timestamp)
formatTime(timestamp)
getTimeAgo(timestamp)
```

## 🔐 Security Features

- ✅ Firebase Authentication with email/password
- ✅ Client-side form validation
- ✅ HTTPS only (Firebase Hosting)
- ✅ Firestore security rules (configured on backend)
- ✅ Session management with localStorage
- ✅ Password strength validation
- ✅ Secure password hashing (Firebase)

## 📱 Responsive Design Details

### Mobile (< 576px)
- Single column layout
- Full-width buttons and inputs
- Touch-friendly spacing (44px minimum)
- Hamburger menu navigation
- Stacked form fields
- Card-based table layouts

### Tablet (576px - 768px)
- Two column layouts where appropriate
- Sidebar becomes horizontal navigation
- Medium-sized buttons
- Optimized padding and margins
- Responsive grid (2-3 columns)

### Desktop (768px+)
- Full multi-column layouts
- Sidebar navigation
- Desktop-optimized grid (3-4 columns)
- Hover effects and transitions
- Full-featured interactions

### Extra Large (1920px+)
- Wider containers
- Increased font sizes
- More generous spacing
- Enhanced visual hierarchy

## 🎓 Key Components

### Authentication System
- Email/password registration and login
- "Remember Me" functionality
- Password reset via email
- Session management with Firebase
- Auto-redirect based on auth state

### Menu System
- 35+ menu items across 6 categories
- Dynamic filtering (category + diet)
- Full-text search capabilities
- Personalized recommendations
- Nutritional information display

### Order Management
- Complete order lifecycle tracking
- Real-time status updates
- Order confirmation emails (optional)
- Estimated delivery time calculation
- Tax and discount system

### Dashboard
- Responsive layout with sidebar
- Real-time statistics
- Quick action buttons
- Recent orders display
- User profile management

## 🔄 Data Flow

```
User Registration
    ↓
Firebase Auth + Firestore User Document
    ↓
Dashboard (User Profile)
    ↓
Browse Menu → Add to Cart
    ↓
Checkout → Create Order
    ↓
Firestore Order Document
    ↓
Real-time Status Updates
    ↓
Order History & Tracking
```

## 🚀 Performance Optimizations

- **CSS Variables**: Efficient theming and maintenance
- **LocalStorage**: Cart persistence without network calls
- **Lazy Loading**: Images and assets load on demand
- **Minified Code**: Production-ready CSS and JavaScript
- **Responsive Images**: Optimized for different screen sizes
- **Caching**: Browser caching for static assets
- **Async/Await**: Non-blocking database operations
- **Pagination**: Efficient data loading

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify API keys in `firebase-config.js`
- Check Firebase project is active
- Ensure Firestore is enabled
- Check browser console for error messages

### Authentication Errors
- Clear browser localStorage: `localStorage.clear()`
- Check email is correctly formatted
- Verify password meets requirements (6+ characters)
- Check Firebase Authentication is enabled

### Menu Not Loading
- Verify Firestore has menu data
- Check JavaScript console for errors
- Ensure `menu.js` is loaded

### Cart Issues
- Clear localStorage: `localStorage.removeItem('cart')`
- Check browser console for JavaScript errors
- Verify cart module is properly initialized

## 📈 Future Enhancements

- [ ] Meal ratings and reviews
- [ ] Nutritionist recommendations
- [ ] SMS order notifications
- [ ] Email order confirmations
- [ ] Advanced analytics dashboard
- [ ] Inventory management system
- [ ] Multiple hospital locations
- [ ] Meal subscription plans
- [ ] Mobile app (React Native/Flutter)
- [ ] AI-powered recommendations
- [ ] Payment gateway integration (Razorpay/PayPal)
- [ ] Dietary allergen warnings
- [ ] Kitchen display system (KDS)
- [ ] Voice-based ordering

## 📞 Support & Contact

**Email**: support@foodeaze.com  
**Phone**: +91-xxx-xxx-xxxx  
**Hospital**: Central Coalfields Limited (CCL) Hospital

## 📝 License

This project is developed for Central Coalfields Limited (CCL) Hospital. All rights reserved.

## 👥 Team

- **Development**: Full-Stack Development Team
- **Design**: UI/UX Team
- **Hospital Partner**: CCL Hospital Management

## 🙏 Acknowledgments

Built with vanilla HTML5, CSS3, and JavaScript - leveraging Firebase for backend services.

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**Status**: Production Ready ✅
