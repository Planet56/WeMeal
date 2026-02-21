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
            }
        });
    });

    // Time Slider
    const timeSlider = document.getElementById('recipe-time-slider');
    const timeDisplay = document.getElementById('recipe-time-display');

    timeSlider.addEventListener('input', (e) => {
        const minutes = parseInt(e.target.value);
        timeDisplay.textContent = formatMinutes(minutes);
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
        filtered = filtered.filter(r => r.category === categoryFilter);
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
        'appetizer': 'Apéritif'
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
        const displayCategory = categoryTranslations[recipe.category] || recipe.category || 'Non catégorisé';
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
    document.querySelectorAll('.tag-select .tag').forEach(t => t.classList.remove('active'));

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
                <div class="timer-input-group">
                    <label>⏱️ Timer (min):</label>
                    <input type="number" class="step-timer" value="${timer}" placeholder="0" min="0">
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
    document.getElementById('recipe-category').value = recipe.category || '';
    document.getElementById('recipe-cuisine').value = recipe.cuisine || '';
    document.getElementById('recipe-category').value = recipe.category || '';
    document.getElementById('recipe-cuisine').value = recipe.cuisine || '';

    // Time Slider Logic
    const minutes = parseTimeToMinutes(recipe.time);
    document.getElementById('recipe-time-slider').value = minutes;
    document.getElementById('recipe-time-display').textContent = formatMinutes(minutes);

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

    // Parse keywords
    const keywordsText = document.getElementById('recipe-keywords').value;
    const keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k);

    const recipeData = {
        name: document.getElementById('recipe-name').value,
        emoji: document.getElementById('recipe-emoji').value || '🍽️',
        category: document.getElementById('recipe-category').value,
        cuisine: document.getElementById('recipe-cuisine').value,
        emoji: document.getElementById('recipe-emoji').value || '🍽️',
        category: document.getElementById('recipe-category').value,
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
        const createdAt = u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—';
        const diet = [];
        if (u.preferences?.diabetic) diet.push('🍬');
        if (u.preferences?.endo) diet.push('<svg width="12" height="12" viewBox="0 0 24 24" fill="#ec4899"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>');
        if (u.preferences?.vegetarian) diet.push('🥬');
        if (u.preferences?.vegan) diet.push('🌱');
        const favCount = (u.favorites || []).length;
        const histCount = (u.history || []).length;

        return `
        <div class="user-row ${isBanned ? 'banned-row' : ''}">
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
            <div class="user-actions-cell" style="display: flex; gap: 8px; flex-wrap: wrap;">
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
    const discountVal = document.getElementById('promo-code-discount').value.trim();
    const isActive = document.getElementById('promo-code-active').checked;

    if (!code || !discountVal) {
        alert("Veuillez remplir le code et le pourcentage de réduction.");
        return;
    }

    const discountNum = parseInt(discountVal, 10);
    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
        alert("La réduction doit être un pourcentage valide (ex: 20).");
        return;
    }

    try {
        const { doc, setDoc, httpsCallable } = window.firebaseFunctions;
        const db = window.firebaseDb;

        // 1. Sync with Stripe first
        const createStripePromo = httpsCallable('createStripePromo');
        const stripeResult = await createStripePromo({
            code: code,
            discount: discountNum,
            isActive: isActive
        });
        const stripePromoId = stripeResult?.data?.promoId || null;

        // 2. Save to local Firestore for indexing (including Stripe promo ID for checkout URL)
        await setDoc(doc(db, "promo_codes", code), {
            discount: discountNum,
            isActive: isActive,
            stripePromoId: stripePromoId,
            createdAt: new Date().toISOString()
        });

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
        await updateDoc(doc(db, "users", uid), {
            isPremium: !isCurrentlyPremium
        });
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
        if (currentUsers && currentUsers.length > 0) {
            const rate = ((data.activeSubscriptions / currentUsers.length) * 100).toFixed(1);
            const rateEl = document.getElementById('conversion-rate');
            if (rateEl) rateEl.textContent = `${rate}%`;
        }
    } catch (error) {
        console.error("Error loading Stripe stats:", error);
        // Fallback or show error
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

    if (!code) {
        alert("Veuillez saisir un code.");
        return;
    }

    try {
        const { doc, setDoc } = window.firebaseFunctions;
        const db = window.firebaseDb;

        await setDoc(doc(db, "benefit_codes", code), {
            type,
            isActive,
            createdAt: new Date().toISOString(),
            oncePerUser: true
        });

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



