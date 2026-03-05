// ============================================
// WeMeal Admin Panel - JavaScript
// ============================================

let recipes = [];
let editingRecipeId = null;
let currentFilter = 'all';

// Wait for Firebase to initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAdmin, 500);
});

function initAdmin() {
    if (!window.firebaseAuth) {
        console.error('Firebase not loaded');
        return;
    }

    const auth = window.firebaseAuth;
    const { onAuthStateChanged } = window.firebaseFunctions;

    // Check auth state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            showDashboard(user);
        } else {
            showLogin();
        }
    });

    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Add recipe button
    document.getElementById('add-recipe-btn').addEventListener('click', () => openModal());

    // OCR Import button
    document.getElementById('import-ocr-btn').addEventListener('click', openOcrModal);

    // Sync static recipes
    document.getElementById('sync-static-btn').addEventListener('click', syncStaticRecipes);

    // Export button
    document.getElementById('export-static-btn').addEventListener('click', openExportModal);

    // Modal close
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);

    // Recipe form
    document.getElementById('recipe-form').addEventListener('submit', handleSaveRecipe);

    // Delete modal
    document.getElementById('cancel-delete').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete').addEventListener('click', handleDeleteRecipe);

    // Search & Filter
    document.getElementById('search-input').addEventListener('input', renderRecipes);
    document.getElementById('filter-category').addEventListener('change', renderRecipes);

    // Tag selection
    document.querySelectorAll('.tag-select .tag').forEach(tag => {
        // Skip category and difficulty tags — they have their own single-select handlers
        if (tag.closest('#category-tags') || tag.closest('#difficulty-tags')) return;
        tag.addEventListener('click', () => tag.classList.toggle('active'));
    });

    // Stat card filters
    document.querySelectorAll('.stat-card.clickable').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.stat-card.clickable').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentFilter = card.dataset.filter;
            renderRecipes();
        });
    });

    // Set initial filter
    document.getElementById('filter-all').classList.add('active');

    // OCR Modal
    setupOcrListeners();

    // Export Modal
    setupExportListeners();

    // Step Manager
    setupStepListeners();

    // Tab switching
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById('tab-' + btn.dataset.tab);
            if (target) {
                target.classList.add('active');
                if (btn.dataset.tab === 'monetization') {
                    window.loadMonetizationStats();
                }
                if (btn.dataset.tab === 'promos') {
                    loadPromos();
                    loadBenefitCodes();
                    setupPromoSubTabs();
                }
                if (btn.dataset.tab === 'gifts') {
                    window.loadGiftCodes();
                }
            }
        });
    });

    // Time Picker sync
    const timeInput = document.getElementById('recipe-time-value');
    const timeHidden = document.getElementById('recipe-time-slider');
    if (timeInput && timeHidden) {
        timeInput.addEventListener('input', () => {
            timeHidden.value = timeInput.value;
        });
    }
    // Category tags (multi select — toggle)
    document.querySelectorAll('#category-tags .tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    // Difficulty tags (single select)
    document.querySelectorAll('#difficulty-tags .tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.querySelectorAll('#difficulty-tags .tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
        });
    });
}

function formatMinutes(minutes) {
    if (minutes === 0) return '0 min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
        return m > 0 ? `${h}h ${m} min` : `${h}h`;
    }
    return `${m} min`;
}

// Timer picker +/- adjustment
window.adjustTimer = function (btn, delta) {
    const picker = btn.closest('.timer-picker');
    const input = picker.querySelector('.timer-val');
    let val = parseInt(input.value) || 0;
    val = Math.max(0, val + delta);
    input.value = val;
    // Sync hidden field if this is the recipe time picker
    const hidden = document.getElementById('recipe-time-slider');
    if (picker.id === 'recipe-time-picker' && hidden) {
        hidden.value = val;
    }
};

function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 30; // Default
    let total = 0;

    // Simple parsing for "Xh Y min" or "X min"
    const hMatch = timeStr.match(/(\d+)\s*h/);
    const mMatch = timeStr.match(/(\d+)\s*min/);

    if (hMatch) total += parseInt(hMatch[1]) * 60;
    if (mMatch) total += parseInt(mMatch[1]);

    // Fallback if just a number
    if (!hMatch && !mMatch && !isNaN(parseInt(timeStr))) {
        total = parseInt(timeStr);
    }

    return total > 0 ? total : 30;
}

// ============================================
// Authentication
// ============================================

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const { signInWithEmailAndPassword } = window.firebaseFunctions;
        await signInWithEmailAndPassword(window.firebaseAuth, email, password);
        errorEl.textContent = '';
    } catch (error) {
        console.error('Login error:', error);
        errorEl.textContent = 'Email ou mot de passe incorrect';
    }
}

async function handleLogout() {
    const { signOut } = window.firebaseFunctions;
    await signOut(window.firebaseAuth);
}

function showLogin(errorMsg = '') {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    if (errorMsg) {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = errorMsg;
        errorEl.style.background = 'rgba(220,38,38,0.1)';
        errorEl.style.border = '1px solid rgba(220,38,38,0.3)';
        errorEl.style.borderRadius = '8px';
        errorEl.style.padding = '10px';
    }
}

async function showDashboard(user) {
    const { doc, getDoc } = window.firebaseFunctions;
    const db = window.firebaseDb;

    // Fetch user's Firestore document to check admin status
    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await handleLogout();
            showLogin('⛔ Accès refusé. Aucun profil trouvé pour ce compte.');
            return;
        }

        const userData = userSnap.data();

        // Check if banned
        if (userData.banned) {
            await handleLogout();
            showLogin(`🚫 Compte suspendu.\n\nRaison : ${userData.banReason || 'Non précisée.'}\n\nContactez l'administrateur pour plus d'informations.`);
            return;
        }

        // Check if admin
        if (!userData.isAdmin) {
            await handleLogout();
            showLogin('⛔ Accès refusé. Ce compte ne dispose pas des droits administrateur.');
            return;
        }

    } catch (err) {
        console.error('Error checking admin status:', err);
        await handleLogout();
        showLogin('❌ Erreur de vérification des droits. Réessayez.');
        return;
    }

    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    document.getElementById('user-email').textContent = user.email;

    loadRecipes();
    loadUsers(); // Load users tab

    // WeMeal+ Data
    if (typeof loadPromos === 'function') loadPromos();
    if (typeof loadMonetizationStats === 'function') loadMonetizationStats();
}

// ============================================
// Firestore Operations
// ============================================

async function loadRecipes() {
    const { collection, getDocs } = window.firebaseFunctions;

    try {
        const recipesRef = collection(window.firebaseDb, 'recipes');
        const snapshot = await getDocs(recipesRef);

        recipes = [];
        snapshot.forEach(doc => {
            recipes.push({ id: doc.id, ...doc.data() });
        });

        updateStats();
        renderRecipes();
    } catch (error) {
        console.error('Error loading recipes:', error);
        document.getElementById('recipes-table').innerHTML = `
      <div class="empty-state">
        <p>Erreur de chargement. Vérifiez votre configuration Firebase.</p>
      </div>
    `;
    }
}

async function saveRecipe(recipeData) {
    const { collection, doc, setDoc, updateDoc } = window.firebaseFunctions;

    // Create a readable ID from recipe name
    const createSlug = (name) => {
        return name
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
            .replace(/^-+|-+$/g, '') // Trim dashes
            .substring(0, 50); // Limit length
    };

    try {
        if (editingRecipeId) {
            // Update existing
            const recipeRef = doc(window.firebaseDb, 'recipes', editingRecipeId);
            await updateDoc(recipeRef, recipeData);
        } else {
            // Add new with readable ID
            const recipeId = createSlug(recipeData.name) + '-' + Date.now().toString(36);
            const recipeRef = doc(window.firebaseDb, 'recipes', recipeId);
            await setDoc(recipeRef, recipeData);
        }

        closeModal();
        loadRecipes();
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Erreur lors de la sauvegarde');
    }
}

async function deleteRecipe(recipeId) {
    const { doc, deleteDoc } = window.firebaseFunctions;

    try {
        const recipeRef = doc(window.firebaseDb, 'recipes', recipeId);
        await deleteDoc(recipeRef);
        closeDeleteModal();
        loadRecipes();
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Erreur lors de la suppression');
    }
}

async function toggleVisibility(recipeId) {
    const { doc, updateDoc } = window.firebaseFunctions;
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    try {
        const recipeRef = doc(window.firebaseDb, 'recipes', recipeId);
        await updateDoc(recipeRef, { isVisible: !recipe.isVisible });
        loadRecipes();
    } catch (error) {
        console.error('Error toggling visibility:', error);
    }
}

// Sync recipes from static recipes.js file
async function syncStaticRecipes() {
    if (!window.recipesDatabase) {
        alert('Chargez d\'abord recipes.js dans cette page ou copiez les données manuellement');
        return;
    }

    if (!confirm(`Importer ${recipesDatabase.length} recettes depuis recipes.js ?\nCela peut prendre quelques minutes.`)) {
        return;
    }

    const { collection, addDoc, getDocs } = window.firebaseFunctions;
    const recipesRef = collection(window.firebaseDb, 'recipes');

    // Get existing recipe names to avoid duplicates
    const snapshot = await getDocs(recipesRef);
    const existingNames = new Set();
    snapshot.forEach(doc => existingNames.add(doc.data().name));

    let added = 0;
    let skipped = 0;

    for (const recipe of recipesDatabase) {
        if (existingNames.has(recipe.name)) {
            skipped++;
            continue;
        }

        try {
            await addDoc(recipesRef, {
                name: recipe.name,
                emoji: recipe.emoji || '🍽️',
                category: recipe.category || '',
                cuisine: recipe.cuisine || '',
                time: recipe.time || '',
                calories: recipe.calories || 0,
                sugar: recipe.sugar || 0,
                servings: recipe.servings || 4,
                glycemicIndex: recipe.glycemicIndex || 'medium',
                diabeticFriendly: recipe.diabeticFriendly || false,
                endometriosisFriendly: recipe.endometriosisFriendly || false,
                isVegetarian: recipe.isVegetarian || false,
                isVegan: recipe.isVegan || false,
                isVisible: true,
                weather: recipe.weather || [],
                season: recipe.season || [],
                keywords: recipe.keywords || [],
                ingredients: recipe.ingredients || [],
                steps: recipe.steps || []
            });
            added++;
        } catch (error) {
            console.error('Error adding recipe:', recipe.name, error);
        }
    }

    alert(`Import terminé !\n✅ ${added} recettes ajoutées\n⏭️ ${skipped} doublons ignorés`);
    loadRecipes();
}

// ============================================
// UI Rendering
// ============================================

function updateStats() {
    document.getElementById('total-recipes').textContent = recipes.length;
    document.getElementById('vegan-recipes').textContent = recipes.filter(r => r.isVegan).length;
    document.getElementById('veggie-recipes').textContent = recipes.filter(r => r.isVegetarian && !r.isVegan).length;
    document.getElementById('diabetic-recipes').textContent = recipes.filter(r => r.diabeticFriendly).length;
    document.getElementById('endo-recipes').textContent = recipes.filter(r => r.endometriosisFriendly).length;
    document.getElementById('glutenfree-recipes').textContent = recipes.filter(r => r.isGlutenFree).length;
}

function renderRecipes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;

    let filtered = recipes;

    // Apply stat card filter
    if (currentFilter === 'vegan') {
        filtered = filtered.filter(r => r.isVegan);
    } else if (currentFilter === 'vegetarian') {
        filtered = filtered.filter(r => r.isVegetarian && !r.isVegan);
    } else if (currentFilter === 'diabetic') {
        filtered = filtered.filter(r => r.diabeticFriendly);
    } else if (currentFilter === 'endo') {
        filtered = filtered.filter(r => r.endometriosisFriendly);
    } else if (currentFilter === 'glutenfree') {
        filtered = filtered.filter(r => r.isGlutenFree);
    }

    if (searchTerm) {
        filtered = filtered.filter(r =>
            r.name.toLowerCase().includes(searchTerm) ||
            (r.keywords && r.keywords.some(k => k.toLowerCase().includes(searchTerm)))
        );
    }

    if (categoryFilter) {
        filtered = filtered.filter(r => {
            const rc = r.category;
            if (Array.isArray(rc)) return rc.includes(categoryFilter);
            return rc === categoryFilter;
        });
    }

    const categoryTranslations = {
        'salad': 'Salade',
        'soup': 'Soupe',
        'pasta': 'Pâtes',
        'meat': 'Viande',
        'fish': 'Poisson',
        'veggie': 'Végétarien',
        'vegetarian': 'Végétarien',
        'vegan': 'Végétalien',
        'asian': 'Asiatique',
        'dessert': 'Dessert',
        'healthy': 'Healthy',
        'cheese': 'Fromage',
        'breakfast': 'Petit-Déj',
        'lunch': 'Déjeuner',
        'dinner': 'Dîner',
        'snack': 'Collation',
        'appetizer': 'Apéritif',
        'italian': 'Italien',
        'thai': 'Thaï',
        'mexican': 'Mexicain',
        'quick': 'Rapide',
        'comfort': 'Comfort Food'
    };

    const container = document.getElementById('recipes-table');

    if (filtered.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <p>Aucune recette trouvée</p>
      </div>
    `;
        return;
    }

    container.innerHTML = filtered.map(recipe => {
        const cats = Array.isArray(recipe.category) ? recipe.category : (recipe.category ? [recipe.category] : []);
        const displayCategory = cats.map(c => categoryTranslations[c] || c).join(', ') || 'Non catégorisé';
        return `
    <div class="recipe-row ${recipe.isVisible === false ? 'hidden-recipe' : ''}" data-id="${recipe.id}">
      <div class="recipe-emoji">${recipe.emoji || '🍽️'}</div>
      <div class="recipe-info">
        <span class="recipe-name">${recipe.name}</span>
        <span class="recipe-category">${displayCategory}</span>
      </div>
      <div class="recipe-badges">
        ${recipe.isVisible === false ? '<span class="mini-badge hidden-recipe">Masqué</span>' : ''}
        ${recipe.isVegan ? '<span class="mini-badge vegan">🌱 Végétalien</span>' : ''}
        ${recipe.isVegetarian && !recipe.isVegan ? '<span class="mini-badge vegetarian">🥬 Végé</span>' : ''}
        ${recipe.isGlutenFree ? '<span class="mini-badge glutenfree">🌾 Sans Gluten</span>' : ''}
        ${recipe.diabeticFriendly ? '<span class="mini-badge diabetic">🍬 Diabétique</span>' : ''}
        ${recipe.endometriosisFriendly ? '<span class="mini-badge endo"><svg width="12" height="12" viewBox="0 0 24 24" fill="#ec4899" style="vertical-align: middle; margin-right: 2px;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg> Endo</span>' : ''}
      </div>
      <div class="recipe-time">🕓 ${recipe.time || '-'}</div>
      <div class="recipe-calories">🔥 ${recipe.calories || '-'} kcal</div>
      <div class="recipe-actions">
        <button class="row-btn visibility ${recipe.isVisible === false ? 'hidden-off' : ''}" onclick="toggleVisibility('${recipe.id}')" title="${recipe.isVisible === false ? 'Afficher' : 'Masquer'}">
          ${recipe.isVisible === false ? '👁️‍🗨️' : '👁️'}
        </button>
        <button class="row-btn edit" onclick="openModal('${recipe.id}')" title="Modifier">✏️</button>
        <button class="row-btn delete" onclick="confirmDelete('${recipe.id}')" title="Supprimer">🗑️</button>
      </div>
    </div>
  `;
    }).join('');
}

// ============================================
// Modal Handling
// ============================================

function openModal(recipeId = null) {
    editingRecipeId = recipeId;
    const modal = document.getElementById('recipe-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('recipe-form');

    // Reset form
    form.reset();
    document.getElementById('recipe-visible').checked = true;
    // Clear tags
    document.querySelectorAll('#weather-tags .tag, #season-tags .tag, #category-tags .tag, #difficulty-tags .tag').forEach(t => t.classList.remove('active'));

    // Reset steps
    const container = document.getElementById('steps-container');
    container.innerHTML = '';
    addStepRow();

    if (recipeId) {
        title.textContent = 'Modifier la Recette';
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            populateForm(recipe);
        }
    } else {
        title.textContent = 'Nouvelle Recette';
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeModal() {
    document.getElementById('recipe-modal').classList.add('hidden');
    document.body.style.overflow = ''; // Restore scroll
    editingRecipeId = null;
}

// ============================================
// Step Management
// ============================================

function setupStepListeners() {
    document.getElementById('add-step-btn').addEventListener('click', () => addStepRow());
}

function addStepRow(text = '', timer = '') {
    const container = document.getElementById('steps-container');
    const index = container.children.length + 1;

    const div = document.createElement('div');
    div.className = 'step-row';
    div.innerHTML = `
        <div class="step-number">${index}</div>
        <div class="step-content">
            <textarea placeholder="Décrivez l'étape..." rows="2">${text}</textarea>
            <div class="step-options">
                <div class="timer-picker">
                    <span class="timer-picker-label">⏱️</span>
                    <button type="button" class="timer-btn minus" onclick="this.parentElement.querySelector('.timer-val').stepDown(); this.parentElement.querySelector('.timer-val').dispatchEvent(new Event('change'));">−</button>
                    <input type="number" class="step-timer timer-val" value="${timer}" placeholder="0" min="0" max="999">
                    <button type="button" class="timer-btn plus" onclick="this.parentElement.querySelector('.timer-val').stepUp(); this.parentElement.querySelector('.timer-val').dispatchEvent(new Event('change'));">+</button>
                    <span class="timer-picker-unit">min</span>
                </div>
            </div>
        </div>
        <button type="button" class="close-btn step-remove" title="Supprimer l'étape">&times;</button>
    `;

    // Remove listener
    div.querySelector('.step-remove').addEventListener('click', () => {
        div.remove();
        updateStepNumbers();
    });

    container.appendChild(div);
}

function updateStepNumbers() {
    document.querySelectorAll('.step-row .step-number').forEach((el, index) => {
        el.textContent = index + 1;
    });
}


function populateForm(recipe) {
    document.getElementById('recipe-name').value = recipe.name || '';
    document.getElementById('recipe-emoji').value = recipe.emoji || '';
    document.getElementById('recipe-cuisine').value = recipe.cuisine || '';

    // Category tags (multi-select)
    const categories = Array.isArray(recipe.category) ? recipe.category : (recipe.category ? [recipe.category] : []);
    document.querySelectorAll('#category-tags .tag').forEach(t => t.classList.remove('active'));
    categories.forEach(cat => {
        const catTag = document.querySelector(`#category-tags .tag[data-value="${cat}"]`);
        if (catTag) catTag.classList.add('active');
    });

    // Difficulty tag
    const diffVal = recipe.difficulty || '';
    if (diffVal) {
        const diffTag = document.querySelector(`#difficulty-tags .tag[data-value="${diffVal}"]`);
        if (diffTag) {
            document.querySelectorAll('#difficulty-tags .tag').forEach(t => t.classList.remove('active'));
            diffTag.classList.add('active');
        }
    }

    // Time Picker
    const minutes = parseTimeToMinutes(recipe.time);
    const timeInput = document.getElementById('recipe-time-value');
    const timeHidden = document.getElementById('recipe-time-slider');
    if (timeInput) timeInput.value = minutes;
    if (timeHidden) timeHidden.value = minutes;

    document.getElementById('recipe-calories').value = recipe.calories || '';
    document.getElementById('recipe-calories').value = recipe.calories || '';
    document.getElementById('recipe-sugar').value = recipe.sugar || '';
    document.getElementById('recipe-servings').value = recipe.servings || '';
    document.getElementById('recipe-gi').value = recipe.glycemicIndex || 'medium';
    document.getElementById('recipe-visible').checked = recipe.isVisible !== false;
    document.getElementById('recipe-diabetic').checked = recipe.diabeticFriendly || false;
    document.getElementById('recipe-endo').checked = recipe.endometriosisFriendly || false;
    document.getElementById('recipe-vegetarian').checked = recipe.isVegetarian || false;
    document.getElementById('recipe-vegan').checked = recipe.isVegan || false;
    document.getElementById('recipe-glutenfree').checked = recipe.isGlutenFree || false;
    document.getElementById('recipe-keywords').value = (recipe.keywords || []).join(', ');

    // Ingredients
    if (recipe.ingredients) {
        const ingredientLines = recipe.ingredients.map(ing => {
            if (typeof ing === 'string') return ing;
            return `${ing.name}, ${ing.qty}`;
        });
        document.getElementById('recipe-ingredients').value = ingredientLines.join('\n');
    }

    // Steps (Dynamic)
    const container = document.getElementById('steps-container');
    container.innerHTML = ''; // Clear previous

    if (recipe.steps && recipe.steps.length > 0) {
        recipe.steps.forEach(step => {
            if (typeof step === 'string') {
                // Legacy string format
                addStepRow(step, '');
            } else {
                // New object format
                addStepRow(step.text, step.timer || '');
            }
        });
    } else {
        // Add one empty row by default
        addStepRow();
    }

    // Weather tags
    (recipe.weather || []).forEach(w => {
        const tag = document.querySelector(`#weather-tags .tag[data-value="${w}"]`);
        if (tag) tag.classList.add('active');
    });

    // Season tags
    (recipe.season || []).forEach(s => {
        const tag = document.querySelector(`#season-tags .tag[data-value="${s}"]`);
        if (tag) tag.classList.add('active');
    });
}

function handleSaveRecipe(e) {
    e.preventDefault();

    // Get weather tags
    const weather = [];
    document.querySelectorAll('#weather-tags .tag.active').forEach(tag => {
        weather.push(tag.dataset.value);
    });

    // Get season tags
    const season = [];
    document.querySelectorAll('#season-tags .tag.active').forEach(tag => {
        season.push(tag.dataset.value);
    });

    // Parse ingredients
    const ingredientsText = document.getElementById('recipe-ingredients').value;
    const ingredients = ingredientsText.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { name: parts[0] || '', qty: parts[1] || '' };
    });

    // Parse Steps (Dynamic)
    const steps = [];
    document.querySelectorAll('.step-row').forEach(row => {
        const text = row.querySelector('textarea').value.trim();
        const timerVal = row.querySelector('.step-timer').value;
        const timer = timerVal ? parseInt(timerVal) : null;

        if (text) {
            steps.push({ text, timer });
        }
    });

    // Parse keywords (from hidden field, keep backward compat)
    const keywordsEl = document.getElementById('recipe-keywords');
    const keywords = keywordsEl ? keywordsEl.value.split(',').map(k => k.trim()).filter(k => k) : [];

    const recipeData = {
        name: document.getElementById('recipe-name').value,
        emoji: document.getElementById('recipe-emoji').value || '🍽️',
        category: Array.from(document.querySelectorAll('#category-tags .tag.active')).map(t => t.dataset.value),
        difficulty: (document.querySelector('#difficulty-tags .tag.active') || {}).dataset?.value || 'medium',
        cuisine: document.getElementById('recipe-cuisine').value,
        time: formatMinutes(parseInt(document.getElementById('recipe-time-slider').value)),
        calories: parseInt(document.getElementById('recipe-calories').value) || 0,
        calories: parseInt(document.getElementById('recipe-calories').value) || 0,
        sugar: parseInt(document.getElementById('recipe-sugar').value) || 0,
        servings: parseInt(document.getElementById('recipe-servings').value) || 4,
        glycemicIndex: document.getElementById('recipe-gi').value,
        isVisible: document.getElementById('recipe-visible').checked,
        diabeticFriendly: document.getElementById('recipe-diabetic').checked,
        endometriosisFriendly: document.getElementById('recipe-endo').checked,
        isVegetarian: document.getElementById('recipe-vegetarian').checked,
        isVegan: document.getElementById('recipe-vegan').checked,
        isGlutenFree: document.getElementById('recipe-glutenfree').checked,
        weather,
        season,
        keywords,
        ingredients,
        steps
    };

    saveRecipe(recipeData);
}

// ============================================
// Delete Confirmation
// ============================================

let deleteRecipeId = null;

function confirmDelete(recipeId) {
    deleteRecipeId = recipeId;
    const recipe = recipes.find(r => r.id === recipeId);
    document.getElementById('delete-recipe-name').textContent = recipe ? recipe.name : '';
    document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    deleteRecipeId = null;
}

function handleDeleteRecipe() {
    if (deleteRecipeId) {
        deleteRecipe(deleteRecipeId);
    }
}

// ============================================
// Import: PDF (text extraction) + Image (OCR)
// ============================================

function setupOcrListeners() {
    const closeBtn = document.getElementById('close-ocr-modal');
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('ocr-file-input');
    const useTextBtn = document.getElementById('use-ocr-text');

    closeBtn.addEventListener('click', closeOcrModal);

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    });

    useTextBtn.addEventListener('click', () => {
        const text = document.getElementById('ocr-text').value;
        closeOcrModal();
        openModal();
        parseOcrTextToForm(text);
    });
}

function openOcrModal() {
    document.getElementById('ocr-modal').classList.remove('hidden');
    document.getElementById('ocr-preview').classList.add('hidden');
    document.getElementById('ocr-status').classList.add('hidden');
    document.getElementById('ocr-result').classList.add('hidden');
    document.getElementById('upload-zone').style.display = 'block';
    document.getElementById('ocr-file-input').value = '';
}

function closeOcrModal() {
    document.getElementById('ocr-modal').classList.add('hidden');
}

/**
 * Smart file processing:
 * - PDF files → pdf.js direct text extraction (100% reliable)
 * - Image files → Tesseract.js OCR (pixel-based recognition)
 */
async function processFile(file) {
    const preview = document.getElementById('ocr-preview');
    const previewImg = document.getElementById('ocr-image');
    const pdfCanvas = document.getElementById('ocr-pdf-canvas');
    const status = document.getElementById('ocr-status');
    const statusText = document.getElementById('ocr-status-text');
    const result = document.getElementById('ocr-result');
    const uploadZone = document.getElementById('upload-zone');
    const methodBadge = document.getElementById('ocr-method-badge');

    // Hide upload, show status
    uploadZone.style.display = 'none';
    status.classList.remove('hidden');
    result.classList.add('hidden');

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    try {
        let extractedText = '';

        if (isPdf) {
            // ============ PDF: Direct text extraction with pdf.js ============
            statusText.textContent = '📄 Extraction du texte du PDF...';

            // Wait for pdf.js to load
            let attempts = 0;
            while (!window.pdfjsLib && attempts < 20) {
                await new Promise(r => setTimeout(r, 250));
                attempts++;
            }

            if (!window.pdfjsLib) {
                throw new Error('PDF.js n\'a pas pu se charger. Rafraîchissez la page.');
            }

            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Show PDF preview (render first page to canvas)
            preview.classList.remove('hidden');
            previewImg.style.display = 'none';
            pdfCanvas.style.display = 'block';

            try {
                const firstPage = await pdf.getPage(1);
                const viewport = firstPage.getViewport({ scale: 1.0 });
                const scale = Math.min(400 / viewport.width, 1.5);
                const scaledViewport = firstPage.getViewport({ scale });
                pdfCanvas.width = scaledViewport.width;
                pdfCanvas.height = scaledViewport.height;
                const ctx = pdfCanvas.getContext('2d');
                await firstPage.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
            } catch (renderErr) {
                console.warn('PDF preview render failed (non-critical):', renderErr);
            }

            // Extract text from ALL pages
            const totalPages = pdf.numPages;
            const allPageTexts = [];

            for (let i = 1; i <= totalPages; i++) {
                statusText.textContent = `📄 Lecture page ${i}/${totalPages}...`;
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Reconstruct text with proper line breaks
                let pageText = '';
                let lastY = null;

                for (const item of textContent.items) {
                    if (item.str === undefined) continue;

                    // Detect line breaks by Y position change
                    const currentY = Math.round(item.transform[5]);
                    if (lastY !== null && Math.abs(currentY - lastY) > 2) {
                        pageText += '\n';
                    } else if (lastY !== null && pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
                        pageText += ' ';
                    }

                    pageText += item.str;
                    lastY = currentY;
                }

                if (pageText.trim()) {
                    allPageTexts.push(pageText.trim());
                }
            }

            extractedText = allPageTexts.join('\n\n--- Page suivante ---\n\n');

            // Check if we got meaningful text
            if (extractedText.trim().length < 10) {
                // PDF might be scanned images (no text layer) → fall back to OCR
                statusText.textContent = '🔍 PDF scanné détecté, OCR en cours...';
                methodBadge.textContent = '🔍 OCR (PDF scanné)';
                methodBadge.style.background = 'rgba(255, 165, 0, 0.3)';

                // Render first page to canvas for OCR
                const firstPage = await pdf.getPage(1);
                const viewport = firstPage.getViewport({ scale: 2.0 }); // Higher res for better OCR
                const ocrCanvas = document.createElement('canvas');
                ocrCanvas.width = viewport.width;
                ocrCanvas.height = viewport.height;
                const ctx = ocrCanvas.getContext('2d');
                await firstPage.render({ canvasContext: ctx, viewport }).promise;

                // Convert canvas to blob for Tesseract
                const blob = await new Promise(resolve => ocrCanvas.toBlob(resolve, 'image/png'));
                const { data: { text } } = await Tesseract.recognize(blob, 'fra', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            statusText.textContent = `🔍 OCR: ${Math.round(m.progress * 100)}%`;
                        }
                    }
                });
                extractedText = text;
            } else {
                methodBadge.textContent = '✅ Extraction PDF directe';
                methodBadge.style.background = 'rgba(0, 200, 80, 0.3)';
            }

        } else {
            // ============ Image: Tesseract.js OCR ============
            statusText.textContent = '🔍 Reconnaissance du texte (OCR)...';

            // Show image preview
            preview.classList.remove('hidden');
            previewImg.style.display = 'block';
            pdfCanvas.style.display = 'none';
            previewImg.src = URL.createObjectURL(file);

            const { data: { text } } = await Tesseract.recognize(file, 'fra', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        statusText.textContent = `🔍 OCR: ${Math.round(m.progress * 100)}%`;
                    }
                }
            });

            extractedText = text;
            methodBadge.textContent = '🔍 OCR Image';
            methodBadge.style.background = 'rgba(100, 150, 255, 0.3)';
        }

        // Clean up extracted text
        extractedText = cleanExtractedText(extractedText);

        // Show result
        status.classList.add('hidden');
        result.classList.remove('hidden');
        document.getElementById('ocr-text').value = extractedText;

    } catch (error) {
        console.error('Import Error:', error);
        status.innerHTML = `<p>❌ Erreur: ${error.message || 'Impossible de lire le fichier'}</p>
            <button class="btn btn-glass" onclick="openOcrModal()" style="margin-top:10px;">🔄 Réessayer</button>`;
    }
}

/**
 * Clean up raw extracted text: remove noise, fix spacing, normalize
 */
function cleanExtractedText(text) {
    return text
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        // Remove excessive blank lines (keep max 2)
        .replace(/\n{3,}/g, '\n\n')
        // Remove leading/trailing whitespace per line
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        // Remove completely empty result
        .trim();
}

function parseOcrTextToForm(text) {
    // Try to extract recipe components from OCR text
    const lines = text.split('\n').filter(l => l.trim());

    // First non-empty line is likely the title
    if (lines.length > 0) {
        document.getElementById('recipe-name').value = lines[0].trim();
    }

    // Look for ingredients section
    const ingredientKeywords = ['ingrédients', 'ingredients', 'pour', 'il vous faut', 'il te faut', 'liste des'];
    const stepKeywords = ['préparation', 'preparation', 'étapes', 'instructions', 'recette', 'méthode', 'procédure', 'réalisation', 'déroulement'];
    const endKeywords = ['conseils', 'astuce', 'variante', 'note', 'bon appétit', 'suggestion'];

    let inIngredients = false;
    let inSteps = false;
    const ingredients = [];
    const steps = [];

    for (const line of lines.slice(1)) {
        const lower = line.toLowerCase().trim();

        // Skip page separators
        if (lower.includes('--- page')) continue;

        // Detect section headers
        if (ingredientKeywords.some(k => lower.includes(k))) {
            inIngredients = true;
            inSteps = false;
            continue;
        }

        if (stepKeywords.some(k => lower.includes(k))) {
            inSteps = true;
            inIngredients = false;
            continue;
        }

        if (endKeywords.some(k => lower.includes(k))) {
            inSteps = false;
            inIngredients = false;
            continue;
        }

        // Clean step numbering (e.g., "1. ", "1) ", "Étape 1: ")
        let cleanLine = line.trim()
            .replace(/^(\d+[\.\)\-:]\s*)/, '')
            .replace(/^(étape\s*\d+\s*[:\.]\s*)/i, '')
            .replace(/^[-•·]\s*/, '');

        if (inIngredients && cleanLine) {
            ingredients.push(cleanLine);
        } else if (inSteps && cleanLine) {
            steps.push(cleanLine);
        }
    }

    if (ingredients.length > 0) {
        document.getElementById('recipe-ingredients').value = ingredients.join('\n');
    }

    if (steps.length > 0) {
        // Clear existing steps
        document.getElementById('steps-container').innerHTML = '';

        // Add dynamic rows for each step
        steps.forEach(step => addStepRow(step));
    }
}

// ============================================
// Export to recipes.js
// ============================================

function setupExportListeners() {
    document.getElementById('close-export-modal').addEventListener('click', closeExportModal);
    document.getElementById('copy-export').addEventListener('click', copyExportCode);
    document.getElementById('download-export').addEventListener('click', downloadExportFile);
}

function openExportModal() {
    document.getElementById('export-modal').classList.remove('hidden');

    // Generate recipes.js code
    const visibleRecipes = recipes.filter(r => r.isVisible !== false);

    const code = `// ============================================
// WeMeal - Recipe Database
// Generated from Firebase: ${new Date().toLocaleDateString('fr-FR')}
// ============================================

const recipesDatabase = ${JSON.stringify(visibleRecipes, null, 2)};

// Expose globally for admin panel sync
window.recipesDatabase = recipesDatabase;
`;

    document.getElementById('export-code').value = code;
}

function closeExportModal() {
    document.getElementById('export-modal').classList.add('hidden');
}

function copyExportCode() {
    const textarea = document.getElementById('export-code');
    textarea.select();
    document.execCommand('copy');
    alert('✅ Code copié dans le presse-papier !');
}

function downloadExportFile() {
    const code = document.getElementById('export-code').value;
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes.js';
    a.click();
    URL.revokeObjectURL(url);
}

// Make functions globally accessible
window.openModal = openModal;
window.confirmDelete = confirmDelete;
window.toggleVisibility = toggleVisibility;

// ============================================
// User Management
// ============================================

let allUsers = [];
let userSearchTerm = '';

async function loadUsers() {
    const { collection, getDocs } = window.firebaseFunctions;
    const db = window.firebaseDb;
    const container = document.getElementById('users-table');
    if (!container) return;

    container.innerHTML = '<div class="empty-state"><div class="spinner-small"></div><p>Chargement des comptes...</p></div>';

    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        allUsers = [];
        snapshot.forEach(docSnap => {
            allUsers.push({ uid: docSnap.id, ...docSnap.data() });
        });

        // Update user count stat
        const el = document.getElementById('total-users');
        if (el) el.textContent = allUsers.length;

        renderUsers();
    } catch (err) {
        console.error('Error loading users:', err);
        container.innerHTML = '<div class="empty-state"><p>Erreur lors du chargement des comptes.</p></div>';
    }
}

function renderUsers() {
    const container = document.getElementById('users-table');
    if (!container) return;

    const search = (document.getElementById('user-search-input')?.value || '').toLowerCase();
    const filtered = allUsers.filter(u =>
        (u.email || '').toLowerCase().includes(search) ||
        ((u.profile?.name) || '').toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Aucun compte trouvé</p></div>';
        return;
    }

    container.innerHTML = filtered.map(u => {
        const name = u.profile?.name || '<em>Sans profil</em>';
        const platform = u.platform || 'web';
        const platformIcon = platform === 'ios' ? '🍎' : '🌐';
        const isAdmin = u.isAdmin ? '🛡️ Admin' : '👤 Utilisateur';
        const isBanned = u.banned;
        let createdAt = '—';
        if (u.createdAt) {
            let d;
            if (u.createdAt.toDate) d = u.createdAt.toDate();
            else if (u.createdAt.seconds) d = new Date(u.createdAt.seconds * 1000);
            else d = new Date(u.createdAt);
            if (!isNaN(d.getTime())) createdAt = d.toLocaleDateString('fr-FR');
        }

        const diet = [];
        const prefs = u.preferences || {};
        if (prefs.diabetic || u.isDiabetic) diet.push('🍬');
        if (prefs.endo || prefs.isEndo || u.isEndo) diet.push('<svg width="22" height="22" viewBox="0 0 24 24" fill="#ec4899"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>');
        if (prefs.vegetarian || u.isVegetarian) diet.push('🥬');
        if (prefs.vegan || u.isVegan) diet.push('🌱');
        if (prefs.isGlutenFree || prefs.glutenFree || u.isGlutenFree) diet.push('🌾');

        const favCount = (u.favorites || []).length;
        const histCount = (u.history || []).length;

        return `
        <div class="user-row ${isBanned ? 'banned-row' : ''}" onclick="openUserDetailsModal('${u.uid}')">
            <div class="user-avatar-cell">
                <div class="user-avatar-bubble" style="background: ${isBanned ? '#ef4444' : 'var(--primary)'};">${(u.profile?.avatar && (u.profile.avatar.startsWith('http') || u.profile.avatar.startsWith('data:image'))) ? `<img src="${u.profile.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">` : (u.profile?.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?')}</div>
            </div>
            <div class="user-info-cell">
                <span class="user-name">
                    ${name} 
                    ${isBanned ? '<span class="mini-badge danger">Banni</span>' : ''}
                    ${u.isPremium ? '<span class="mini-badge" style="background:rgba(245,158,11,0.2);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);">✨ Premium</span>' : ''}
                </span>
                <span class="user-email-text">${u.email || '—'}</span>
                <span class="user-meta">${platformIcon} ${platform.toUpperCase()} · ${isAdmin} · Inscrit: ${createdAt}</span>
            </div>
            <div class="user-stats-cell">
                <span title="Favoris">❤️ ${favCount}</span>
                <span title="Recettes cuisinées">🍳 ${histCount}</span>
                <span title="Régimes">${diet.join(' ') || '—'}</span>
            </div>
            <div class="user-actions-cell" style="display: flex; gap: 8px; flex-wrap: wrap;" onclick="event.stopPropagation();">
                ${isBanned
                ? `<button class="row-btn edit" onclick="unbanUser('${u.uid}')" title="Débannir">✅ Débannir</button>`
                : `<button class="row-btn delete" onclick="openBanModal('${u.uid}', '${(u.email || '').replace(/'/g, "\\'")}') " title="Bannir">🚫 Bannir</button>`
            }
                <button class="row-btn visibility" onclick="toggleUserPremium('${u.uid}', ${!!u.isPremium})" style="border-color:${u.isPremium ? '#ef4444' : '#f59e0b'}; color:${u.isPremium ? '#ef4444' : '#f59e0b'}">
                    ${u.isPremium ? 'Rétrograder (Gratuit)' : '✨ Upgrader Premium'}
                </button>
                ${u.stripeCustomerId ? `
                <button class="row-btn" style="background:var(--primary); color:white; border:none;" onclick="openInvoiceForUser('${u.stripeCustomerId}')" title="Voir la dernière facture Stripe">
                    🧾 Facture Stripe
                </button>` : ''}
                <button class="row-btn visibility" onclick="sendPasswordReset('${(u.email || '').replace(/'/g, "\\'")}') " title="Réinitialiser mot de passe">🔑 MDP</button>
                <button class="row-btn edit" onclick="toggleAdminRole('${u.uid}', ${u.isAdmin})" title="${u.isAdmin ? 'Retirer Admin' : 'Mettre Admin'}">🛡️ ${u.isAdmin ? 'Retirer' : 'Admin'}</button>
                <button class="row-btn visibility" onclick="forceLogout('${u.uid}')" title="Déconnecter de tous les appareils">🔌 Déco.</button>
                <button class="row-btn delete" onclick="openDeleteUserModal('${u.uid}', '${(u.email || '').replace(/'/g, "\\'")}') " title="Supprimer le compte">🗑️ Supprimer</button>
            </div>
        </div>`;
    }).join('');
}

function openBanModal(uid, email) {
    window._banTargetUid = uid;
    window._banTargetEmail = email;
    const modal = document.getElementById('ban-modal');
    document.getElementById('ban-target-email').textContent = email;
    document.getElementById('ban-reason-input').value = '';
    if (modal) modal.classList.remove('hidden');
}

function closeBanModal() {
    const modal = document.getElementById('ban-modal');
    if (modal) modal.classList.add('hidden');
}

async function confirmBan() {
    const uid = window._banTargetUid;
    const reason = document.getElementById('ban-reason-input').value.trim() || 'Violation des conditions d\'utilisation.';
    const { doc, updateDoc } = window.firebaseFunctions;
    try {
        await updateDoc(doc(window.firebaseDb, 'users', uid), {
            banned: true,
            banReason: reason,
            bannedAt: new Date().toISOString()
        });
        closeBanModal();
        loadUsers();
        showAdminToast('✅ Compte banni avec succès.');
    } catch (err) {
        console.error('Ban error:', err);
        showAdminToast('❌ Erreur lors du bannissement.');
    }
}

async function unbanUser(uid) {
    if (!confirm('Voulez-vous vraiment débannir ce compte ?')) return;
    const { doc, updateDoc } = window.firebaseFunctions;
    try {
        await updateDoc(doc(window.firebaseDb, 'users', uid), {
            banned: false,
            banReason: '',
            bannedAt: null
        });
        loadUsers();
        showAdminToast('✅ Compte débanni avec succès.');
    } catch (err) {
        console.error('Unban error:', err);
        showAdminToast('❌ Erreur lors du débannissement.');
    }
}

async function sendPasswordReset(email) {
    if (!email) return;
    if (!confirm(`Envoyer un email de réinitialisation de mot de passe à ${email} ?`)) return;
    try {
        const { sendPasswordResetEmail } = window.firebaseFunctions;
        if (!sendPasswordResetEmail) {
            // Fallback if not imported
            showAdminToast('⚠️ Fonction non disponible. Ajoutez sendPasswordResetEmail aux imports Firebase.');
            return;
        }
        await sendPasswordResetEmail(window.firebaseAuth, email);
        showAdminToast(`✅ Email de réinitialisation envoyé à ${email}`);
    } catch (err) {
        console.error('Password reset error:', err);
        showAdminToast('❌ Erreur lors de l\'envoi de l\'email.');
    }
}

async function toggleAdminRole(uid, currentIsAdmin) {
    const action = currentIsAdmin ? 'retirer les droits admin de' : 'promouvoir admin';
    if (!confirm(`Voulez-vous vraiment ${action} ce compte ?`)) return;
    const { doc, updateDoc } = window.firebaseFunctions;
    try {
        await updateDoc(doc(window.firebaseDb, 'users', uid), {
            isAdmin: !currentIsAdmin
        });
        loadUsers();
        showAdminToast(`✅ Rôle mis à jour.`);
    } catch (err) {
        console.error('Role update error:', err);
        showAdminToast('❌ Erreur lors de la mise à jour du rôle.');
    }
}

function showAdminToast(msg) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:rgba(30,30,40,0.95);color:white;padding:12px 24px;border-radius:12px;font-size:0.95rem;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);transition:opacity 0.3s;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// Expose user management functions globally
window.loadUsers = loadUsers;
window.openBanModal = openBanModal;
window.closeBanModal = closeBanModal;
window.confirmBan = confirmBan;
window.unbanUser = unbanUser;
window.sendPasswordReset = sendPasswordReset;
window.toggleAdminRole = toggleAdminRole;

// ============================================
// Delete User Account
// ============================================

function openDeleteUserModal(uid, email) {
    window._deleteTargetUid = uid;
    window._deleteTargetEmail = email;
    const modal = document.getElementById('delete-user-modal');
    if (modal) {
        document.getElementById('delete-user-target-email').textContent = email;
        modal.classList.remove('hidden');
    }
}

function closeDeleteUserModal() {
    const modal = document.getElementById('delete-user-modal');
    if (modal) modal.classList.add('hidden');
}

async function deleteUserAccount() {
    const uid = window._deleteTargetUid;
    if (!uid) return;

    const { doc, deleteDoc, httpsCallable } = window.firebaseFunctions;

    try {
        if (typeof httpsCallable === 'function') {
            const deleteUserFn = httpsCallable('deleteUser');
            await deleteUserFn({ uid: uid });
        } else {
            console.warn("Firebase functions httpsCallable not initialized, cannot delete from Auth.");
        }

        // Delete the Firestore document
        await deleteDoc(doc(window.firebaseDb, 'users', uid));

        closeDeleteUserModal();
        loadUsers();
        showAdminToast('🗑️ Compte supprimé avec succès.');
    } catch (err) {
        console.error('Delete user error:', err);
        showAdminToast('❌ Erreur lors de la suppression du compte.');
    }
}

async function forceLogout(uid) {
    if (!confirm('Voulez-vous vraiment déconnecter cet utilisateur de tous ses appareils ?')) return;

    const { doc, updateDoc } = window.firebaseFunctions;
    try {
        await updateDoc(doc(window.firebaseDb, 'users', uid), {
            sessionVersion: Date.now()
        });
        showAdminToast('🔌 Déconnexion forcée envoyée.');
    } catch (err) {
        console.error('Force logout error:', err);
        showAdminToast('❌ Erreur lors de la déconnexion forcée.');
    }
}

window.openDeleteUserModal = openDeleteUserModal;
window.closeDeleteUserModal = closeDeleteUserModal;
window.deleteUserAccount = deleteUserAccount;
window.forceLogout = forceLogout;

// ============================================
// WEMEAL+ PROMO CODES MANAGEMENT
// ============================================

let currentPromos = [];

async function loadPromos() {
    try {
        const { collection, getDocs } = window.firebaseFunctions;
        const db = window.firebaseDb;
        const promosSnapshot = await getDocs(collection(db, "promo_codes"));

        currentPromos = promosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderPromos();
    } catch (error) {
        console.error("Error loading promos:", error);
        const table = document.getElementById('promos-table');
        if (table) table.innerHTML = '<div class="empty-state"><p>Erreur lors du chargement des codes promo.</p></div>';
    }
}

function renderPromos() {
    const tableDiv = document.getElementById('promos-table');
    if (!tableDiv) return;

    if (!currentPromos || currentPromos.length === 0) {
        tableDiv.innerHTML = '<div class="empty-state"><p>Aucun code promo créé.</p></div>';
        return;
    }

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>CODE</th>
                    <th>RÉDUCTION</th>
                    <th>UTILISATIONS</th>
                    <th>CRÉÉ LE</th>
                    <th>STATUT</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
    `;

    currentPromos.forEach(promo => {
        const dateStr = promo.createdAt ? new Date(promo.createdAt).toLocaleDateString() : '-';
        html += `
            <tr>
                <td><strong>${promo.id}</strong></td>
                <td>${promo.discount ? promo.discount + '%' : '-'}</td>
                <td>${promo.maxUses ? ((promo.maxUses - (promo.totalUses || 0)) + ' / ' + promo.maxUses) : '∞'}</td>
                <td>${dateStr}</td>
                <td>
                    <span class="user-status-badge ${promo.isActive ? 'active' : 'banned'}">
                        ${promo.isActive ? '🟢 Actif' : '🔴 Inactif'}
                    </span>
                </td>
                <td style="display: flex; gap: 8px;">
                    <button class="btn btn-glass btn-small" onclick="togglePromoStatus('${promo.id}', ${promo.isActive})">
                        ${promo.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deletePromo('${promo.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    tableDiv.innerHTML = html;
}

window.openPromoModal = function () {
    document.getElementById('promo-code-name').value = '';
    document.getElementById('promo-code-discount').value = '';
    document.getElementById('promo-code-active').checked = true;
    const modal = document.getElementById('promo-modal');
    if (modal) modal.classList.remove('hidden');
};

window.closePromoModal = function () {
    const modal = document.getElementById('promo-modal');
    if (modal) modal.classList.add('hidden');
};

window.savePromoCode = async function () {
    const code = document.getElementById('promo-code-name').value.trim().toUpperCase();
    const discount = document.getElementById('promo-code-discount').value;
    const isActive = document.getElementById('promo-code-active').checked;
    let maxUses = document.getElementById('promo-code-limit').value;

    if (!code || !discount) {
        alert("Nom et réduction requis.");
        return;
    }

    const discountNum = parseFloat(discount);
    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
        alert("La réduction doit être entre 1 et 100.");
        return;
    }

    const { doc, setDoc } = window.firebaseFunctions;
    const { httpsCallable } = window.firebaseFunctions;
    const db = window.firebaseDb;
    const createStripePromo = httpsCallable('createStripePromo');

    try {
        const payload = {
            code: code,
            discount: discountNum,
            isActive: isActive
        };
        if (maxUses && parseInt(maxUses) > 0) {
            payload.maxRedemptions = parseInt(maxUses);
        }

        showAdminToast('⌛ Création sur Stripe...');
        const stripeResult = await createStripePromo(payload);
        const stripePromoId = stripeResult?.data?.promoId || null;

        // 2. Save to local Firestore for indexing (including Stripe promo ID for checkout URL)
        const firestorePromoData = {
            discount: discountNum,
            isActive: isActive,
            stripePromoId: stripePromoId,
            createdAt: new Date().toISOString()
        };
        if (maxUses && parseInt(maxUses) > 0) {
            firestorePromoData.maxUses = parseInt(maxUses);
        }
        await setDoc(doc(db, "promo_codes", code), firestorePromoData);

        window.closePromoModal();
        loadPromos();
        showAdminToast('✅ Code promo synchronisé avec Stripe !');
    } catch (error) {
        console.error("Error saving promo:", error);
        alert("Erreur lors de la sauvegarde sur Stripe ou Firestore : " + error.message);
    }
};

window.togglePromoStatus = async function (code, currentStatus) {
    try {
        const { doc, updateDoc } = window.firebaseFunctions;
        const db = window.firebaseDb;
        await updateDoc(doc(db, "promo_codes", code), {
            isActive: !currentStatus
        });
        loadPromos();
    } catch (error) {
        console.error("Error toggling promo status:", error);
        alert("Erreur lors de la mise à jour du statut.");
    }
};

window.deletePromo = async function (code) {
    if (!confirm(`Supprimer définitivement le code promo ${code} ?`)) return;

    try {
        const { doc, deleteDoc } = window.firebaseFunctions;
        const db = window.firebaseDb;
        await deleteDoc(doc(db, "promo_codes", code));
        loadPromos();
    } catch (error) {
        console.error("Error deleting promo:", error);
        alert("Erreur lors de la suppression.");
    }
};

// ============================================
// PREMIUM USER TOGGLE & MONETIZATION
// ============================================
window.toggleUserPremium = async function (uid, isCurrentlyPremium) {
    if (!confirm(`Voulez-vous ${isCurrentlyPremium ? 'révoquer' : 'activer'} l'abonnement Premium pour cet utilisateur ?`)) return;

    const { doc, updateDoc } = window.firebaseFunctions;
    const db = window.firebaseDb;

    try {
        const updateData = {
            isPremium: !isCurrentlyPremium
        };
        // If we are revoking premium, also reset the expiration date
        if (isCurrentlyPremium) {
            updateData.premiumUntil = null;
        }

        await updateDoc(doc(db, "users", uid), updateData);
        loadUsers(); // Refresh table
    } catch (error) {
        console.error("Error toggling Premium status:", error);
        alert("Erreur lors de la modification du statut Premium.");
    }
};

window.loadMonetizationStats = async function () {
    const { httpsCallable } = window.firebaseFunctions;

    try {
        const getStripeStats = httpsCallable('getStripeStats');
        const { data } = await getStripeStats();

        const activeSubsEl = document.getElementById('active-subs');
        if (activeSubsEl) activeSubsEl.textContent = data.activeSubscriptions;

        const revEl = document.getElementById('monthly-revenue');
        if (revEl) revEl.textContent = `${data.monthlyRecurringRevenueEur} €`;

        // Update conversion rate if users are loaded
        if (allUsers && allUsers.length > 0) {
            const rate = ((data.activeSubscriptions / allUsers.length) * 100).toFixed(1);
            const rateEl = document.getElementById('conversion-rate');
            if (rateEl) rateEl.textContent = `${rate}%`;
        }
    } catch (error) {
        console.error("Error loading Stripe stats:", error);
    }

    // --- Total users ---
    const totalUsersEl = document.getElementById('monetization-total-users');
    if (totalUsersEl && allUsers) {
        totalUsersEl.textContent = allUsers.length;
    }

    // --- Growth chart (registrations per day, last 7 days) ---
    const chartEl = document.getElementById('growth-chart');
    if (chartEl && allUsers && allUsers.length > 0) {
        const now = new Date();
        const days = [];
        const counts = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
            days.push(label);
            const dayStr = d.toISOString().slice(0, 10);
            const count = currentUsers.filter(u => {
                const created = u.createdAt?.toDate ? u.createdAt.toDate() : (u.createdAt ? new Date(u.createdAt) : null);
                return created && created.toISOString().slice(0, 10) === dayStr;
            }).length;
            counts.push(count);
        }
        const max = Math.max(...counts, 1);
        chartEl.innerHTML = counts.map((c, i) => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <span style="font-size:0.75rem;color:var(--text-secondary);">${c}</span>
                <div style="width:100%;height:${Math.max((c / max) * 100, 4)}px;background:var(--gradient-accent);border-radius:6px 6px 2px 2px;transition:height 0.5s ease;"></div>
                <span style="font-size:0.65rem;color:var(--text-muted);">${days[i]}</span>
            </div>
        `).join('');
    }

    // --- Recent premium subscribers ---
    const premiumTable = document.getElementById('recent-premium-table');
    if (premiumTable && currentUsers) {
        const premiumUsers = currentUsers
            .filter(u => u.isPremium || u.premiumUntil)
            .sort((a, b) => {
                const da = a.premiumSince?.toDate ? a.premiumSince.toDate() : (a.premiumSince ? new Date(a.premiumSince) : new Date(0));
                const db = b.premiumSince?.toDate ? b.premiumSince.toDate() : (b.premiumSince ? new Date(b.premiumSince) : new Date(0));
                return db - da;
            })
            .slice(0, 10);

        if (premiumUsers.length === 0) {
            premiumTable.innerHTML = '<div class="empty-state"><p>Aucun abonné Premium pour le moment.</p></div>';
        } else {
            premiumTable.innerHTML = premiumUsers.map(u => {
                const since = u.premiumSince?.toDate ? u.premiumSince.toDate() : (u.premiumSince ? new Date(u.premiumSince) : null);
                const dateStr = since ? since.toLocaleDateString('fr-FR') : '—';
                return `
                    <div class="recipe-row" style="cursor:default;">
                        <div class="recipe-emoji" style="font-size:1.5rem;">⭐</div>
                        <div class="recipe-info">
                            <span class="recipe-name">${u.displayName || u.email || 'Inconnu'}</span>
                            <span class="recipe-category">${u.email || ''}</span>
                        </div>
                        <div class="recipe-time" style="color:var(--text-secondary);">Depuis ${dateStr}</div>
                    </div>
                `;
            }).join('');
        }
    }
};

window.openInvoiceForUser = async function (stripeCustomerId) {
    if (!stripeCustomerId) {
        alert("Cet utilisateur n'a pas encore d'identifiant Stripe Customer.");
        return;
    }

    const { httpsCallable } = window.firebaseFunctions;

    try {
        showAdminToast('⌛ Récupération de la facture...');
        const getUserInvoiceUrl = httpsCallable('getUserInvoiceUrl');
        const { data } = await getUserInvoiceUrl({ stripeCustomerId });

        if (data.url) {
            window.open(data.url, '_blank');
        } else {
            alert("Aucune facture trouvée pour ce client Stripe.");
        }
    } catch (error) {
        console.error("Error opening invoice:", error);
        alert("Erreur lors de la récupération de la facture Stripe.");
    }
};

window.generateInvoiceModal = function () {
    alert("Veuillez cliquer sur le bouton facture à côté d'un utilisateur pour voir sa dernière facture Stripe.");
};

// ============================================
// PROMO SUB-TABS (STRIPE vs BENEFITS)
// ============================================
function setupPromoSubTabs() {
    const tabBtns = document.querySelectorAll('.promo-tab-btn');
    const panes = document.querySelectorAll('.promo-pane');

    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            panes.forEach(p => p.classList.add('hidden'));

            btn.classList.add('active');
            const targetPane = document.getElementById(btn.dataset.subtab + '-pane');
            if (targetPane) {
                targetPane.classList.remove('hidden');
                targetPane.classList.add('active');
            }
        };
    });
}

// ============================================
// BENEFIT CODES MANAGEMENT
// ============================================
let currentBenefits = [];

async function loadBenefitCodes() {
    try {
        const { collection, getDocs } = window.firebaseFunctions;
        const db = window.firebaseDb;
        const snap = await getDocs(collection(db, "benefit_codes"));

        currentBenefits = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderBenefits();
    } catch (error) {
        console.error("Error loading benefits:", error);
    }
}

function renderBenefits() {
    const tableDiv = document.getElementById('benefits-table');
    if (!tableDiv) return;

    if (!currentBenefits || currentBenefits.length === 0) {
        tableDiv.innerHTML = '<div class="empty-state"><p>Aucun code d\'avantage créé.</p></div>';
        return;
    }

    const typeLabels = {
        '1_year': '🎁 1 An WeMeal+',
        'lifetime': '♾️ Accès à Vie',
        'debug': '🔧 Mode Debug'
    };

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>CODE</th>
                    <th>TYPE</th>
                    <th>ACTIF</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
    `;

    currentBenefits.forEach(benefit => {
        html += `
            <tr>
                <td><strong>${benefit.id}</strong></td>
                <td>${typeLabels[benefit.type] || benefit.type}</td>
                <td>
                    <span class="user-status-badge ${benefit.isActive ? 'active' : 'banned'}">
                        ${benefit.isActive ? '🟢 Oui' : '🔴 Non'}
                    </span>
                </td>
                <td style="display: flex; gap: 8px;">
                    <button class="btn btn-glass btn-small" onclick="toggleBenefitStatus('${benefit.id}', ${benefit.isActive})">
                        ${benefit.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteBenefit('${benefit.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    tableDiv.innerHTML = html;
}

window.openBenefitModal = function () {
    document.getElementById('benefit-code-name').value = '';
    document.getElementById('benefit-code-type').value = '1_year';
    document.getElementById('benefit-code-active').checked = true;
    document.getElementById('benefit-modal').classList.remove('hidden');
};

window.closeBenefitModal = function () {
    document.getElementById('benefit-modal').classList.add('hidden');
};

window.saveBenefitCode = async function () {
    const code = document.getElementById('benefit-code-name').value.trim().toUpperCase();
    const type = document.getElementById('benefit-code-type').value;
    const isActive = document.getElementById('benefit-code-active').checked;
    let maxUses = document.getElementById('benefit-code-limit').value;

    if (!code) {
        alert("Code requis.");
        return;
    }

    const { doc, setDoc } = window.firebaseFunctions;
    const db = window.firebaseDb;

    try {
        const payload = {
            type: type,
            isActive: isActive,
            totalUses: 0,
            createdAt: new Date().toISOString(),
            oncePerUser: true
        };
        if (maxUses && parseInt(maxUses) > 0) {
            payload.maxUses = parseInt(maxUses);
        }
        await setDoc(doc(db, "benefit_codes", code), payload);

        window.closeBenefitModal();
        loadBenefitCodes();
        showAdminToast('✅ Avantage enregistré !');
    } catch (error) {
        console.error("Error saving benefit:", error);
        alert("Erreur: " + error.message);
    }
};

window.toggleBenefitStatus = async function (code, currentStatus) {
    try {
        const { doc, updateDoc } = window.firebaseFunctions;
        const db = window.firebaseDb;
        await updateDoc(doc(db, "benefit_codes", code), {
            isActive: !currentStatus
        });
        loadBenefitCodes();
    } catch (error) {
        console.error("Error toggling benefit status:", error);
    }
};

window.deleteBenefit = async function (code) {
    if (!confirm(`Supprimer l'avantage ${code} ?`)) return;
    try {
        const { doc, deleteDoc } = window.firebaseFunctions;
        const db = window.firebaseDb;
        await deleteDoc(doc(db, "benefit_codes", code));
        loadBenefitCodes();
    } catch (error) {
        console.error("Error deleting benefit:", error);
    }
};

window.loadBenefitCodes = loadBenefitCodes;
window.setupPromoSubTabs = setupPromoSubTabs;

// ============================================
// User Details Modal — Redesigned
// ============================================

// Achievements definition (mirrors script.js)
const ADMIN_ACHIEVEMENTS = [
    { id: 'first', icon: '👨‍🍳', name: 'Premier Plat', threshold: 1, type: 'history' },
    { id: 'five', icon: '🥄', name: 'Apprenti Chef', threshold: 5, type: 'history' },
    { id: 'ten', icon: '🍴', name: 'Cuisinier', threshold: 10, type: 'history' },
    { id: 'twenty', icon: '⭐', name: 'Chef Étoilé', threshold: 20, type: 'history' },
    { id: 'fifty', icon: '👑', name: 'Maître Chef', threshold: 50, type: 'history' },
    { id: 'fav3', icon: '❤️', name: 'Gourmet', threshold: 3, type: 'favorites' },
    { id: 'fav10', icon: '💎', name: 'Collectionneur', threshold: 10, type: 'favorites' },
    { id: 'custom', icon: '✨', name: 'Créateur', threshold: 1, type: 'custom' },
    { id: 'streak3', icon: '🔥', name: 'Assidu', label: '3j affilée', type: 'streak' }
];

const ADMIN_MODES = [
    { key: 'isVeganMode', label: '🌱 Végétalien' },
    { key: 'isVegetarianMode', label: '🥬 Végétarien' },
    { key: 'isDiabeticMode', label: '🍬 Diabétique' },
    { key: 'isGlutenFreeMode', label: '🌾 Sans Gluten' },
    { key: 'isEndoMode', label: '🩷 Endométriose' }
];

let _udCurrentUid = null;
let _udCurrentUser = null;

window.closeUserDetailsModal = function () {
    document.getElementById('user-details-modal').classList.add('hidden');
    _udCurrentUid = null;
    _udCurrentUser = null;
};

window.openUserDetailsModal = async function (uid, activeTab = 'info') {
    const user = allUsers.find(u => u.uid === uid);
    if (!user) return;

    _udCurrentUid = uid;
    _udCurrentUser = user;

    const modal = document.getElementById('user-details-modal');
    modal.classList.remove('hidden');

    // Tab switching
    modal.querySelectorAll('.ud-tab').forEach(btn => {
        btn.onclick = () => {
            modal.querySelectorAll('.ud-tab').forEach(b => b.classList.remove('active'));
            modal.querySelectorAll('.ud-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const pane = document.getElementById('udtab-' + btn.dataset.udtab);
            if (pane) pane.classList.add('active');
        };
    });

    // Set active tab
    modal.querySelectorAll('.ud-tab').forEach(b => {
        const isTarget = b.dataset.udtab === activeTab;
        b.classList.toggle('active', isTarget);
    });
    modal.querySelectorAll('.ud-pane').forEach(p => {
        const isTarget = p.id === 'udtab-' + activeTab;
        p.classList.toggle('active', isTarget);
    });

    // ---- Header ----
    const avatarImg = document.getElementById('ud-avatar');
    const avatarPh = document.getElementById('ud-avatar-placeholder');
    if (user.profile && user.profile.avatar && (user.profile.avatar.startsWith('http') || user.profile.avatar.startsWith('data:image'))) {
        avatarImg.src = user.profile.avatar;
        avatarImg.style.display = 'block';
        avatarPh.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarPh.style.display = 'flex';
        avatarPh.textContent = (user.profile?.name?.[0]?.toUpperCase()) || (user.email?.[0]?.toUpperCase()) || '?';
    }

    document.getElementById('ud-name').textContent = (user.profile && user.profile.name) ? user.profile.name : 'Utilisateur';
    document.getElementById('ud-email').textContent = user.email || 'Pas d\'email';

    const badgesContainer = document.getElementById('ud-badges');
    let badgesHtml = '';
    if (user.isAdmin) badgesHtml += '<span class="mini-badge admin" style="background:rgba(99,102,241,0.2);color:#818cf8;border:1px solid rgba(99,102,241,0.3);">🛡️ Admin</span>';
    if (user.isPremium) badgesHtml += '<span class="mini-badge premium" style="background:rgba(245,158,11,0.2);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);">✨ Premium</span>';
    if (user.banned) badgesHtml += '<span class="mini-badge danger">🚫 Banni</span>';
    badgesContainer.innerHTML = badgesHtml;

    // Premium pill
    const premiumPill = document.getElementById('ud-premium-pill');
    document.getElementById('ud-premium-status').textContent = user.isPremium ? 'Premium ✨' : 'Gratuit';
    premiumPill.style.background = user.isPremium ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.07)';
    premiumPill.style.color = user.isPremium ? '#f59e0b' : 'var(--text-secondary)';
    const daysWrapper = document.getElementById('ud-premium-days-wrapper');
    if (user.isPremium && user.premiumUntil) {
        let until = user.premiumUntil;
        if (until.toMillis) until = until.toMillis();
        else if (until.seconds) until = until.seconds * 1000;
        const diffDays = Math.max(0, Math.ceil((until - Date.now()) / 86400000));
        document.getElementById('ud-premium-days').textContent = diffDays > 36500 ? '∞' : diffDays;
        daysWrapper.style.display = 'inline';
    } else {
        daysWrapper.style.display = 'none';
    }

    // ---- Quick Actions ----
    const actionsGrid = document.getElementById('ud-quick-actions');
    actionsGrid.innerHTML = `
    <button class="ud-action-btn" onclick="toggleUserPremium('${uid}', ${!!user.isPremium})">
      ${user.isPremium ? '❌ Révoquer Premium' : '✨ Activer Premium'}
    </button>
    <button class="ud-action-btn" onclick="sendPasswordReset('${user.email}')">📧 Reset Mot de Passe</button>
    <button class="ud-action-btn" onclick="${user.banned ? `unbanUser('${uid}')` : `openBanModal('${uid}', '${user.email}')`}">
      ${user.banned ? '✅ Débannir' : '🚫 Bannir'}
    </button>
    <button class="ud-action-btn danger" onclick="openDeleteUserModal('${uid}', '${user.email}')">🗑 Supprimer Compte</button>
    ${user.stripeCustomerId ? `<button class="ud-action-btn" onclick="openInvoiceForUser('${user.stripeCustomerId}')">💳 Voir Facture Stripe</button>` : ''}
  `;

    // ---- Tab: Profil ----

    // Custom Recipes
    const customRecipes = user.customRecipes || [];
    const crContainer = document.getElementById('ud-custom-recipes');
    crContainer.innerHTML = customRecipes.length > 0
        ? '<ul class="ud-simple-list">' + customRecipes.map(r => `<li>${r.name || 'Recette personnalisée'}</li>`).join('') + '</ul>'
        : '<span class="ud-muted">Aucune recette personnalisée.</span>';

    // Favorites
    const favs = user.favorites || [];
    const favsContainer = document.getElementById('ud-favorites');
    if (favs.length > 0) {
        const favNames = favs.map(id => {
            const r = recipes.find(rec => rec.id === id);
            return r ? (r.name || id) : id;
        });
        favsContainer.innerHTML = `
            <span class="ud-count-chip">${favs.length} recette${favs.length > 1 ? 's' : ''} en favoris</span>
            <div class="ud-fav-names" style="font-size:0.9rem; margin-top:8px; line-height:1.4;">
                ${favNames.join(', ')}
            </div>
        `;
    } else {
        favsContainer.innerHTML = '<span class="ud-muted">Aucun favori.</span>';
    }

    // ---- Tab: Gamification ----

    // Achievements
    const historyCount = (user.history || []).length;
    const favCount = (user.favorites || []).length;
    const customCount = (user.customRecipes || []).length;
    const prevUnlocked = user.wemeal_unlocked_achievements || []; // may not exist in Firestore directly

    const achGrid = document.getElementById('ud-achievements');
    let totalUnlockedCount = 0;
    achGrid.innerHTML = ADMIN_ACHIEVEMENTS.map(a => {
        const unlockedList = user.wemeal_unlocked_achievements || [];
        const revoked = user.wemeal_revoked_achievements || [];

        // The source of truth for the admin panel is the user's unlocked list in Firebase.
        // It covers both auto-unlocked (synced by the app) and manually explicitly granted.
        let unlocked = unlockedList.includes(a.id);

        // If explicitly revoked, ensure it's locked (failsafe)
        if (revoked.includes(a.id)) unlocked = false;

        if (unlocked) totalUnlockedCount++;

        return `
      <div class="ud-ach-card interactive ${unlocked ? 'unlocked' : ''}" onclick="adminToggleAchievement('${a.id}', ${unlocked})">
        <div class="ud-ach-icon">${a.icon}</div>
        <div class="ud-ach-name">${a.name}</div>
        <div class="ud-ach-status">${unlocked ? '✅ Débloqué' : '🔒 Verrouillé'}</div>
      </div>
    `;
    }).join('');

    const totalUnlocked = totalUnlockedCount;

    // Achievement progress summary above grid
    const tier = totalUnlocked >= 9 ? '🏆 Or' : totalUnlocked >= 6 ? '🥈 Argent' : totalUnlocked >= 3 ? '🥉 Bronze' : '—';

    // Clear old summary if exists
    modal.querySelectorAll('.ud-ach-summary').forEach(el => el.remove());

    const achSection = achGrid.previousElementSibling;
    if (achSection) {
        achSection.insertAdjacentHTML('afterend', `<div class="ud-ach-summary" style="margin-bottom:12px; font-size:0.9rem; opacity:0.8;">${totalUnlocked}/9 Succès · Rang actuel : <strong>${tier}</strong></div>`);
    }

    // Modes
    const preferences = user.preferences || {};
    const modesGrid = document.getElementById('ud-modes');
    modesGrid.innerHTML = ADMIN_MODES.map(m => {
        const isActive = !!preferences[m.key];
        return `
      <button class="ud-mode-chip ${isActive ? 'active' : ''}" 
              onclick="adminToggleMode('${m.key}', ${isActive})"
              title="${isActive ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}">
        ${m.label} · ${isActive ? 'ON' : 'OFF'}
      </button>
    `;
    }).join('');

    // History stats
    const hist = user.history || [];
    const histEl = document.getElementById('ud-history-stats');
    if (hist.length > 0) {
        const lastDate = hist[hist.length - 1]?.date ? new Date(hist[hist.length - 1].date).toLocaleDateString('fr-FR') : '?';
        const histResolved = hist.map(h => {
            const r = recipes.find(rec => rec.id === h.recipeId);
            return r ? (r.name || h.recipeId) : h.recipeId;
        }).reverse(); // Most recent first

        histEl.innerHTML = `
            <div style="cursor:pointer" onclick="this.nextElementSibling.classList.toggle('open')">
                <span class="ud-count-chip">${hist.length} recette${hist.length > 1 ? 's' : ''} consultée${hist.length > 1 ? 's' : ''}</span>
                <div class="ud-muted" style="font-size:0.8rem;margin-top:6px;">Dernière : ${lastDate} (cliquer pour voir la liste)</div>
            </div>
            <ul class="ud-simple-list ud-history-list" style="max-height:200px; overflow-y:auto; margin-top:10px;">
                ${histResolved.map(name => `<li>${name}</li>`).join('')}
            </ul>
        `;
    } else {
        histEl.innerHTML = '<span class="ud-muted">Aucun historique.</span>';
    }

    // ---- Tab: Achats ----
    const purchasesContainer = document.getElementById('ud-purchases');
    if (user.stripeCustomerId) {
        purchasesContainer.innerHTML = '<span class="ud-muted">Chargement…</span>';
        try {
            const { httpsCallable } = window.firebaseFunctions;
            const getPurchases = httpsCallable('getUserRecentPurchases');
            const { data } = await getPurchases({ stripeCustomerId: user.stripeCustomerId });
            if (data.purchases && data.purchases.length > 0) {
                purchasesContainer.innerHTML = '<ul class="ud-simple-list">' + data.purchases.map(p => {
                    const date = new Date(p.date * 1000).toLocaleDateString('fr-FR');
                    const amount = (p.amount / 100).toFixed(2);
                    return `<li><strong>${amount} €</strong> · ${date} · <a href="${p.url}" target="_blank" style="color:var(--primary);">Facture</a></li>`;
                }).join('') + '</ul>';
            } else {
                purchasesContainer.innerHTML = '<span class="ud-muted">Aucun achat récent.</span>';
            }
        } catch (e) {
            purchasesContainer.innerHTML = '<span class="ud-muted" style="color:#f87171;">Erreur de chargement.</span>';
        }
    } else {
        purchasesContainer.innerHTML = '<span class="ud-muted">Aucun compte Stripe associé.</span>';
    }

    // Gift Codes Bought
    const giftsBought = document.getElementById('ud-gifts-bought');
    try {
        const { collection, query, where, getDocs } = window.firebaseFunctions;
        const db = window.firebaseDb;
        const q = query(collection(db, 'gift_codes'), where('buyerId', '==', uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
            let gifts = [];
            snap.forEach(d => gifts.push(d.data()));
            gifts.sort((a, b) => {
                const d1 = a.createdAt?.toDate?.().getTime() || new Date(a.createdAt || 0).getTime();
                const d2 = b.createdAt?.toDate?.().getTime() || new Date(b.createdAt || 0).getTime();
                return d2 - d1;
            });
            giftsBought.innerHTML = '<ul class="ud-simple-list">' + gifts.map(g => {
                const dateStr = g.createdAt ? (g.createdAt.toDate ? g.createdAt.toDate().toLocaleDateString('fr-FR') : new Date(g.createdAt).toLocaleDateString('fr-FR')) : '—';
                const plan = g.plan === 'monthly' ? '1 Mois' : '1 An';
                const badge = g.status === 'used' ? '<span style="color:var(--text-muted)">(Utilisé)</span>' : '<span style="color:var(--success)">(Actif)</span>';
                return `<li><strong>${g.code}</strong> · ${plan} ${badge} · ${dateStr}</li>`;
            }).join('') + '</ul>';
        } else {
            giftsBought.innerHTML = '<span class="ud-muted">Aucun code cadeau acheté.</span>';
        }
    } catch (e) {
        giftsBought.innerHTML = '<span class="ud-muted" style="color:#f87171;">Erreur de chargement.</span>';
    }

    // Used Benefit Codes (MEAL*)
    const usedCodesContainer = document.getElementById('ud-used-codes');
    usedCodesContainer.innerHTML = '<span class="ud-muted">Recherche…</span>';
    try {
        const { collection, getDocs, query, where } = window.firebaseFunctions;
        const db = window.firebaseDb;

        // Query benefit_codes where usedBy == uid
        const q = query(collection(db, 'benefit_codes'), where('usedBy', '==', uid));
        const snap = await getDocs(q);

        if (!snap.empty) {
            let usedCodes = [];
            snap.forEach(d => {
                const data = d.data();
                usedCodes.push({
                    code: d.id,
                    type: data.type,
                    date: data.usedAt ? (data.usedAt.toDate ? data.usedAt.toDate() : new Date(data.usedAt.seconds * 1000)) : null
                });
            });
            usedCodes.sort((a, b) => (b.date || 0) - (a.date || 0));
            usedCodesContainer.innerHTML = '<ul class="ud-simple-list">' + usedCodes.map(c => `
                <li><strong>${c.code}</strong> (${c.type?.replace(/_/g, ' ') || '—'}) · ${c.date ? c.date.toLocaleDateString('fr-FR') : '—'}</li>
            `).join('') + '</ul>';
        } else {
            usedCodesContainer.innerHTML = '<span class="ud-muted">Aucun code utilisé.</span>';
        }
    } catch (err) {
        console.error("Error fetching used codes:", err);
        usedCodesContainer.innerHTML = '<span class="ud-muted" style="color:#f87171;">Erreur lors du chargement.</span>';
    }
};

// Toggle achievement manually
window.adminToggleAchievement = async function (achId, currentlyUnlocked) {
    if (!_udCurrentUid) return;
    try {
        const { doc, updateDoc, arrayUnion, arrayRemove } = window.firebaseFunctions;
        const db = window.firebaseDb;
        const userRef = doc(db, 'users', _udCurrentUid);

        if (currentlyUnlocked) {
            await updateDoc(userRef, {
                wemeal_unlocked_achievements: arrayRemove(achId),
                wemeal_revoked_achievements: arrayUnion(achId)
            });
        } else {
            await updateDoc(userRef, {
                wemeal_unlocked_achievements: arrayUnion(achId),
                wemeal_revoked_achievements: arrayRemove(achId)
            });
        }

        showAdminToast(`✅ Succès ${achId} ${currentlyUnlocked ? 'retiré' : 'validé'}.`);

        // Update local state
        const idx = typeof allUsers !== 'undefined' ? allUsers.findIndex(u => u.uid === _udCurrentUid) : -1;
        if (idx >= 0) {
            if (!allUsers[idx].wemeal_unlocked_achievements) {
                allUsers[idx].wemeal_unlocked_achievements = [];
            }
            if (!allUsers[idx].wemeal_revoked_achievements) {
                allUsers[idx].wemeal_revoked_achievements = [];
            }

            if (currentlyUnlocked) {
                // Remove from unlocked, add to revoked
                allUsers[idx].wemeal_unlocked_achievements = allUsers[idx].wemeal_unlocked_achievements.filter(id => id !== achId);
                if (!allUsers[idx].wemeal_revoked_achievements.includes(achId)) {
                    allUsers[idx].wemeal_revoked_achievements.push(achId);
                }
            } else {
                // Add to unlocked, remove from revoked
                if (!allUsers[idx].wemeal_unlocked_achievements.includes(achId)) {
                    allUsers[idx].wemeal_unlocked_achievements.push(achId);
                }
                allUsers[idx].wemeal_revoked_achievements = allUsers[idx].wemeal_revoked_achievements.filter(id => id !== achId);
            }
            _udCurrentUser = allUsers[idx];
        }

        window.openUserDetailsModal(_udCurrentUid, 'gamification');
    } catch (err) {
        console.error("Achievement Toggle Error:", err);
        showAdminToast(`❌ Erreur: ${err.message || 'inconnue'}`);
    }
};

// ---- Admin Reset Functions ----

window.adminResetUserField = async function (field, value) {
    if (!_udCurrentUid) return;
    const label = field === 'favorites' ? 'les favoris' : field === 'customRecipes' ? 'les recettes personnalisées' : field === 'history' ? "l'historique" : field;
    if (!confirm(`Réinitialiser ${label} de cet utilisateur ? Cette action est irréversible.`)) return;
    try {
        const { doc, updateDoc } = window.firebaseFunctions;
        const db = window.firebaseDb;
        await updateDoc(doc(db, 'users', _udCurrentUid), { [field]: value });
        showAdminToast(`✅ ${field} réinitialisé.`);
        // Update cached user and re-open
        const idx = allUsers.findIndex(u => u.uid === _udCurrentUid);
        if (idx >= 0) { allUsers[idx][field] = value; _udCurrentUser = allUsers[idx]; }
        window.openUserDetailsModal(_udCurrentUid, 'info');
    } catch (e) {
        console.error(e);
        showAdminToast('❌ Erreur lors de la réinitialisation.');
    }
};

window.adminResetAchievements = async function () {
    if (!_udCurrentUid) return;
    if (!confirm('Remettre à zéro TOUS les succès de cet utilisateur ? (Ne remet pas à zéro l\'historique, seulement le suivi local des succès.)')) return;
    try {
        const { doc, updateDoc } = window.firebaseFunctions;
        const db = window.firebaseDb;
        // Reset both the achievements list AND the milestone tier
        await updateDoc(doc(db, 'users', _udCurrentUid), {
            wemeal_unlocked_achievements: [],
            wemeal_milestone_tier: 0
        });
        showAdminToast('✅ Succès remis à zéro.');
        window.openUserDetailsModal(_udCurrentUid, 'gamification');
    } catch (e) {
        console.error(e);
        showAdminToast('❌ Erreur lors de la réinitialisation des succès.');
    }
};

window.adminResetModes = async function () {
    if (!_udCurrentUid) return;
    if (!confirm('Désactiver TOUS les modes alimentaires de cet utilisateur ?')) return;
    const resetPrefs = {};
    ADMIN_MODES.forEach(m => { resetPrefs[`preferences.${m.key}`] = false; });
    try {
        const { doc, updateDoc } = window.firebaseFunctions;
        const db = window.firebaseDb;
        await updateDoc(doc(db, 'users', _udCurrentUid), resetPrefs);
        showAdminToast('✅ Tous les modes désactivés.');
        const idx = allUsers.findIndex(u => u.uid === _udCurrentUid);
        if (idx >= 0) {
            ADMIN_MODES.forEach(m => { if (allUsers[idx].preferences) allUsers[idx].preferences[m.key] = false; });
            _udCurrentUser = allUsers[idx];
        }
        window.openUserDetailsModal(_udCurrentUid, 'gamification');
    } catch (e) {
        console.error(e);
        showAdminToast('❌ Erreur lors de la réinitialisation des modes.');
    }
};

window.adminToggleMode = async function (modeKey, currentValue) {
    if (!_udCurrentUid) return;
    try {
        const { doc, updateDoc } = window.firebaseFunctions;
        const db = window.firebaseDb;
        await updateDoc(doc(db, 'users', _udCurrentUid), { [`preferences.${modeKey}`]: !currentValue });
        const idx = allUsers.findIndex(u => u.uid === _udCurrentUid);
        if (idx >= 0) {
            if (!allUsers[idx].preferences) allUsers[idx].preferences = {};
            allUsers[idx].preferences[modeKey] = !currentValue;
            _udCurrentUser = allUsers[idx];
        }
        window.openUserDetailsModal(_udCurrentUid, 'gamification');
    } catch (e) {
        console.error(e);
        showAdminToast('❌ Erreur lors de la modification du mode.');
    }
};








// GIFTS TAB LOGIC
// ============================================

window.loadGiftCodes = async function () {
    const tableBody = document.getElementById('gifts-table-body');
    const container = document.getElementById('gifts-table');
    if (!container) return;

    // We used a div with id gifts-table containing a state in the new HTML structure! Let's adapt to what I added to HTML.
    container.innerHTML = `<div class="empty-state"><p>Chargement des codes cadeaux...</p></div>`;

    const { collection, getDocs, query, orderBy } = window.firebaseFunctions;
    const db = window.firebaseDb;

    try {
        const qGifts = query(collection(db, 'gift_codes'), orderBy('createdAt', 'desc'));
        const qMilestones = query(collection(db, 'benefit_codes'), window.firebaseFunctions.where('isMilestoneReward', '==', true));

        const [snapshotGifts, snapshotMilestones] = await Promise.all([
            getDocs(qGifts),
            getDocs(qMilestones)
        ]);

        let gifts = [];

        snapshotGifts.forEach(doc => gifts.push(doc.data()));

        snapshotMilestones.forEach(doc => {
            const data = doc.data();
            gifts.push({
                code: doc.id,
                plan: data.type === '1_week_premium' ? 'weekly' : 'monthly',
                status: data.totalUses > 0 ? 'used' : 'unused',
                buyerId: data.milestoneOwnerUid || 'Système',
                createdAt: data.createdAt,
                usedBy: data.usedBy || null,
                isMilestone: true,
                tier: data.type === '1_week_premium' ? 2 : 3
            });
        });

        // Sort combined list by createdAt descending
        gifts.sort((a, b) => {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
        });

        if (gifts.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>Aucun code cadeau généré.</p></div>`;
            return;
        }

        window._allGifts = gifts; // cache for search
        renderGiftCodes(gifts);
    } catch (err) {
        console.error("Error loading gift codes:", err);
        container.innerHTML = `<div class="empty-state" style="color:var(--danger)"><p>Erreur: ${err.message}</p></div>`;
    }
};

window.renderGiftCodes = function (giftsToRender = window._allGifts) {
    const container = document.getElementById('gifts-table');
    if (!container) return;

    if (!giftsToRender || giftsToRender.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>Aucun code cadeau trouvé.</p></div>`;
        return;
    }

    let html = `
        <table style="width:100%; text-align:left; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 1px solid var(--glass-border); color: var(--text-secondary);">
                    <th style="padding: 12px; font-weight: normal;">Code</th>
                    <th style="padding: 12px; font-weight: normal;">Date d'achat</th>
                    <th style="padding: 12px; font-weight: normal;">Attribué à</th>
                    <th style="padding: 12px; font-weight: normal;">Durée</th>
                    <th style="padding: 12px; font-weight: normal;">Statut</th>
                    <th style="padding: 12px; font-weight: normal;">Utilisé par</th>
                    <th style="padding: 12px; font-weight: normal; text-align: right;">Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    const getUserEmailByUid = (uid) => {
        if (!uid) return null;
        const u = typeof allUsers !== 'undefined' ? allUsers.find(user => user.uid === uid) : null;
        return u ? u.email : null;
    };

    giftsToRender.forEach(gift => {
        let dateFormatee = "Inconnue";
        if (gift.createdAt) {
            if (gift.createdAt.toDate) dateFormatee = gift.createdAt.toDate().toLocaleString('fr-FR');
            else dateFormatee = new Date(gift.createdAt).toLocaleString('fr-FR');
        }

        const isUsed = gift.status === 'used';
        const statusBadge = isUsed
            ? `<span style="background: rgba(255,255,255,0.1); color: var(--text-muted); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Utilisé</span>`
            : `<span style="background: rgba(34,197,94,0.15); color: var(--success); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Non utilisé</span>`;

        // Si c'est un code Système mais qu'il a été utilisé par quelqu'un, afficher qui. S'il n'est pas utilisé, afficher à qui le panel l'a attribué.
        let buyerEmail = getUserEmailByUid(gift.buyerId) || gift.buyerId || 'anonymous';
        if (gift.buyerId === 'Système' || gift.buyerId === 'System') {
            buyerEmail = 'Système';
            // Montrer à qui on a généré le code si l'info existe (souvent stocké dans usedBy ou owner)
            if (gift.usedBy) {
                buyerEmail = `Système (auto-assigné)`;
            }
        }
        if (gift.isMilestone) {
            buyerEmail = getUserEmailByUid(gift.buyerId) || gift.buyerId;
        }

        let usedByHtml = "-";
        if (gift.usedBy) {
            const usedByEmail = getUserEmailByUid(gift.usedBy) || gift.usedBy;
            usedByHtml = `<span style="font-family:monospace;font-size:0.85em;">${usedByEmail}</span>`;
        }

        const code = gift.code || "N/A";

        let rowStyle = "border-bottom: 1px solid rgba(255,255,255,0.05);";
        let codeStyle = "padding: 12px; font-family: monospace; font-weight: bold; color: var(--primary);";

        if (gift.isMilestone) {
            if (gift.tier === 2) {
                rowStyle += " background: rgba(192, 192, 192, 0.05);"; // Silver tint
                codeStyle = "padding: 12px; font-family: monospace; font-weight: bold; color: #c0c0c0;"; // Silver
            } else if (gift.tier === 3) {
                rowStyle += " background: rgba(255, 215, 0, 0.05);"; // Gold tint
                codeStyle = "padding: 12px; font-family: monospace; font-weight: bold; color: #ffd700;"; // Gold
            }
        }

        let planText = gift.plan === 'monthly' ? '1 Mois' : (gift.plan === 'weekly' ? '1 Semaine' : '1 An');
        if (gift.isMilestone) planText += ' 🏆';

        html += `
            <tr style="${rowStyle}">
                <td style="${codeStyle}">${code}</td>
                <td style="padding: 12px; font-size: 0.9em; color: var(--text-secondary);">${dateFormatee}</td>
                <td style="padding: 12px; font-family: monospace; font-size: 0.85em;">${buyerEmail}</td>
                <td style="padding: 12px;">${planText}</td>
                <td style="padding: 12px;">${statusBadge}</td>
                <td style="padding: 12px;">${usedByHtml}</td>
                <td style="padding: 12px; text-align: right;">
                    <button class="btn btn-glass btn-small" style="color: var(--danger); border-color: rgba(239,68,68,0.3); padding: 4px 8px;" onclick="deleteGiftCode('${code}', ${!!gift.isMilestone})">
                        Supprimer
                    </button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
};

window.deleteGiftCode = async function (code, isMilestone) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce code cadeau ? L'utilisateur ne pourra plus l'utiliser ni le voir dans son historique.")) return;

    try {
        const { doc, deleteDoc } = window.firebaseFunctions;

        // Supprimer de la collection appropriée selon si c'est un code promo (benefit_codes) ou une carte cadeau achetée (gift_codes)
        // Note: l'admin panel met `isMilestone` à true pour tout ce qui vient de benefit_codes
        const collectionName = isMilestone ? 'benefit_codes' : 'gift_codes';
        await deleteDoc(doc(window.firebaseDb, collectionName, code));

        // Retirer de la liste locale et re-rendre
        window._allGifts = window._allGifts.filter(g => g.code !== code);
        renderGiftCodes();

        showAdminToast('✅ Code supprimé avec succès.');
    } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        alert('Erreur lors de la suppression du code cadeau : ' + err.message);
    }
};

document.getElementById('gift-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    if (!window._allGifts) return;
    const filtered = window._allGifts.filter(g =>
        (g.code && g.code.toLowerCase().includes(term)) ||
        (g.buyerId && g.buyerId.toLowerCase().includes(term))
    );
    window.renderGiftCodes(filtered);
});;
