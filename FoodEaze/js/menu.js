/**
 * FoodEaze Menu Module
 * Manages food menu items, categories, and filters
 */

// ==================== Menu Data ====================

const MENU_ITEMS = {
    breakfast: [
        { id: 'b1', name: 'Poha', price: 40, calories: 250, protein: 6, category: 'Breakfast', diets: ['Normal', 'Diabetic', 'Weight Management'] },
        { id: 'b2', name: 'Upma', price: 45, calories: 280, protein: 8, category: 'Breakfast', diets: ['Normal', 'Low Salt', 'Weight Management'] },
        { id: 'b3', name: 'Idli Sambhar', price: 50, calories: 200, protein: 5, category: 'Breakfast', diets: ['Normal', 'Low Salt'] },
        { id: 'b4', name: 'Vegetable Sandwich', price: 60, calories: 300, protein: 10, category: 'Breakfast', diets: ['Normal', 'High Protein'] },
        { id: 'b5', name: 'Oats Porridge', price: 55, calories: 220, protein: 8, category: 'Breakfast', diets: ['Diabetic', 'Low Salt', 'High Protein', 'Weight Management', 'Senior'] },
        { id: 'b6', name: 'Dalia', price: 40, calories: 240, protein: 7, category: 'Breakfast', diets: ['Diabetic', 'Low Salt', 'Senior'] },
        { id: 'b7', name: 'Milk & Banana Combo', price: 50, calories: 180, protein: 8, category: 'Breakfast', diets: ['Normal', 'High Protein', 'Senior'] }
    ],
    lunch: [
        { id: 'l1', name: 'Veg Thali', price: 80, calories: 450, protein: 12, category: 'Lunch', diets: ['Normal'] },
        { id: 'l2', name: 'Paneer Thali', price: 100, calories: 520, protein: 18, category: 'Lunch', diets: ['Normal', 'High Protein'] },
        { id: 'l3', name: 'Dal Rice', price: 70, calories: 380, protein: 14, category: 'Lunch', diets: ['Normal', 'Diabetic', 'Low Salt'] },
        { id: 'l4', name: 'Khichdi', price: 60, calories: 320, protein: 9, category: 'Lunch', diets: ['Diabetic', 'Low Salt', 'Weight Management', 'Senior'] },
        { id: 'l5', name: 'Roti Sabzi Combo', price: 75, calories: 400, protein: 11, category: 'Lunch', diets: ['Normal', 'Low Salt'] },
        { id: 'l6', name: 'Low Oil Diet Thali', price: 85, calories: 380, protein: 13, category: 'Lunch', diets: ['Diabetic', 'Weight Management'] },
        { id: 'l7', name: 'High Protein Meal', price: 120, calories: 550, protein: 25, category: 'Lunch', diets: ['High Protein'] }
    ],
    dinner: [
        { id: 'd1', name: 'Light Veg Thali', price: 70, calories: 350, protein: 10, category: 'Dinner', diets: ['Normal', 'Weight Management', 'Senior'] },
        { id: 'd2', name: 'Soup & Bread Combo', price: 65, calories: 280, protein: 9, category: 'Dinner', diets: ['Diabetic', 'Low Salt', 'Weight Management'] },
        { id: 'd3', name: 'Khichdi', price: 60, calories: 320, protein: 9, category: 'Dinner', diets: ['Diabetic', 'Low Salt', 'Senior'] },
        { id: 'd4', name: 'Roti Dal Combo', price: 60, calories: 340, protein: 12, category: 'Dinner', diets: ['Normal', 'Low Salt'] },
        { id: 'd5', name: 'Paneer Meal', price: 110, calories: 480, protein: 20, category: 'Dinner', diets: ['Normal', 'High Protein'] }
    ],
    beverages: [
        { id: 'bv1', name: 'Milk', price: 30, calories: 150, protein: 8, category: 'Beverages', diets: ['Normal', 'High Protein', 'Senior'] },
        { id: 'bv2', name: 'Buttermilk', price: 25, calories: 80, protein: 6, category: 'Beverages', diets: ['Normal', 'Diabetic', 'Low Salt'] },
        { id: 'bv3', name: 'Lemon Water', price: 15, calories: 10, protein: 0, category: 'Beverages', diets: ['All'] },
        { id: 'bv4', name: 'Coconut Water', price: 35, calories: 45, protein: 2, category: 'Beverages', diets: ['Normal', 'Diabetic', 'Weight Management'] },
        { id: 'bv5', name: 'Green Tea', price: 25, calories: 5, protein: 0, category: 'Beverages', diets: ['All'] }
    ],
    special: [
        { id: 's1', name: 'Diabetic Diet Meal', price: 110, calories: 380, protein: 15, category: 'Special', diets: ['Diabetic'] },
        { id: 's2', name: 'Low Salt Diet Meal', price: 105, calories: 400, protein: 12, category: 'Special', diets: ['Low Salt'] },
        { id: 's3', name: 'High Protein Diet Meal', price: 130, calories: 550, protein: 30, category: 'Special', diets: ['High Protein'] },
        { id: 's4', name: 'Weight Management Meal', price: 100, calories: 300, protein: 14, category: 'Special', diets: ['Weight Management'] },
        { id: 's5', name: 'Senior Citizen Diet Meal', price: 95, calories: 350, protein: 10, category: 'Special', diets: ['Senior'] }
    ]
};

// ==================== Menu Functions ====================

/**
 * Get all menu items
 * @param {string} category - Filter by category (optional)
 * @param {string} diet - Filter by diet type (optional)
 */
function getAllMenuItems(category = null, diet = null) {
    let items = [];

    // Get all items from all categories
    Object.keys(MENU_ITEMS).forEach(cat => {
        items = items.concat(MENU_ITEMS[cat]);
    });

    // Apply category filter
    if (category && category !== 'all') {
        items = items.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    // Apply diet filter
    if (diet && diet !== 'all') {
        items = items.filter(item => item.diets.includes(diet));
    }

    return items;
}

/**
 * Get items by category
 * @param {string} category - Category name
 */
function getItemsByCategory(category) {
    return MENU_ITEMS[category] || [];
}

/**
 * Get menu item by ID
 * @param {string} itemId - Item ID
 */
function getMenuItemById(itemId) {
    for (const category in MENU_ITEMS) {
        const item = MENU_ITEMS[category].find(i => i.id === itemId);
        if (item) return item;
    }
    return null;
}

/**
 * Search menu items
 * @param {string} query - Search query
 */
function searchMenuItems(query) {
    if (!query || query.trim() === '') {
        return [];
    }

    const searchTerm = query.toLowerCase();
    let results = [];

    Object.keys(MENU_ITEMS).forEach(category => {
        const matching = MENU_ITEMS[category].filter(item =>
            item.name.toLowerCase().includes(searchTerm)
        );
        results = results.concat(matching);
    });

    return results;
}

/**
 * Get recommended items for a diet type
 * @param {string} dietType - Diet preference
 */
function getRecommendedItems(dietType) {
    if (dietType === 'Normal Diet') {
        return getAllMenuItems(null, 'Normal');
    } else if (dietType === 'Diabetic Diet') {
        return getAllMenuItems(null, 'Diabetic');
    } else if (dietType === 'Low Salt Diet') {
        return getAllMenuItems(null, 'Low Salt');
    } else if (dietType === 'High Protein Diet') {
        return getAllMenuItems(null, 'High Protein');
    } else if (dietType === 'Weight Management Diet') {
        return getAllMenuItems(null, 'Weight Management');
    } else if (dietType === 'Senior Citizen Diet') {
        return getAllMenuItems(null, 'Senior');
    }
    return getAllMenuItems();
}

/**
 * Get categories
 */
function getFilteredMenuItems({ query = '', categories = ['all'], diets = ['all'] } = {}) {
    let items = getAllMenuItems();
    const searchTerm = typeof query === 'string' ? query.trim().toLowerCase() : '';
    const selectedCategories = Array.isArray(categories) && categories.length ? categories : ['all'];
    const selectedDiets = Array.isArray(diets) && diets.length ? diets : ['all'];

    if (!selectedCategories.includes('all')) {
        items = items.filter(item => selectedCategories.includes(item.category.toLowerCase()));
    }

    if (!selectedDiets.includes('all')) {
        items = items.filter(item => item.diets.some(diet => selectedDiets.includes(diet)));
    }

    if (searchTerm) {
        items = items.filter(item => item.name.toLowerCase().includes(searchTerm));
    }

    return items;
}

function getCategories() {
    return [
        { name: 'breakfast', label: 'Breakfast' },
        { name: 'lunch', label: 'Lunch' },
        { name: 'dinner', label: 'Dinner' },
        { name: 'beverages', label: 'Beverages' },
        { name: 'special', label: 'Special Diet' }
    ];
}

/**
 * Get diet types
 */
function getDietTypes() {
    return [
        'Normal',
        'Diabetic',
        'Low Salt',
        'High Protein',
        'Weight Management',
        'Senior'
    ];
}

/**
 * Get health tips for a diet type
 * @param {string} dietType - Diet type
 */
function getHealthTips(dietType) {
    const tips = {
        'Normal': [
            'Maintain a balanced diet with all food groups',
            'Drink at least 8-10 glasses of water daily',
            'Include fresh fruits and vegetables in every meal',
            'Limit salt and sugar intake',
            'Exercise regularly for 30 minutes daily'
        ],
        'Diabetic': [
            'Monitor blood sugar levels regularly',
            'Choose low glycemic index foods',
            'Eat small, frequent meals',
            'Avoid sugary drinks and desserts',
            'Include fiber-rich foods in your diet'
        ],
        'Low Salt': [
            'Read food labels to check sodium content',
            'Use herbs and spices for flavoring instead of salt',
            'Avoid processed and packaged foods',
            'Cook meals at home for better control',
            'Stay hydrated with plenty of water'
        ],
        'High Protein': [
            'Include protein in every meal',
            'Aim for 1.2-1.6g protein per kg body weight',
            'Combine protein with complex carbohydrates',
            'Include dairy, legumes, and lean meats',
            'Distribute protein intake throughout the day'
        ],
        'Weight Management': [
            'Create a calorie deficit through diet and exercise',
            'Eat plenty of vegetables and whole grains',
            'Drink water before meals to feel fuller',
            'Avoid deep-fried and high-fat foods',
            'Track your meals and maintain a food diary'
        ],
        'Senior': [
            'Ensure adequate calcium and vitamin D intake',
            'Eat soft, easy-to-digest foods',
            'Stay well-hydrated throughout the day',
            'Include foods rich in iron and B vitamins',
            'Maintain regular eating schedules'
        ]
    };

    return tips[dietType] || tips['Normal'];
}

/**
 * Get diet summary
 * @param {string} dietType - Diet type
 */
function getDietSummary(dietType) {
    const summaries = {
        'Normal': {
            description: 'A balanced diet with appropriate portions of all food groups',
            benefits: ['Complete nutrition', 'Sustained energy', 'Overall wellness']
        },
        'Diabetic': {
            description: 'Low glycemic index foods to maintain stable blood sugar levels',
            benefits: ['Blood sugar control', 'Reduced complications', 'Better energy']
        },
        'Low Salt': {
            description: 'Minimized sodium intake to support heart and kidney health',
            benefits: ['Lower blood pressure', 'Better heart health', 'Reduced retention']
        },
        'High Protein': {
            description: 'Enhanced protein intake for muscle maintenance and recovery',
            benefits: ['Muscle strength', 'Faster recovery', 'Better metabolism']
        },
        'Weight Management': {
            description: 'Calorie-controlled meals for healthy weight reduction',
            benefits: ['Healthy weight loss', 'Improved energy', 'Better health']
        },
        'Senior': {
            description: 'Nutrient-dense foods suitable for senior nutritional needs',
            benefits: ['Bone health', 'Easier digestion', 'Better nutrition']
        }
    };

    return summaries[dietType] || summaries['Normal'];
}

/**
 * Calculate nutritional information for items
 * @param {array} items - Array of menu items
 */
function calculateNutrition(items) {
    const total = {
        calories: 0,
        protein: 0,
        itemCount: 0,
        averageCaloriesPerItem: 0,
        averageProteinPerItem: 0
    };

    items.forEach(item => {
        total.calories += item.calories;
        total.protein += item.protein;
        total.itemCount += 1;
    });

    if (total.itemCount > 0) {
        total.averageCaloriesPerItem = Math.round(total.calories / total.itemCount);
        total.averageProteinPerItem = (total.protein / total.itemCount).toFixed(1);
    }

    return total;
}

/**
 * Sort menu items
 * @param {array} items - Array of menu items
 * @param {string} sortBy - Sort criteria: 'name', 'price', 'calories', 'protein'
 * @param {string} order - Sort order: 'asc', 'desc'
 */
function sortMenuItems(items, sortBy = 'name', order = 'asc') {
    const sorted = [...items];

    sorted.sort((a, b) => {
        let aValue = a[sortBy] || 0;
        let bValue = b[sortBy] || 0;

        if (sortBy === 'name') {
            aValue = a[sortBy].toLowerCase();
            bValue = b[sortBy].toLowerCase();
        }

        if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    return sorted;
}

/**
 * Filter items by price range
 * @param {array} items - Array of menu items
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 */
function filterByPriceRange(items, minPrice, maxPrice) {
    return items.filter(item => item.price >= minPrice && item.price <= maxPrice);
}

/**
 * Filter items by calorie range
 * @param {array} items - Array of menu items
 * @param {number} minCalories - Minimum calories
 * @param {number} maxCalories - Maximum calories
 */
function filterByCalorieRange(items, minCalories, maxCalories) {
    return items.filter(item => item.calories >= minCalories && item.calories <= maxCalories);
}

/**
 * Get similar items
 * @param {string} itemId - Item ID
 * @param {number} count - Number of items to return
 */
function getSimilarItems(itemId, count = 3) {
    const item = getMenuItemById(itemId);
    if (!item) return [];

    const allItems = getAllMenuItems();
    const similar = allItems.filter(i =>
        i.id !== itemId && i.diets.some(d => item.diets.includes(d))
    );

    return similar.slice(0, count);
}
