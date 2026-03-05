// ============================================
// WeMeal - JavaScript Application V3
// ============================================

// Recipe database is loaded from recipes.js
// See recipes.js for the full recipesDatabase definition

// Cooking emojis for steps
// Cooking emojis for steps
window.ICONS = {
  ui: {
    chefHat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
    star: '⭐'
  }
};


// ============================================
// Application State
// ============================================
window.state = {
  currentPage: 'home',
  favorites: JSON.parse(localStorage.getItem('wemeal_favorites') || '[]'),
  history: JSON.parse(localStorage.getItem('wemeal_history') || '[]'),
  cookedToday: JSON.parse(localStorage.getItem('wemeal_cooked_today') || '[]'),
  isDiabeticMode: JSON.parse(localStorage.getItem('wemeal_diabetic') || 'false'),
  isEndoMode: JSON.parse(localStorage.getItem('wemeal_endo') || 'false'),
  isVegetarianMode: JSON.parse(localStorage.getItem('wemeal_vegetarian') || 'false'),
  isVeganMode: JSON.parse(localStorage.getItem('wemeal_vegan') || 'false'),
  isGlutenFreeMode: JSON.parse(localStorage.getItem('wemeal_gluten_free') || 'false'),
  userProfile: JSON.parse(localStorage.getItem('wemeal_profile') || 'null'),
  currentGlycemia: null,
  currentRecipe: null,
  ingredients: [],
  cookingStep: 0,
  userLocation: null,
  favoriteViewActive: false,
  activeFilter: 'all', // "all", "vegetarian", "vegan", "low-gi", "high-protein"
  bypassDietFilter: false, // New property for the bypass toggle
  cookingModeStep: 0,
  isCookingMode: false,
  cookingRecipeId: null,
  currentWeather: null,
  currentWeatherCity: null,
  shoppingList: JSON.parse(localStorage.getItem('wemeal_shopping_list') || '[]'),
  cookedRecipes: JSON.parse(localStorage.getItem('wemeal_cooked_recipes') || '[]'),
  isCalorieTrackingEnabled: JSON.parse(localStorage.getItem('wemeal_calories_enabled') !== null ? localStorage.getItem('wemeal_calories_enabled') : 'true'),
  // Premium State
  isPremium: JSON.parse(localStorage.getItem('wemeal_is_premium') || 'false'),
  premiumUntil: localStorage.getItem('wemeal_premium_until') ? parseInt(localStorage.getItem('wemeal_premium_until'), 10) : null,
  freeSurpriseRemaining: parseInt(localStorage.getItem('wemeal_free_surprises') || '5', 10),
  customRecipes: JSON.parse(localStorage.getItem('wemeal_custom_recipes') || '[]'),
  isManageMode: false,
  selectedFavoriteIds: [],
  isShoppingEditMode: false,
  homeCurrentRecipes: [],
  homeDisplayCount: 9
};

// ============================================
// Onboarding
// ============================================
function checkOnboarding() {
  if (!state.userProfile) {
    document.getElementById('onboarding-overlay').classList.remove('hidden');
  } else {
    document.getElementById('onboarding-overlay').classList.add('hidden');
    updateProfileDisplay();
  }
}

let currentOnboardingStep = 1;
const tempOnboardingModes = {
  diabetic: false,
  endo: false,
  vegetarian: false,
  vegan: false,
  glutenFree: false
};

function setupOnboarding() {
  const avatarPicker = document.getElementById('avatar-picker');
  const avatarInput = document.getElementById('avatar-input');

  // Navigation Buttons
  const nextBtn = document.getElementById('wizard-next');
  const prevBtn = document.getElementById('wizard-prev');
  const finishBtn = document.getElementById('wizard-finish');

  // Avatar Logic
  avatarPicker.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.getElementById('avatar-img');
        img.src = e.target.result;
        img.style.display = 'block';
        document.getElementById('avatar-emoji').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  // Mode Toggles Logic (Delegate or direct attach)
  // Note: HTML onclick are used for simplicity, but we can also attach here if needed.
  // The toggleOnboardingMode function is defined globally below.

  // Navigation Logic
  nextBtn.addEventListener('click', () => {
    if (currentOnboardingStep === 1) {
      const name = document.getElementById('username-input').value.trim();
      if (!name) {
        alert("Veuillez entrer votre prénom pour continuer.");
        return;
      }
    }
    if (currentOnboardingStep < 5) {
      currentOnboardingStep++;
      updateWizardStep();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentOnboardingStep > 1) {
      currentOnboardingStep--;
      updateWizardStep();
    }
  });

  finishBtn.addEventListener('click', finishOnboarding);

  updateWizardStep(); // Initialize
}

function updateWizardStep() {
  // Update Slides
  for (let i = 1; i <= 5; i++) {
    const slide = document.getElementById(`wizard-step-${i}`);
    if (i === currentOnboardingStep) {
      slide.classList.remove('hidden');
      slide.classList.add('active');
    } else {
      slide.classList.add('hidden');
      slide.classList.remove('active');
    }
  }

  // Update Progress Dots
  const dots = document.querySelectorAll('.wizard-step');
  dots.forEach(dot => {
    const step = parseInt(dot.dataset.step);
    if (step === currentOnboardingStep) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // Update Buttons
  const prevBtn = document.getElementById('wizard-prev');
  const nextBtn = document.getElementById('wizard-next');
  const finishBtn = document.getElementById('wizard-finish');

  if (currentOnboardingStep === 1) {
    prevBtn.classList.add('hidden');
  } else {
    prevBtn.classList.remove('hidden');
  }

  if (currentOnboardingStep === 5) {
    nextBtn.classList.add('hidden');
    finishBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.remove('hidden');
    finishBtn.classList.add('hidden');
  }
}

window.toggleOnboardingMode = function (mode) {
  // Toggle state
  if (mode === 'diabetic') tempOnboardingModes.diabetic = !tempOnboardingModes.diabetic;
  if (mode === 'endo') tempOnboardingModes.endo = !tempOnboardingModes.endo;
  if (mode === 'vegetarian') tempOnboardingModes.vegetarian = !tempOnboardingModes.vegetarian;
  if (mode === 'vegan') tempOnboardingModes.vegan = !tempOnboardingModes.vegan;
  if (mode === 'gluten-free') tempOnboardingModes.glutenFree = !tempOnboardingModes.glutenFree;

  // Update UI Button
  const btn = document.querySelector(`.mode-toggle-btn[data-mode="${mode}"]`);
  if (btn) {
    btn.classList.toggle('active');
  }

  // Update Description Box - Inject COMPLETED HTML to match Profile Cards
  const descBox = document.getElementById('mode-description-box');
  descBox.innerHTML = ''; // Clear current
  descBox.className = 'mode-description-box hidden'; // Reset classes (remove borders if any)

  let contentHTML = "";
  let borderColor = "";

  // Priority based description (highlight the last interacted or active ones)
  // We will stack them or just show one. User said "activer un fait apparait le même texte...".
  // Let's show the description of *the mode responding to* (passed in arg) if active.

  let activeMode = null;
  if (mode === 'diabetic' && tempOnboardingModes.diabetic) activeMode = 'diabetic';
  else if (mode === 'endo' && tempOnboardingModes.endo) activeMode = 'endo';
  else if (mode === 'vegetarian' && tempOnboardingModes.vegetarian) activeMode = 'vegetarian';
  else if (mode === 'vegan' && tempOnboardingModes.vegan) activeMode = 'vegan';
  else if (mode === 'gluten-free' && tempOnboardingModes.glutenFree) activeMode = 'gluten-free';

  // If we just untoggled, check if another one is active to show its info?
  // For now, let's keep it simple: if you toggle ON, show it. If OFF, hide or show another.
  // Better: loop through tempModes and show the *first* active one found if current is off.
  if (!activeMode) {
    if (tempOnboardingModes.endo) activeMode = 'endo';
    else if (tempOnboardingModes.diabetic) activeMode = 'diabetic';
    else if (tempOnboardingModes.vegan) activeMode = 'vegan';
    else if (tempOnboardingModes.vegetarian) activeMode = 'vegetarian';
    else if (tempOnboardingModes.glutenFree) activeMode = 'gluten-free';
  }

  if (activeMode === 'diabetic') {
    borderColor = "#ef4444";
    contentHTML = `
      <div class="diabetic-info-title">
        <span style="font-size: 1.5rem; margin-right: 8px;"></span>
        WeMeal s'adapte à vous
      </div>
      <ul class="diabetic-info-list" style="color: var(--text-secondary);">
        <li>Affichage du taux de sucre sur chaque recette</li>
        <li>Suivi quotidien de votre consommation de sucre</li>
        <li>Alerte si vous dépassez la limite recommandée</li>
        <li>Recettes filtrées par index glycémique</li>
        <li>Badge "Adapté diabète" sur les recettes compatibles</li>
      </ul>
    `;
  } else if (activeMode === 'endo') {
    borderColor = "#ec4899";
    contentHTML = `
      <div class="diabetic-info-title" style="color: #ec4899;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#ec4899" style="margin-right: 8px; vertical-align: middle;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
        mode anti inflammation
      </div>
      <ul class="diabetic-info-list" style="color: var(--text-secondary);">
        <li>Recettes anti-inflammatoires privilégiées</li>
        <li>Sans viande rouge, produits laitiers, gluten, sucre raffiné</li>
        <li>Badge spécial sur les recettes compatibles</li>
      </ul>
    `;
  } else if (activeMode === 'vegetarian') {
    borderColor = "#4ade80";
    contentHTML = `
      <div class="diabetic-info-title" style="color: #4ade80;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#4ade80" style="margin-right:8px;">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
        </svg>
        Mode Végétarien activé
      </div>
      <ul class="diabetic-info-list" style="color: var(--text-secondary);">
        <li>Recettes sans viande ni poisson</li>
        <li>Badge végétarien sur les recettes compatibles</li>
        <li>Suggestions adaptées à votre régime</li>
      </ul>
    `;
  } else if (activeMode === 'vegan') {
    borderColor = "#22c55e";
    contentHTML = `
      <div class="diabetic-info-title" style="color: #22c55e;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#22c55e" style="margin-right:8px;">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        Mode Végétalien activé
      </div>
      <ul class="diabetic-info-list" style="color: var(--text-secondary);">
        <li>Recettes 100% végétales</li>
        <li>Sans aucun produit d'origine animale</li>
        <li>Badge "Végétalien" sur les recettes compatibles</li>
        <li>Filtre automatique activé</li>
      </ul>
    `;
  } else if (activeMode === 'gluten-free') {
    borderColor = "#f97316";
    contentHTML = `
      <div class="diabetic-info-title" style="color: #f97316;">
        <span style="font-size: 1.2rem; margin-right: 8px;"></span>
        Mode Sans Gluten activé
      </div>
      <ul class="diabetic-info-list" style="color: var(--text-secondary);">
        <li>Recettes garanties sans gluten</li>
        <li>Badge orange sur les recettes compatibles</li>
        <li>Filtre automatique activé</li>
      </ul>
    `;
  }

  if (activeMode) {
    descBox.innerHTML = contentHTML;
    descBox.style.borderLeft = `3px solid ${borderColor}`;
    // Ensure we add the base styling class equivalent to .diabetic-info-card but without background (it has its own in CSS) 
    // Actually, .mode-description-box in CSS already has background. We just need to make sure inner elements look right.
    descBox.classList.remove('hidden');
    // Add specific class for styling children if needed
    descBox.classList.add('info-card-style');
  } else {
    descBox.classList.add('hidden');
  }
};

function finishOnboarding() {
  const usernameInput = document.getElementById('username-input');
  const name = usernameInput.value.trim() || 'Gourmet';
  const avatarImg = document.getElementById('avatar-img');

  // Save Profile
  state.userProfile = {
    name: name,
    avatar: avatarImg.style.display !== 'none' ? avatarImg.src : null,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('wemeal_profile', JSON.stringify(state.userProfile));

  // Save Modes
  state.isDiabeticMode = tempOnboardingModes.diabetic;
  state.isEndoMode = tempOnboardingModes.endo;
  state.isVegetarianMode = tempOnboardingModes.vegetarian;
  state.isVeganMode = tempOnboardingModes.vegan;

  // Create profile-specific gluten free setting if needed, but for now assuming global state pattern
  // Note: userProfile in state can store additional flags, or separate localStorage keys as per existing script.js
  // Existing script uses: isDiabeticMode, isVegetarianMode etc. in localStorage

  localStorage.setItem('wemeal_diabetic', JSON.stringify(state.isDiabeticMode));
  localStorage.setItem('wemeal_endo', JSON.stringify(state.isEndoMode));
  localStorage.setItem('wemeal_vegetarian', JSON.stringify(state.isVegetarianMode));

  window.dispatchEvent(new CustomEvent('profile-updated'));
  localStorage.setItem('wemeal_vegan', JSON.stringify(state.isVeganMode));
  // Gluten free might be in profile or separate, let's check existing logic. 
  // Existing logic: const isGlutenFreeMode = ... (not in top state? let's check profile)
  // Looking at state definition: userProfile doesn't seem to have gluten free in default structure but iOS does.
  // We'll add it to profile for consistency with iOS
  state.userProfile.isGlutenFree = tempOnboardingModes.glutenFree;
  localStorage.setItem('wemeal_profile', JSON.stringify(state.userProfile)); // Save again with gluten free

  document.getElementById('onboarding-overlay').classList.add('hidden');
  updateProfileDisplay();
  requestLocation();

  // Trigger backend sync after onboarding
  window.dispatchEvent(new CustomEvent('profile-updated'));
}

function isLikelyImageSource(value) {
  if (typeof value !== 'string') return false;
  const src = value.trim();
  return src.startsWith('data:image/') ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('blob:') ||
    src.startsWith('/');
}

function resolveProfileName(profile) {
  const rawName = typeof profile?.name === 'string' ? profile.name.trim() : '';
  return rawName || 'Gourmet';
}

function resolveProfileAvatar(profile) {
  const rawAvatar = typeof profile?.avatar === 'string' ? profile.avatar.trim() : '';
  const rawAvatarEmoji = typeof profile?.avatarEmoji === 'string' ? profile.avatarEmoji.trim() : '';

  if (rawAvatar) {
    if (isLikelyImageSource(rawAvatar)) {
      return { imageSrc: rawAvatar, emoji: null };
    }
    return { imageSrc: null, emoji: rawAvatar };
  }

  if (rawAvatarEmoji) {
    return { imageSrc: null, emoji: rawAvatarEmoji };
  }

  return { imageSrc: null, emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' };
}

function updateProfileDisplay() {
  if (state.userProfile) {
    const displayName = resolveProfileName(state.userProfile);
    const avatar = resolveProfileAvatar(state.userProfile);

    document.getElementById('profile-name').textContent = displayName;
    document.getElementById('profile-name-input').value = displayName; // Sync input

    if (avatar.imageSrc) {
      const avatarImg = document.getElementById('profile-avatar-img');
      avatarImg.src = avatar.imageSrc;
      avatarImg.style.display = 'block';
      document.getElementById('profile-avatar-emoji').style.display = 'none';
    } else {
      // Use emoji avatar (or fallback)
      document.getElementById('profile-avatar-emoji').innerHTML = avatar.emoji || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
      document.getElementById('profile-avatar-emoji').style.display = 'block';
      document.getElementById('profile-avatar-img').style.display = 'none';
    }
  }

  // Update Status Indicators on Profile Picture
  const avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) {
    avatarEl.className = 'profile-avatar'; // Reset classes

    // Remove existing badges if any
    const existingBadge = avatarEl.querySelector('.profile-avatar-badge');
    if (existingBadge) existingBadge.remove();

    if (state.isDiabeticMode) {
      avatarEl.classList.add('diabetic-border');
    }

    if (state.isEndoMode) {
      avatarEl.classList.add('endo-border');
    }

    // Mutual exclusive borders
    if (state.isVeganMode) {
      avatarEl.classList.add('vegan-border');
    } else if (state.isVegetarianMode) {
      avatarEl.classList.add('vegetarian-border');
    }
  }

  // Premium Status Display
  const headerContainer = document.querySelector('.profile-header');
  if (headerContainer) {
    // Clean up previous dynamically added elements
    const existingBadge = document.getElementById('profile-premium-badge');
    const existingBtn = document.getElementById('profile-premium-btn');
    const limitsInfoLabel = document.getElementById('profile-limits-info');
    if (existingBadge) existingBadge.remove();
    if (existingBtn) existingBtn.remove();
    if (limitsInfoLabel) limitsInfoLabel.remove();

    if (state.isPremium) {
      const badge = document.createElement('div');
      badge.id = 'profile-premium-badge';
      badge.className = 'premium-badge';
      badge.innerHTML = '✨ WeMeal+';
      badge.style.alignSelf = 'center';
      badge.style.cursor = 'pointer';
      badge.onclick = () => {
        if (typeof showPremiumStatusModal === 'function') showPremiumStatusModal();
      };
      headerContainer.appendChild(badge);
    } else {
      const btn = document.createElement('button');
      btn.id = 'profile-premium-btn';
      btn.className = 'btn btn-primary';
      btn.innerHTML = `✨ S'abonner à WeMeal+`;
      btn.style.marginTop = 'var(--space-md)';
      btn.style.alignSelf = 'center';
      btn.style.width = '100%';
      btn.onclick = () => showPremiumPaywall('profile');
      headerContainer.appendChild(btn);

      const limits = document.createElement('p');
      limits.id = 'profile-limits-info';
      limits.innerHTML = `Il vous reste <strong>${state.freeSurpriseRemaining}</strong> recherches "Surprise Me" gratuites.`;
      limits.style.fontSize = '0.85rem';
      limits.style.color = 'var(--text-secondary)';
      limits.style.marginTop = 'var(--space-sm)';
      limits.style.textAlign = 'center';
      headerContainer.appendChild(limits);
    }
  }
}

// ============================================
// Profile Editing
// ============================================
let isEditingProfile = false;

function toggleEditProfile() {
  isEditingProfile = !isEditingProfile;
  const nameEl = document.getElementById('profile-name');
  const wrapperEl = document.getElementById('profile-edit-wrapper');
  const avatarEl = document.getElementById('profile-avatar');
  const overlayEl = document.getElementById('avatar-edit-overlay');

  if (isEditingProfile) {
    nameEl.style.display = 'none';
    wrapperEl.classList.remove('hidden');
    avatarEl.classList.add('editable');
    overlayEl.classList.remove('hidden');
  } else {
    nameEl.style.display = 'block';
    wrapperEl.classList.add('hidden');
    avatarEl.classList.remove('editable');
    overlayEl.classList.add('hidden');
  }
}


function saveOnboarding() {
  const nameInput = document.getElementById('onboarding-name-input');
  const name = nameInput.value.trim();
  if (name) {
    state.userProfile.name = name;
    localStorage.setItem('wemeal_profile', JSON.stringify(state.userProfile));
    updateProfileDisplay();
  }
}

function saveProfile() {
  const newName = document.getElementById('profile-name-input').value.trim();
  if (newName) {
    state.userProfile.name = newName;
    localStorage.setItem('wemeal_profile', JSON.stringify(state.userProfile));
    updateProfileDisplay();
    // Trigger backend sync after profile edit
    window.dispatchEvent(new CustomEvent('profile-updated'));
  }
  toggleEditProfile();
}

function handleProfileAvatarClick() {
  if (isEditingProfile) {
    console.log("here");
    document.getElementById('profile-avatar-input').click();
  }
}

// Initialize UI (Profile Name on load if available)
document.addEventListener('DOMContentLoaded', () => {
  // Other init is handled by onboarding checking,
  // but we can set up event listeners here
});

// Infinite scroll removed — user must click "Charger plus" button

// Init profile avatar input listener
document.addEventListener('DOMContentLoaded', () => {
  // Listen for Firebase Updates
  window.addEventListener('recipes-updated', (e) => {
    console.log(`🔥 Recipes Updated Event received. Refreshing UI...`, e.detail);
    // Re-initialize home if it exists
    if (typeof initializeHome === 'function') {
      initializeHome();
    }
    // Re-run search if currently searching?
    const resultSection = document.getElementById('surprise-result');
    if (resultSection && !resultSection.classList.contains('hidden')) {
      // Maybe refresh search? 
      // For now, just home is enough.
    }
    showToast(`🔥 ${e.detail.count} Recettes synchronisées !`);
  });

  // Surprise Action Button (Arrow)
  const surpriseBtn = document.getElementById('surprise-btn');
  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("Surprise action click");
      handleFindRecipe();
    });
  }

  // Surprise Input Enter Key
  const surpriseInput = document.getElementById('surprise-ingredients');
  if (surpriseInput) {
    surpriseInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleFindRecipe();
      }
    });
  }

  const profileInput = document.getElementById('profile-avatar-input');
  if (profileInput) {
    profileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          state.userProfile.avatar = e.target.result;
          localStorage.setItem('wemeal_profile', JSON.stringify(state.userProfile));
          updateProfileDisplay();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ============================================
  // Theme Toggle Logic
  // ============================================
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = themeToggle ? themeToggle.parentElement.previousElementSibling.querySelector('span:last-child') : null;

  function updateThemeUI(isLight) {
    if (isLight) {
      document.body.classList.add('light-mode');
      if (themeToggle) themeToggle.checked = false; // Unchecked = Light (Colorful)
      if (themeIcon) themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
      if (themeLabel) themeLabel.textContent = 'Thème Clair';
    } else {
      document.body.classList.remove('light-mode');
      if (themeToggle) themeToggle.checked = true; // Checked = Dark (Midnight)
      if (themeIcon) themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
      if (themeLabel) themeLabel.textContent = 'Thème Sombre';
    }
  }

  // Initialize from LocalStorage
  const savedTheme = localStorage.getItem('wemeal_theme') || 'dark'; // Default to dark
  updateThemeUI(savedTheme === 'light');

  // Toggle Listener
  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      const isDark = e.target.checked;
      const newTheme = isDark ? 'dark' : 'light';
      localStorage.setItem('wemeal_theme', newTheme);
      updateThemeUI(newTheme === 'light');
    });
  }

  // ============================================
  // Calorie Toggle Logic
  // ============================================
  const calorieToggle = document.getElementById('calorie-toggle');
  const calorieInfo = document.getElementById('calorie-info');
  // Use optional chaining carefully or check nulls. 
  // stat-calories exists, parent is .stat-card
  const calorieStatValue = document.getElementById('stat-calories');
  const calorieStatCard = calorieStatValue ? calorieStatValue.parentElement : null;

  // Initialize UI
  if (calorieToggle) {
    calorieToggle.checked = state.isCalorieTrackingEnabled;
    updateCalorieUI(state.isCalorieTrackingEnabled);

    calorieToggle.addEventListener('change', (e) => {
      const isEnabled = e.target.checked;
      state.isCalorieTrackingEnabled = isEnabled;
      localStorage.setItem('wemeal_calories_enabled', isEnabled);

      updateCalorieUI(isEnabled);

      if (!isEnabled) {
        // Show info popup/card
        if (calorieInfo) calorieInfo.classList.remove('hidden');
      } else {
        if (calorieInfo) calorieInfo.classList.add('hidden');
      }
    });
  }

  function updateCalorieUI(isEnabled) {
    if (calorieStatCard) {
      if (isEnabled) {
        calorieStatCard.style.display = '';
      } else {
        calorieStatCard.style.display = 'none';
      }
    }
  }
});

// ============================================
// Geolocation & Weather
// ============================================
function requestLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        fetchWeatherByLocation(state.userLocation);
      },
      (error) => {
        console.warn("Geo error:", error);
        // Fallback to IP location instead of hardcoded Paris
        fetchLocationFromIP();
      },
      { timeout: 5000, enableHighAccuracy: false, maximumAge: 600000 }
    );
  } else {
    fetchLocationFromIP();
  }
}

async function fetchLocationFromIP() {
  try {
    console.log('Fetching location from IP...');
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
    const data = await response.json();

    state.userLocation = {
      lat: parseFloat(data.latitude),
      lon: parseFloat(data.longitude)
    };

    // Pass city name directly to avoid reverse geocoding redundant call
    fetchWeatherByLocation(state.userLocation, data.city);

  } catch (error) {
    console.log('IP Location failed:', error);
    useSimulatedWeather();
  }
}

async function fetchWeatherByLocation(location, explicitCityName = null) {
  try {
    // Using Open-Meteo API (free, no API key needed) with 5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code&timezone=auto`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    const data = await response.json();

    const temp = Math.round(data.current.temperature_2m);
    const weatherCode = data.current.weather_code;
    const weatherInfo = getWeatherFromCode(weatherCode, temp);

    state.currentWeather = {
      temp: temp,
      icon: weatherInfo.icon,
      desc: weatherInfo.desc,
      type: weatherInfo.type,
      tempType: weatherInfo.tempType
    };

    let city = explicitCityName;
    if (!city) {
      // Get city name via reverse geocoding only if not already known
      try {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lon}&format=json`
        );
        const geoData = await geoResponse.json();
        const address = geoData.address;
        city = address.city || address.town || address.village || address.suburb || 'Votre position';
      } catch (e) {
        console.error("Reverse geocoding failed", e);
        city = 'Votre position';
      }
    }

    state.currentWeatherCity = city;
    updateWeatherDisplay(state.currentWeather, city);
  } catch (error) {
    console.log('Weather fetch failed:', error);
    useSimulatedWeather();
  }
}

// ============================================
// Icon System (Restored Emojis)
// ============================================

function getWeatherFromCode(code, temp = null) {
  // Base weather from code
  let weather;
  if (code === 0) weather = { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>', desc: 'Ensoleillé', type: 'sunny' };
  else if (code <= 3) weather = { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>', desc: 'Nuageux', type: 'cloudy' };
  else if (code <= 49) weather = { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>', desc: 'Brumeux', type: 'cloudy' };
  else if (code <= 69) weather = { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 16.2A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><line x1="16" y1="14" x2="16" y2="22"></line><line x1="8" y1="14" x2="8" y2="22"></line><line x1="12" y1="16" x2="12" y2="24"></line></svg>', desc: 'Pluvieux', type: 'rainy' };
  else if (code <= 79) weather = { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line><path d="M20 16l-4-4 4-4"></path><path d="M4 8l4 4-4 4"></path><path d="M16 4l-4 4-4-4"></path><path d="M8 20l4-4 4 4"></path></svg>', desc: 'Neigeux', type: 'snowy' };
  else if (code <= 99) weather = { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>', desc: 'Orageux', type: 'rainy' };
  else weather = { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>', desc: 'Variable', type: 'cloudy' };

  // Add temperature context for recipe matching
  if (temp !== null) {
    if (temp >= 25) {
      weather.tempType = 'hot';
    } else if (temp <= 10) {
      weather.tempType = 'cold';
    } else {
      weather.tempType = 'mild';
    }
  }

  return weather;
}

function getSimulatedWeather() {
  state.currentWeather = {
    temp: 22,
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    desc: 'Ensoleillé',
    type: 'sunny',
    tempType: 'hot'
  };

  state.currentWeatherCity = 'Votre ville (Simulé)';
  updateWeatherDisplay(state.currentWeather, 'Votre ville (Simulé)');
}

function updateWeatherDisplay(weather, locationText) {
  if (!weather) return;

  const widget = document.getElementById('weather-widget');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const locEl = document.getElementById('location-text');

  if (tempEl) tempEl.innerText = `${weather.temp}°C`;
  if (descEl) descEl.innerText = weather.desc;
  if (locEl) locEl.innerText = locationText;

  // Map weather type to scene type
  let sceneType = 'sunny';
  if (weather.type === 'cloudy' && weather.desc === 'Brumeux') sceneType = 'foggy';
  else if (weather.type === 'cloudy') sceneType = 'cloudy';
  else if (weather.type === 'rainy' && weather.desc === 'Orageux') sceneType = 'stormy';
  else if (weather.type === 'rainy') sceneType = 'rainy';
  else if (weather.type === 'snowy') sceneType = 'snowy';

  if (widget) widget.setAttribute('data-weather', sceneType);

  // Generate particles for rain/snow/storm
  renderWeatherParticles(sceneType);

  // Hide loading
  document.getElementById('loading-overlay').classList.remove('active');
}

function renderWeatherParticles(type) {
  const container = document.getElementById('weather-particles');
  if (!container) return;
  container.innerHTML = '';

  if (type === 'rainy' || type === 'stormy') {
    const count = type === 'stormy' ? 50 : 35;
    for (let i = 0; i < count; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.5 + Math.random() * 0.6}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      drop.style.opacity = `${0.4 + Math.random() * 0.6}`;
      drop.style.height = `${12 + Math.random() * 10}px`;
      container.appendChild(drop);
    }
  } else if (type === 'snowy') {
    for (let i = 0; i < 30; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${3 + Math.random() * 4}s`;
      flake.style.animationDelay = `${Math.random() * 5}s`;
      flake.style.width = flake.style.height = `${3 + Math.random() * 5}px`;
      flake.style.opacity = `${0.4 + Math.random() * 0.6}`;
      container.appendChild(flake);
    }
  }
}


function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function useSimulatedWeather() {
  getSimulatedWeather();
}

// ============================================
// Recipe Functions (Mock AI Logic)
// ============================================
function getRecommendedRecipes(weather, count = 9) {
  const season = getCurrentSeason();
  const weatherType = weather?.type || 'sunny';
  const tempType = weather?.tempType || 'mild';

  // 1. Strict Filter by context (weather, temperature, diet)
  let filteredRecipes = (window.recipesDatabase || []).filter(recipe => {
    // Weather matching — safely handle recipes without weather tags
    const rw = Array.isArray(recipe.weather) ? recipe.weather : (recipe.weather ? [recipe.weather] : ['all']);
    const matchesWeatherCondition = rw.includes(weatherType) || rw.includes('all');
    const matchesTempType = rw.includes(tempType) || rw.includes('all');
    const matchesWeather = matchesWeatherCondition || matchesTempType;

    // Diet Strict Filtering (unless bypassed)
    let dietMatch = true;
    if (!state.bypassDietFilter) {
      if (state.isVeganMode) {
        if (!recipe.isVegan) dietMatch = false;
      } else if (state.isVegetarianMode) {
        if (!recipe.isVegetarian && !recipe.isVegan) dietMatch = false;
      }

      if (state.isDiabeticMode) {
        if (!recipe.diabeticFriendly) dietMatch = false;
      }

      if (state.isEndoMode) {
        if (!recipe.endometriosisFriendly) dietMatch = false;
      }

      if (state.isGlutenFreeMode) {
        if (!recipe.isGlutenFree) dietMatch = false;
      }
    }

    return matchesWeather && dietMatch;
  });

  // Sort: prioritize recipes that match BOTH weather AND temp
  filteredRecipes.sort((a, b) => {
    const aw = Array.isArray(a.weather) ? a.weather : (a.weather ? [a.weather] : []);
    const bw = Array.isArray(b.weather) ? b.weather : (b.weather ? [b.weather] : []);
    const aScore = (aw.includes(weatherType) ? 2 : 0) + (aw.includes(tempType) ? 1 : 0);
    const bScore = (bw.includes(weatherType) ? 2 : 0) + (bw.includes(tempType) ? 1 : 0);
    return bScore - aScore;
  });

  // 2. If strict filtering yields < count, fill with season matches
  if (filteredRecipes.length < count) {
    const seasonRecipes = (window.recipesDatabase || []).filter(r =>
      !filteredRecipes.some(fr => fr.id === r.id) &&
      (state.bypassDietFilter || (
        (!state.isVeganMode || r.isVegan) &&
        (!state.isVegetarianMode || (r.isVegetarian || r.isVegan)) &&
        (!state.isDiabeticMode || r.diabeticFriendly) &&
        (!state.isEndoMode || r.endometriosisFriendly) &&
        (!state.isGlutenFreeMode || r.isGlutenFree)
      )) &&
      (Array.isArray(r.season) ? r.season : (r.season ? [r.season] : ['all'])).some(s => s === season || s === 'all')
    );
    filteredRecipes = [...filteredRecipes, ...seasonRecipes];
  }

  // Last resort fallback
  if (filteredRecipes.length < count) {
    const leftovers = (window.recipesDatabase || []).filter(r =>
      !filteredRecipes.some(fr => fr.id === r.id) &&
      (state.bypassDietFilter || (
        (!state.isVeganMode || r.isVegan) &&
        (!state.isVegetarianMode || (r.isVegetarian || r.isVegan)) &&
        (!state.isDiabeticMode || r.diabeticFriendly) &&
        (!state.isEndoMode || r.endometriosisFriendly) &&
        (!state.isGlutenFreeMode || r.isGlutenFree)
      ))
    );
    filteredRecipes = [...filteredRecipes, ...leftovers];
  }

  // 3. Shuffle
  let results = filteredRecipes
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  // 4. Client-side Filtering (Chips)
  if (state.activeFilter !== 'all') {
    results = results.filter(r => {
      if (state.activeFilter === 'vegetarian') return r.isVegetarian;
      if (state.activeFilter === 'vegan') return r.isVegan;
      if (state.activeFilter === 'gluten-free') return r.isGlutenFree; // New gluten-free chip filter
      if (state.activeFilter === 'low-gi') return r.glycemicIndex === 'low';
      if (state.activeFilter === 'high-protein') return r.highProtein; // New high-protein filter
      return true;
    });
  }

  // Deduplicate before slicing (catch any remaining duplicates)
  const uniqueMap = new Map();
  results.forEach(r => {
    if (!uniqueMap.has(r.id)) {
      uniqueMap.set(r.id, r);
    }
  });
  results = Array.from(uniqueMap.values());

  return results.slice(0, count);
}

function setActiveFilter(filter) {
  state.activeFilter = filter;
  // Note: UI update is now handled in applyHomeFilters
}

window.openHomeFilters = function () {
  const modal = document.getElementById('home-filters-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
    // Initialize UI state based on current logical state
    document.querySelectorAll('#home-filters-modal .filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.filter === state.activeFilter);
    });
    const bypassCheckbox = document.getElementById('bypass-diet-filter');
    if (bypassCheckbox) bypassCheckbox.checked = state.bypassDietFilter;
  }
};

window.closeHomeFilters = function () {
  const modal = document.getElementById('home-filters-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
};

window.applyHomeFilters = function () {
  // Read state from modal
  const activeChip = document.querySelector('#home-filters-modal .filter-chip.active');
  if (activeChip) {
    state.activeFilter = activeChip.dataset.filter;
  }
  const bypassCheckbox = document.getElementById('bypass-diet-filter');
  if (bypassCheckbox) {
    state.bypassDietFilter = bypassCheckbox.checked;
  }

  // Force rebuild of recipes by resetting cache size
  state._homeDbSize = 0;

  // Re-initialize home page to apply
  initializeHome();
  window.closeHomeFilters();
};

// Add event listeners for modal chips specifically
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#home-filters-modal .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#home-filters-modal .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
});

function findRecipeByIngredients(ingredients) {
  if (ingredients.length === 0) return [];

  const ingredientsLower = ingredients.map(i => i.toLowerCase().trim());

  // Cuisine keyword mapping for flexible search
  const cuisineKeywords = {
    'asiatique': ['asian', 'thai', 'chinese', 'japanese', 'vietnamese', 'korean', 'indian'],
    'asia': ['asian', 'thai', 'chinese', 'japanese', 'vietnamese', 'korean', 'indian'],
    'chinois': ['chinese'],
    'chine': ['chinese'],
    'japonais': ['japanese'],
    'japon': ['japanese'],
    'thai': ['thai'],
    'thaïlandais': ['thai'],
    'vietnamien': ['vietnamese'],
    'vietnam': ['vietnamese'],
    'indien': ['indian'],
    'inde': ['indian'],
    'curry': ['indian', 'thai'],
    'italien': ['italian'],
    'italie': ['italian'],
    'pizza': ['italian'],
    'pâtes': ['italian', 'pasta'],
    'pasta': ['italian', 'pasta'],
    'français': ['french'],
    'france': ['french'],
    'espagnol': ['spanish'],
    'espagne': ['spanish'],
    'grec': ['greek'],
    'grèce': ['greek'],
    'libanais': ['lebanese'],
    'méditerranéen': ['greek', 'lebanese', 'spanish', 'italian'],
    'healthy': ['healthy', 'modern'],
    'sain': ['healthy', 'modern'],
    'léger': ['healthy', 'salad'],
    'light': ['healthy', 'salad'],
    'salade': ['salad'],
    'soupe': ['soup'],
    'hiver': ['winter', 'cold'],
    'réconfortant': ['cold', 'rainy', 'winter'],
    'chaud': ['cold', 'rainy', 'winter', 'soup'],
    'froid': ['hot', 'sunny', 'salad'],
    'été': ['summer', 'hot', 'sunny'],
    'bowl': ['healthy', 'bowl'],
    'végétarien': ['vegetarian'],
    'vegan': ['vegan', 'vegetalien'],
    'végétalien': ['vegan', 'vegetalien'],
    'poisson': ['fish', 'seafood'],
    'viande': ['meat'],
    'poulet': ['chicken'],
    'bœuf': ['beef'],
    'porc': ['pork']
  };

  let recipes = (window.recipesDatabase || []).map(recipe => {
    // Handle different ingredient formats (Firebase may have different structure)
    let recipeIngredientsLower = [];
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipeIngredientsLower = recipe.ingredients.map(i => {
        if (typeof i === 'string') return i.toLowerCase();
        if (i && i.name) return i.name.toLowerCase();
        return '';
      }).filter(i => i);
    }

    let totalScore = 0;
    const recipeName = (recipe.name || '').toLowerCase();

    ingredientsLower.forEach(term => {
      // 1. Direct ingredient match
      const ingredientMatch = recipeIngredientsLower.some(recIng =>
        recIng.includes(term) || term.includes(recIng)
      );
      if (ingredientMatch) totalScore += 3;

      // 2. Recipe name match
      if (recipeName.includes(term)) totalScore += 5;

      // 3. Category match
      if (recipe.category && recipe.category.toLowerCase().includes(term)) totalScore += 2;

      // 4. Cuisine match
      if (recipe.cuisine && recipe.cuisine.toLowerCase().includes(term)) totalScore += 4;

      // 5. Keywords array match (new field)
      if (recipe.keywords && recipe.keywords.some(kw => kw.toLowerCase().includes(term))) totalScore += 4;

      // 6. Cuisine keyword mapping (e.g., "asiatique" -> match "thai", "chinese", etc.)
      if (cuisineKeywords[term]) {
        const matchedCuisines = cuisineKeywords[term];
        if (recipe.cuisine && matchedCuisines.includes(recipe.cuisine.toLowerCase())) totalScore += 5;
        if (recipe.category && matchedCuisines.includes(recipe.category.toLowerCase())) totalScore += 3;
        // Also match weather/season for terms like "hiver", "été"
        if (recipe.weather && recipe.weather.some(w => matchedCuisines.includes(w))) totalScore += 2;
        if (recipe.season && recipe.season.some(s => matchedCuisines.includes(s))) totalScore += 2;
      }

      // 7. Weather/season match for descriptive terms
      if (recipe.weather && recipe.weather.some(w => w.includes(term))) totalScore += 2;
      if (recipe.season && recipe.season.some(s => s.includes(term))) totalScore += 2;
    });

    return { ...recipe, matchCount: totalScore };
  });

  // Filter by dietary preferences
  if (state.isDiabeticMode) {
    recipes = recipes.filter(r => r.diabeticFriendly);
  }

  if (state.isEndoMode) {
    recipes = recipes.filter(r => r.endometriosisFriendly);
  }

  if (state.isGlutenFreeMode) {
    recipes = recipes.filter(r => r.glutenFree || r.isGlutenFree);
  }

  if (state.isVeganMode) {
    recipes = recipes.filter(r => r.isVegan);
  } else if (state.isVegetarianMode) {
    // Show Vegetarian OR Vegan recipes (Vegetarian implies no meat, but Vegan is also Vegetarian)
    recipes = recipes.filter(r => r.isVegetarian || r.isVegan);
  }

  return recipes.sort((a, b) => b.matchCount - a.matchCount).slice(0, 6);
}


// ============================================
// UI Rendering
// ============================================
function renderRecipeCard(recipe, container) {
  // Check if this recipe HAS a custom version to show the badge
  const hasCustom = state.customRecipes && state.customRecipes.some(r => String(r.originalId) === String(recipe.id));
  const isCustomVersion = !!recipe.originalId;

  const isFavorite = state.favorites && (state.favorites.includes(String(recipe.id)) || state.favorites.includes(Number(recipe.id)));
  const isSelected = state.selectedFavoriteIds.includes(String(recipe.id));
  const card = document.createElement('div');
  card.className = `recipe-card glass ${state.isManageMode ? 'manage-mode' : ''} ${isSelected ? 'selected' : ''}`;

  if (state.isManageMode) {
    card.onclick = (e) => {
      e.stopPropagation();
      toggleFavoriteSelection(recipe.id);
    };
  }

  // 1. Selection Checkbox (Only in manage mode)
  let selectionOverlay = state.isManageMode ? `
    <div class="selection-overlay" style="position: absolute; top: 12px; right: 12px; z-index: 10;">
        <div class="selection-checkbox ${isSelected ? 'checked' : ''}" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff; background: ${isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.3)'}; display: flex; align-items: center; justify-content: center;">
            ${isSelected ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
        </div>
    </div>
  ` : '';

  // 1. Top Right Badge (Only used for Diabetic GI, otherwise empty to avoid duplication)
  let topRightBadge = (hasCustom || isCustomVersion) ? `<div class="badge-custom-star" style="position: absolute; top: 12px; left: 12px; background: #fbbf24; color: #000; padding: 4px 8px; border-radius: 8px; font-size: 0.7rem; font-weight: bold; z-index: 2;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M12 2v20M2 12h20M7.5 7.5l9 9M7.5 16.5l9-9"></path></svg> PERSO</div>` : '';

  if (state.isDiabeticMode) {
    // Logic for GI Level
    const sugar = recipe.sugarPer100g || Math.random() * 10;
    let giLabel = "IG LOW";
    let giClass = "text-green-500";
    if (sugar > 15) { giLabel = "IG HIGH"; giClass = "text-red-500"; }
    else if (sugar > 5) { giLabel = "IG MED"; giClass = "text-yellow-500"; }

    // Override top right badge in Diabetic Mode
    topRightBadge = `<div class="badge badge-gi ${giClass}" style="position: absolute; top: 12px; left: 12px;">${giLabel}</div>`;
  }

  // 2. Category Label
  const categoryMap = {
    'fish': 'POISSON',
    'meat': 'VIANDE',
    'veggie': 'VÉGÉ',
    'vegetarian': 'VÉGÉTARIEN',
    'vegan': 'VÉGÉTALIEN',
    'breakfast': 'PETIT-DÉJ',
    'lunch': 'DÉJEUNER',
    'dinner': 'DÎNER',
    'snack': 'COLLATION',
    'dessert': 'DESSERT',
    'salad': 'SALADE',
    'soup': 'SOUPE',
    'pasta': 'PÂTES',
    'asian': 'ASIATIQUE',
    'healthy': 'HEALTHY',
    'cheese': 'FROMAGE',
    'appetizer': 'APÉRITIF',
    'italian': 'ITALIEN',
    'thai': 'THAÏ',
    'mexican': 'MEXICAIN',
    'quick': 'RAPIDE',
    'comfort': 'COMFORT FOOD'
  };
  const rawCatValue = Array.isArray(recipe.category) ? (recipe.category[0] || 'plat') : (recipe.category || 'plat');
  const rawCat = rawCatValue.toLowerCase();
  const displayCat = categoryMap[rawCat] || rawCat.toUpperCase();

  let categoryLabel = `<div style="color: #a78bfa; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; text-transform: capitalize;">${displayCat.toLowerCase()}</div>`;
  if (recipe.isVegan) categoryLabel = `<div style="color: #a78bfa; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; text-transform: capitalize;">Végétalien</div>`;
  else if (recipe.isVegetarian) categoryLabel = `<div style="color: #a78bfa; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; text-transform: capitalize;">Veggie</div>`;

  // 3. Bottom Badges
  let bottomBadges = '';

  // Dietary Badges
  if (recipe.isGlutenFree) bottomBadges += `<span class="badge badge-glutenfree">SANS GLUTEN</span>`;
  if (recipe.isVegan) bottomBadges += `<span class="badge badge-vegan">VÉGÉTALIEN</span>`;
  else if (recipe.isVegetarian) bottomBadges += `<span class="badge badge-vegetarian">VÉGÉTARIEN</span>`;

  // Diabetic Badges
  if (state.isDiabeticMode) {
    if (recipe.diabeticFriendly) bottomBadges += `<span class="badge badge-diabetic">Sucre Contrôlé</span>`;
  }

  if (state.isEndoMode) {
    if (recipe.endometriosisFriendly) bottomBadges += `<span class="badge badge-endo">Anti-Inflammatoire</span>`;
  }

  const activeClass = isFavorite ? 'active' : '';

  card.innerHTML = `
    ${selectionOverlay}
    ${topRightBadge}
    
    <button class="recipe-favorite ${activeClass}" data-id="${recipe.id}" onclick="event.stopPropagation(); toggleFavorite('${recipe.id}', this)">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>
    
    <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 8px;">
        <div class="recipe-emoji" style="font-size: 3.5rem; background: rgba(0,0,0,0.2); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0;">${recipe.emoji || '<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"></path></svg>'}</div>
        <div style="flex: 1; text-align: left;">
            ${categoryLabel}
            ${recipe.originalId ? `<div style="color: #fbbf24; font-size: 0.7rem; font-weight: bold; margin-bottom: 2px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M12 2v20M2 12h20M7.5 7.5l9 9M7.5 16.5l9-9"></path></svg> MA VERSION</div>` : ''}
            <div class="recipe-name" style="font-size: 1.25rem; margin-bottom: 6px;">${recipe.name}</div>
            <div class="recipe-meta" style="justify-content: flex-start; gap: 12px; font-size: 0.9rem; color: var(--text-secondary);">
                <span> ${recipe.time}</span>
                ${state.isCalorieTrackingEnabled ? `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c-2.28 0-3.02-1.5-3.02-1.5C7.57 11.5 6 13 6 15c0 1.95 2.05 4 5 4 4.5 0 7-3.5 7-7 0-4.04-3.41-6.1-5-8-1 1-2 3-2 5a3 3 0 0 1-1 2.5"></path></svg> ${recipe.calories} kcal</span>` : ''}
            </div>
        </div>
    </div>

    ${bottomBadges ? `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">${bottomBadges}</div>` : ''}
  `;

  // Set data-id for global delegation
  card.setAttribute('data-recipe-id', recipe.id);

  // Robust click handling: Attach directly to avoid delegation issues with overlapping elements
  card.onclick = (e) => {
    // If we didn't click the favorite button
    if (!e.target.closest('.recipe-favorite')) {
      e.stopPropagation(); // Prevent doubling with and document listeners
      window.handleRecipeClick(recipe.id);
    }
  };

  container.appendChild(card);
}

// Global handler for recipe clicks
window.handleRecipeClick = function (id) {
  console.log("Handling click for:", id);

  // If the ID passed is already a custom version ID (starts with custom_), open it directly
  if (String(id).startsWith('custom_')) {
    const custom = state.customRecipes.find(r => String(r.id) === String(id));
    if (custom) {
      openRecipeDetail(custom);
      return;
    }
  }

  // Check for custom version for this original ID
  const customVersion = state.customRecipes.find(r => String(r.originalId) === String(id));

  if (customVersion) {
    showVersionChoiceModal(id, customVersion);
    return;
  }

  // Find the recipe in databases
  let recipe = recipesDatabase.find(r => String(r.id) === String(id));
  if (!recipe && state.recipes) recipe = state.recipes.find(r => String(r.id) === String(id));
  if (!recipe && typeof allRecipes !== 'undefined') recipe = allRecipes.find(r => String(r.id) === String(id));

  if (recipe) {
    openRecipeDetail(recipe);
  } else {
    console.error("Could not find recipe content for id:", id);
  }
};

function showVersionChoiceModal(originalId, customVersion) {
  const modal = document.getElementById('version-choice-modal');
  modal.classList.add('active'); // CSS uses .active for visibility
  modal.classList.remove('hidden');

  document.getElementById('open-custom-version-btn').onclick = () => {
    modal.classList.remove('active');
    modal.classList.add('hidden');
    openRecipeDetail(customVersion);
  };

  document.getElementById('open-original-version-btn').onclick = () => {
    modal.classList.remove('active');
    modal.classList.add('hidden');
    const original = recipesDatabase.find(r => String(r.id) === String(originalId));
    openRecipeDetail(original);
  };

  document.getElementById('cancel-version-btn').onclick = () => {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  };
}

function renderRecipesGrid(recipes, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  recipes.forEach(recipe => renderRecipeCard(recipe, container));
}

function renderHistoryList() {
  const container = document.getElementById('history-list');

  if (state.history.length === 0) {
    container.innerHTML = `
      <div class="favorites-empty" style="padding: var(--space-lg);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
          <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
        </svg>
        <p class="favorites-empty-text" style="margin-top: var(--space-md);">Aucune recette consultée</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  state.history.slice(-10).reverse().forEach(entry => {
    const recipe = (window.recipesDatabase || []).find(r => r.id === entry.recipeId);
    if (!recipe) return;

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-emoji">${recipe.emoji}</div>
      <div class="history-info">
        <div class="history-name">${recipe.name}</div>
        <div class="history-date">${formatDate(entry.date)}</div>
      </div>
      <div class="history-calories">${recipe.calories} kcal</div>
    `;
    item.addEventListener('click', () => openRecipeDetail(recipe));
    container.appendChild(item);
  });
}

function renderFavorites(showCustomOnly = false) {
  const container = document.getElementById('favorites-grid');
  const emptyState = document.getElementById('favorites-empty');
  if (!container || !emptyState) return;

  let favoriteRecipes;
  if (showCustomOnly) {
    favoriteRecipes = state.customRecipes;
  } else {
    favoriteRecipes = (window.recipesDatabase || []).filter(r => state.favorites.includes(String(r.id)) || state.favorites.includes(Number(r.id)));
  }

  if (favoriteRecipes.length === 0) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    const emptyText = emptyState.querySelector('.favorites-empty-text');
    if (showCustomOnly) {
      emptyText.textContent = "Vous n'avez pas encore créé de versions personnalisées.";
    } else {
      emptyText.textContent = "Aucune recette en favoris";
    }
  } else {
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    renderRecipesGrid(favoriteRecipes, 'favorites-grid');
  }
}

// Global listener for the new "Mes versions" button
document.addEventListener('DOMContentLoaded', () => {
  const versionsBtn = document.getElementById('show-my-versions-btn');
  if (versionsBtn) {
    versionsBtn.addEventListener('click', () => {
      versionsBtn.classList.toggle('active');
      if (versionsBtn.classList.contains('active')) {
        versionsBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78v0z"></path></svg> Mes favoris';
      } else {
        versionsBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M12 2v20M2 12h20M7.5 7.5l9 9M7.5 16.5l9-9"></path></svg> Mes versions';
      }
      renderFavorites(versionsBtn.classList.contains('active'));
    });
  }

  const manageBtn = document.getElementById('manage-favorites-btn');
  if (manageBtn) {
    manageBtn.onclick = toggleManageMode;
  }
});

function updateStats() {
  document.getElementById('stat-recipes').textContent = state.history.length;
  document.getElementById('stat-favorites').textContent = state.favorites.length;

  if (state.history.length > 0) {
    const totalCalories = state.history.reduce((sum, entry) => {
      const recipe = (window.recipesDatabase || []).find(r => r.id === entry.recipeId);
      return sum + (recipe ? recipe.calories : 0);
    }, 0);
    document.getElementById('stat-calories').textContent = Math.round(totalCalories / state.history.length);
  }

  updateSugarTracker();
}

function updateSugarTracker() {
  const trackerSection = document.getElementById('sugar-tracker-section');

  if (state.isDiabeticMode) {
    trackerSection.classList.remove('hidden');

    // Calculate today's sugar intake
    const today = new Date().toDateString();
    const todayCooked = state.cookedToday.filter(c => new Date(c.date).toDateString() === today);
    const totalSugar = todayCooked.reduce((sum, c) => sum + c.sugar, 0);

    const maxSugar = 50; // Daily recommended max for diabetics
    const percentage = Math.min((totalSugar / maxSugar) * 100, 100);

    document.getElementById('sugar-value').textContent = `${totalSugar}g`;
    document.getElementById('sugar-fill').style.width = `${percentage}%`;

    const sugarValue = document.getElementById('sugar-value');
    const statusLabel = document.getElementById('sugar-status');

    if (percentage >= 100) {
      sugarValue.classList.add('danger');
      sugarValue.classList.remove('warning');
      statusLabel.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Limite dépassée !';
    } else if (percentage >= 70) {
      sugarValue.classList.add('warning');
      sugarValue.classList.remove('danger');
      statusLabel.textContent = ' Attention, limite proche';
    } else {
      sugarValue.classList.remove('danger', 'warning');
      statusLabel.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Vous êtes dans la norme';
    }
  } else {
    trackerSection.classList.add('hidden');
  }
}

// ============================================
// Recipe Detail
// ============================================
function openRecipeDetail(recipeOrId) {
  let recipe;
  if (typeof recipeOrId === 'string') {
    recipe = recipesDatabase.find(r => r.id === recipeOrId);
  } else {
    recipe = recipeOrId;
  }

  if (!recipe) {
    console.error("Recipe not found:", recipeOrId);
    return;
  }

  state.currentRecipe = recipe;
  addToHistory(recipe.id);

  document.getElementById('detail-emoji').textContent = recipe.emoji;
  document.getElementById('detail-title').textContent = recipe.name;

  if (recipe.originalId) {
    const original = recipesDatabase.find(r => String(r.id) === String(recipe.originalId));
    document.getElementById('detail-title').innerHTML = `${recipe.name} <span style="font-size: 0.9rem; color: #fbbf24; display: block; font-weight: normal; margin-top: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M12 2v20M2 12h20M7.5 7.5l9 9M7.5 16.5l9-9"></path></svg> Votre version personnalisée</span>`;
  }
  document.getElementById('detail-time').textContent = recipe.time;
  document.getElementById('detail-time').textContent = recipe.time;

  // Calorie Tracking Logic
  const calorieEl = document.getElementById('detail-calories');
  if (state.isCalorieTrackingEnabled) {
    calorieEl.style.display = '';
    calorieEl.textContent = `${recipe.calories} kcal`;
  } else {
    calorieEl.style.display = 'none';
  }

  document.getElementById('detail-servings').textContent = `${recipe.servings} pers.`;

  // Sugar badge for diabetic mode
  const sugarBadge = document.getElementById('detail-sugar-badge');
  if (state.isDiabeticMode) {
    sugarBadge.style.display = 'flex';
    document.getElementById('detail-sugar-amount').textContent = `${recipe.sugar}g de sucre`;
  } else {
    sugarBadge.style.display = 'none';
  }

  // Diabetic info
  const diabeticInfo = document.getElementById('detail-diabetic-info');
  if (state.isDiabeticMode) {
    diabeticInfo.style.display = 'block';
    const glycemicText = recipe.glycemicIndex === 'low'
      ? 'Index glycémique bas - Excellent pour diabétiques'
      : recipe.glycemicIndex === 'medium'
        ? 'Index glycémique moyen - À consommer avec modération'
        : 'Index glycémique élevé - Non recommandé';
    document.getElementById('detail-glycemic-info').textContent = glycemicText;
  } else {
    diabeticInfo.style.display = 'none';
  }

  // Ingredients - now with quantities
  document.getElementById('detail-ingredients').innerHTML = recipe.ingredients.map(ing => {
    // Support both old (string) and new ({name, qty}) formats
    if (typeof ing === 'string') {
      return `<li>${ing}</li>`;
    }
    return `<li><span class="ingredient-qty">${ing.qty}</span> ${ing.name}</li>`;
  }).join('');

  // Steps
  // Steps
  document.getElementById('detail-steps').innerHTML = recipe.steps.map(step => {
    const text = (typeof step === 'object' && step !== null) ? step.text : step;
    return `<li>${text}</li>`;
  }).join('');

  // Cuisiner Buttons & Favorite logic now handled by global delegation
  document.getElementById('recipe-detail').classList.add('active');

  // Set up Create Version button
  const createBtn = document.getElementById('create-my-version-btn');
  createBtn.onclick = () => openRecipeEditMode(recipe);

  // Set up Delete button for custom versions
  const deleteBtn = document.getElementById('delete-custom-btn');
  if (recipe.originalId || String(recipe.id).startsWith('custom_')) {
    deleteBtn.style.display = 'block';
    deleteBtn.onclick = () => {
      if (confirm("Supprimer cette version personnalisée ?")) {
        deleteRecipe(recipe.id);
        closeRecipeDetail();
      }
    };
  } else {
    deleteBtn.style.display = 'none';
  }
}

// ============================================
// Recipe Customization Logic
// ============================================
let editingRecipeId = null;

function openRecipeEditMode(recipe) {
  editingRecipeId = recipe.originalId || recipe.id;
  const overlay = document.getElementById('recipe-edit-mode');
  overlay.classList.add('active');
  document.body.classList.add('edit-mode-active');

  document.getElementById('edit-recipe-name').value = recipe.name;

  renderEditIngredients(recipe.ingredients);
  renderEditSteps(recipe.steps);

  document.getElementById('edit-back').onclick = () => {
    overlay.classList.remove('active');
    document.body.classList.remove('edit-mode-active');
  };

  document.getElementById('add-edit-ingredient-btn').onclick = () => {
    const list = document.getElementById('edit-ingredients-list');
    list.appendChild(createIngredientRow({ name: '', qty: '' }));
  };

  document.getElementById('add-edit-step-btn').onclick = () => {
    const list = document.getElementById('edit-steps-list');
    list.appendChild(createStepRow(''));
  };

  document.getElementById('save-custom-recipe-btn').onclick = saveCustomRecipe;
}

function renderEditIngredients(ingredients) {
  const container = document.getElementById('edit-ingredients-list');
  container.innerHTML = '';
  ingredients.forEach(ing => {
    const row = createIngredientRow(typeof ing === 'string' ? { name: ing, qty: '' } : ing);
    container.appendChild(row);
  });
}

function createIngredientRow(ing) {
  const div = document.createElement('div');
  div.className = 'ingredient-edit-row';
  div.innerHTML = `
    <input type="text" placeholder="Qté" class="glass-input ing-qty" style="width: 80px;" value="${ing.qty}">
    <input type="text" placeholder="Ingrédient" class="glass-input ing-name" style="flex: 1;" value="${ing.name}">
    <button class="remove-btn">×</button>
  `;
  div.querySelector('.remove-btn').onclick = () => div.remove();
  return div;
}

function renderEditSteps(steps) {
  const container = document.getElementById('edit-steps-list');
  container.innerHTML = '';
  steps.forEach(step => {
    const text = (typeof step === 'object') ? step.text : step;
    const row = createStepRow(text);
    container.appendChild(row);
  });
}

function createStepRow(text) {
  const div = document.createElement('div');
  div.className = 'step-edit-row';
  div.innerHTML = `
    <textarea class="glass-input step-text" style="flex: 1; min-height: 60px; resize: none;">${text}</textarea>
    <button class="remove-btn">×</button>
  `;
  div.querySelector('.remove-btn').onclick = () => div.remove();
  return div;
}

function saveCustomRecipe() {
  const name = document.getElementById('edit-recipe-name').value;
  const ingredients = Array.from(document.querySelectorAll('.ingredient-edit-row')).map(row => ({
    qty: row.querySelector('.ing-qty').value,
    name: row.querySelector('.ing-name').value
  }));
  const steps = Array.from(document.querySelectorAll('.step-edit-row')).map(row => row.querySelector('.step-text').value);

  const originalRecipe = recipesDatabase.find(r => String(r.id) === String(editingRecipeId)) ||
    state.customRecipes.find(r => String(r.originalId) === String(editingRecipeId));

  const customRecipe = {
    ...originalRecipe,
    id: `custom_${editingRecipeId}_${Date.now()}`,
    originalId: editingRecipeId,
    name: name,
    ingredients: ingredients,
    steps: steps,
    isCustom: true,
    lastModified: Date.now()
  };

  // Remove existing custom version for this original if it exists
  state.customRecipes = state.customRecipes.filter(r => String(r.originalId) !== String(editingRecipeId));
  state.customRecipes.push(customRecipe);

  localStorage.setItem('wemeal_custom_recipes', JSON.stringify(state.customRecipes));

  alert(`Votre version a été enregistrée ! <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical - align: middle; margin - right: 4px; "><path d="M12 2v20M2 12h20M7.5 7.5l9 9M7.5 16.5l9 - 9"></path></svg>`);
  document.getElementById('recipe-edit-mode').classList.remove('active');
  document.body.classList.remove('edit-mode-active');

  // Trigger Firebase Sync
  window.dispatchEvent(new CustomEvent('profile-updated'));

  openRecipeDetail(customRecipe);
}

function deleteRecipe(recipeId) {
  // Remove from custom recipes
  state.customRecipes = state.customRecipes.filter(r => String(r.id) !== String(recipeId));
  localStorage.setItem('wemeal_custom_recipes', JSON.stringify(state.customRecipes));

  // Remove from favorites
  state.favorites = state.favorites.filter(id => String(id) !== String(recipeId));
  localStorage.setItem('wemeal_favorites', JSON.stringify(state.favorites));

  // Trigger Firebase Sync
  window.dispatchEvent(new CustomEvent('profile-updated'));

  // Refresh UI
  if (state.currentPage === 'favorites') {
    renderFavorites();
  }
  updateStats();
}

function toggleManageMode() {
  state.isManageMode = !state.isManageMode;
  state.selectedFavoriteIds = [];

  const controls = document.getElementById('manage-favorites-controls');
  const manageBtn = document.getElementById('manage-favorites-btn');

  if (state.isManageMode) {
    controls.classList.remove('hidden');
    manageBtn.textContent = 'Terminer';
    manageBtn.classList.add('active');
  } else {
    controls.classList.add('hidden');
    manageBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Gérer';
    manageBtn.classList.remove('active');
  }

  updateSelectedCount();
  renderFavorites();
}

function updateSelectedCount() {
  const countSpan = document.getElementById('selected-count');
  if (countSpan) {
    countSpan.textContent = `${state.selectedFavoriteIds.length} sélectionnées`;
  }
}

function selectAllFavorites() {
  let favoriteRecipes;
  if (document.getElementById('show-my-versions-btn').classList.contains('active')) {
    favoriteRecipes = state.customRecipes;
  } else {
    favoriteRecipes = (window.recipesDatabase || []).filter(r => state.favorites.includes(String(r.id)) || state.favorites.includes(Number(r.id)));
  }

  state.selectedFavoriteIds = favoriteRecipes.map(r => String(r.id));
  updateSelectedCount();
  renderFavorites();
}

function deleteSelectedFavorites() {
  if (state.selectedFavoriteIds.length === 0) return;

  if (confirm(`Supprimer les ${state.selectedFavoriteIds.length} recettes sélectionnées ?`)) {
    state.selectedFavoriteIds.forEach(id => {
      // Logic from deleteRecipe but batched
      state.customRecipes = state.customRecipes.filter(r => String(r.id) !== String(id));
      state.favorites = state.favorites.filter(fid => String(fid) !== String(id));
    });

    localStorage.setItem('wemeal_custom_recipes', JSON.stringify(state.customRecipes));
    localStorage.setItem('wemeal_favorites', JSON.stringify(state.favorites));

    state.selectedFavoriteIds = [];
    state.isManageMode = false;
    document.getElementById('manage-favorites-controls').classList.add('hidden');
    document.getElementById('manage-favorites-btn').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Gérer';

    window.dispatchEvent(new CustomEvent('profile-updated'));
    renderFavorites();
    updateStats();
    alert(`Recettes supprimées ! <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical - align: middle; margin - right: 4px; "><path d="M12 2v20M2 12h20M7.5 7.5l9 9M7.5 16.5l9 - 9"></path></svg>`);
  }
}

function closeRecipeDetail() {
  document.getElementById('recipe-detail').classList.remove('active');
  state.currentRecipe = null;
  renderFavorites();
  updateStats();
}

// ============================================
// Cooking Mode
// ============================================
let cookingTimerInterval = null;

function startCookingMode() {
  if (!state.currentRecipe) return;
  state.cookingStep = 0;
  const cookingMode = document.getElementById('cooking-mode');

  // Reset UI
  // Classic progress is handled in updateCookingStep via dots

  // Show the overlay
  cookingMode.classList.add('active');

  // Setup close button
  const closeBtn = document.getElementById('cooking-close');
  if (closeBtn) {
    // Remove old listeners to avoid duplicates if any
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener('click', exitCookingMode);
  }

  // Setup Next button
  const nextBtn = document.getElementById('cooking-next-btn');
  if (nextBtn) {
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    // Listener added in updateCookingStep or here? 
    // Better here for static reference, but the action changes (Next vs Finish).
    // actually updateCookingStep handles text and reused onclick or addEventListener.
    // Let's stick to updateCookingStep managing the button state.
  }

  // Start Voice Assistant Logic (auto-start if coming from "Cuisiner avec Assistant")
  if (window.autoStartVoice) {
    window.autoStartVoice = false; // reset
    // Wait a bit for UI
    setTimeout(() => {
      if (typeof toggleVoiceAssistant === 'function') {
        // Check if not already active to avoid toggling off
        if (!window.voiceAssistantActive) toggleVoiceAssistant();
      }
    }, 500);
  } else {
    // If we have a voice button in the cooking header, make sure it reflects state
    updateVoiceButtonUI();
  }

  updateCookingStep();
}

function updateCookingStep() {
  const recipe = state.currentRecipe;
  const index = state.cookingStep;

  // Safety check
  if (!recipe || !recipe.steps || index >= recipe.steps.length) return;

  const rawStep = recipe.steps[index];

  // Normalize step data (handle string vs object)
  let stepText = '';
  // Timer support
  // Reset timer for new step
  resetTimer();

  if (typeof rawStep === 'string') {
    stepText = rawStep;
  } else {
    stepText = rawStep.text;
  }

  // Extract duration
  const duration = extractTimeFromStep(stepText);
  if (duration > 0) {
    currentTimerDuration = duration;
    window.timerRemaining = duration; // Reset remaining
    updateTimerUI(duration);
  } else {
    // Hide timer if no time detected
    const container = document.getElementById('step-timer-container');
    if (container) container.classList.add('hidden');
  }

  if (typeof rawStep === 'string') {
    stepText = rawStep;
  } else {
    stepText = rawStep.text;
  }

  // Update Progress
  // The classic HTML might use dots or a bar. 
  // index.html has:
  // <div class="cooking-progress" id="cooking-progress"></div>
  // index.css has .cooking-progress-dot
  // So we should render dots.

  const progressContainer = document.getElementById('cooking-progress');
  if (progressContainer) {
    progressContainer.innerHTML = '';
    recipe.steps.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `cooking-progress-dot ${i === index ? 'active' : ''} ${i < index ? 'completed' : ''}`;
      progressContainer.appendChild(dot);
    });
  }

  // Update Text
  document.getElementById('cooking-step-number').textContent = `Étape ${index + 1} sur ${recipe.steps.length}`;
  document.getElementById('cooking-step-text').textContent = stepText;

  // Animation reset
  const anim = document.getElementById('cooking-emoji');
  if (anim) {
    // Trigger reflow to restart animation if needed, or just leave it bouncin'
    anim.style.animation = 'none';
    anim.offsetHeight; /* trigger reflow */
    anim.style.animation = null;
  }

  // Update Buttons
  const nextBtn = document.getElementById('cooking-next-btn');
  if (nextBtn) {
    if (index === recipe.steps.length - 1) {
      nextBtn.textContent = 'Terminer !';
      nextBtn.onclick = showCookingComplete;
    } else {
      nextBtn.textContent = "C'est fait !"; // Classic text
      nextBtn.onclick = nextStep;
    }
  }

  // Speak text if voice assistant is active
  if (window.voiceAssistantActive && typeof speakText === 'function') {
    speakText(stepText);
  }
}


function nextStep() {
  if (state.currentRecipe && state.cookingStep < state.currentRecipe.steps.length - 1) {
    state.cookingStep++;
    updateCookingStep();
  }
}

function prevStep() {
  if (state.cookingStep > 0) {
    state.cookingStep--;
    updateCookingStep();
  }
}

function exitCookingMode() {
  closeCookingMode();
}

function showCookingComplete() {
  // Use existing structure or replace content temporarily?
  // Classic design usually replaced the content provided in index.html
  // Let's check index.css for .cooking-complete
  // Yes, it exists.

  const content = document.getElementById('cooking-content');
  // Save original content to restore later? 
  // actually closeCookingMode resets it manually in the original code.

  if (!content) return;

  content.innerHTML = `
    <div class="cooking-complete">
      <div class="cooking-complete-emoji">${window.ICONS.ui.star}</div>
      <div class="cooking-complete-title">Bravo Chef !</div>
      <div class="cooking-complete-text">Votre ${state.currentRecipe.name} est prêt(e) !</div>
      <button class="btn btn-primary cooking-done-btn" id="cooking-finish-btn">
        Bon appétit !
      </button>
    </div>
  `;

  // Track cooked recipe for sugar tracker
  state.cookedToday.push({
    recipeId: state.currentRecipe.id,
    sugar: state.currentRecipe.sugar,
    date: new Date().toISOString()
  });
  localStorage.setItem('wemeal_cooked_today', JSON.stringify(state.cookedToday));

  // Also track for the meal plan checkmarks
  if (!state.cookedRecipes.includes(state.currentRecipe.id)) {
    state.cookedRecipes.push(state.currentRecipe.id);
    localStorage.setItem('wemeal_cooked_recipes', JSON.stringify(state.cookedRecipes));
    // Refresh planning grid if it exists
    if (typeof renderMealPlan === 'function') {
      renderMealPlan();
    }
  }

  setTimeout(() => {
    const finishBtn = document.getElementById('cooking-finish-btn');
    if (finishBtn) finishBtn.addEventListener('click', closeCookingMode);
  }, 0);
}

function closeCookingMode() {
  document.getElementById('cooking-mode').classList.remove('active');

  // Stop Voice Assistant if active
  if (typeof stopVoiceAssistant === 'function') {
    stopVoiceAssistant();
  }

  // Stop Timer
  resetTimer();

  // Reset cooking content to default state for next time
  const content = document.getElementById('cooking-content');
  if (content) {
    // Restore default HTML structure including the hidden timer container we just added
    content.innerHTML = `
        <div class="cooking-emoji" id="cooking-emoji"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"></path></svg></div>
        <div class="cooking-step-number" id="cooking-step-number">Étape 1 sur 5</div>
        <div class="cooking-step-text" id="cooking-step-text"></div>
        
        <!-- Timer Container -->
        <div id="step-timer-container" class="hidden">
           <button class="btn btn-glass" id="start-timer-btn" onclick="toggleTimer()">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Lancer le minuteur
           </button>
           <div class="timer-display hidden" id="timer-display">00:00</div>
        </div>

        <button class="btn btn-primary cooking-done-btn" id="cooking-next-btn">
            C'est fait !
        </button>
      `;
  }
}

// ============================================
// Timer Logic
// ============================================
let currentTimerDuration = 0;
let isTimerRunning = false;

function extractTimeFromStep(stepText) {
  // Regex to find "X min" or "X minutes" or "X h"
  // Simple extraction for minutes first
  const match = stepText.match(/(\d+)\s*(min|minute|minutes)/i);
  if (match) {
    return parseInt(match[1]) * 60; // seconds
  }
  // Hours?
  const matchH = stepText.match(/(\d+)\s*(h|heure|heures)/i);
  if (matchH) {
    return parseInt(matchH[1]) * 3600;
  }
  return 0;
}

function updateTimerUI(seconds) {
  const display = document.getElementById('timer-display');
  const btn = document.getElementById('start-timer-btn');
  const container = document.getElementById('step-timer-container');

  if (!display || !btn || !container) return;

  if (seconds > 0 || currentTimerDuration > 0) {
    container.classList.remove('hidden');

    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;

    if (isTimerRunning) {
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Pause';
      btn.classList.add('btn-warning');
      display.classList.remove('hidden');
    } else {
      if (seconds === currentTimerDuration) {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Lancer (${Math.floor(seconds / 60)} min)`;
        btn.classList.remove('btn-warning');
        display.classList.add('hidden');
      } else {
        btn.textContent = '▶️ Reprendre';
        btn.classList.remove('btn-warning');
        display.classList.remove('hidden');
      }
    }
  } else {
    container.classList.add('hidden');
  }
}

function toggleTimer() {
  if (isTimerRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (!currentTimerDuration) return;

  isTimerRunning = true;
  // If we were paused, we have remaining time in the display parsing? 
  // Actually better to keep a remaining state variable.
  // Simplified: check text content if we are resuming?
  // Let's use a module-level variable for remaining time if we want to be robust, 
  // but for now, let's assume we start from currentTimerDuration if it's the first run,
  // or resume if we have a way to track. 

  // A better approach for this simple requirements:
  // 1. If we are paused (isTimerRunning = false) but display is visible and not 00:00, we resume.
  // 2. If we are clean, we start fresh.

  // Let's refine the state:
  // We likely need `timerRemaining` var.
  if (typeof window.timerRemaining === 'undefined' || window.timerRemaining === null) {
    window.timerRemaining = currentTimerDuration;
  }

  clearInterval(cookingTimerInterval);
  updateTimerUI(window.timerRemaining); // Update btn text immediately

  cookingTimerInterval = setInterval(() => {
    if (window.timerRemaining > 0) {
      window.timerRemaining--;
      updateTimerUI(window.timerRemaining);
    } else {
      // Done
      timerFinished();
    }
  }, 1000);
}

function pauseTimer() {
  isTimerRunning = false;
  clearInterval(cookingTimerInterval);
  updateTimerUI(window.timerRemaining);
}

function resetTimer() {
  isTimerRunning = false;
  clearInterval(cookingTimerInterval);
  window.timerRemaining = null;
  currentTimerDuration = 0;
  // UI update handled by updateCookingStep mostly, or explicit hide
  const container = document.getElementById('step-timer-container');
  if (container) container.classList.add('hidden');
}

function timerFinished() {
  pauseTimer();

  // 1. Play Alarm Sound (Oscillator)
  playAlarmSound();

  // 2. Update UI to "Finished" State
  const container = document.getElementById('step-timer-container');
  if (container) {
    container.innerHTML = `
      <div class="timer-alarm-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2 2"></path><path d="M5 3L2 6"></path><path d="M19 3l3 3"></path></svg></div>
      <div class="timer-display" style="color: #fca5a5;">TERMINÉ !</div>
      <button class="btn btn-danger" onclick="stopAlarm()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> Arrêter la sonnerie
      </button>
    `;
    container.classList.add('timer-finished');
    container.classList.remove('hidden');
  }

  // Vibrate device
  if ("vibrate" in navigator) {
    navigator.vibrate([500, 200, 500, 200, 500]);
  }
}

// Audio Context for Alarm
let audioCtx;
let alarmOscillator;
let alarmInterval;

function playAlarmSound() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Resume context if suspended (browser policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Create a beeping pattern
  const playBeep = () => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime + 0.1); // A4

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  };

  playBeep();
  alarmInterval = setInterval(playBeep, 1000); // Repeat every second
}

function stopAlarm() {
  // Stop Sound
  if (alarmInterval) clearInterval(alarmInterval);

  // Reset UI
  resetTimer();

  // Restore Timer UI (resetTimer hides it, but we want to show the 'Start' button again for this step)
  const container = document.getElementById('step-timer-container');
  if (container) {
    container.classList.remove('timer-finished');
    container.innerHTML = `
       <button class="btn btn-glass" id="start-timer-btn" onclick="toggleTimer()">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Lancer le minuteur
       </button>
       <div class="timer-display hidden" id="timer-display">00:00</div>
    `;
    // Re-initialize default state text if needed
    if (currentTimerDuration > 0) {
      updateTimerUI(currentTimerDuration);
    }
  }
}

// ============================================
// Shopping List
// ============================================

function addToShoppingList(ingredients) {
  console.log("addToShoppingList called with", ingredients);
  if (!ingredients || ingredients.length === 0) {
    console.error("No ingredients provided to addToShoppingList");
    showToast("Aucun ingrédient à ajouter.");
    return;
  }

  ingredients.forEach((item, index) => {
    // Support both old (string) and new ({name, qty}) formats
    let displayName;
    if (typeof item === 'string') {
      displayName = item.trim();
    } else {
      displayName = `${item.qty || ''} ${item.name}`.trim();
    }

    const existing = state.shoppingList.find(i => i.name === displayName);

    if (!existing) {
      // Use a more robust ID to avoid collisions (timestamp + random + index)
      const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}-${index}`;
      state.shoppingList.push({
        id: uniqueId,
        name: displayName,
        checked: false
      });
    }
  });

  saveShoppingList();
  renderShoppingList();

  // Show quick feedback
  const btn = document.getElementById('add-to-shopping-list-btn');
  if (btn) {
    console.log("Updating shopping list button feedback");

    // Save original content if not already saved (to avoid sticking on "Ajouté")
    if (!btn.dataset.originalText) {
      btn.dataset.originalText = btn.innerHTML;
    }

    btn.innerHTML = '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Ajouté !</span>';
    btn.classList.add('btn-success');

    setTimeout(() => {
      btn.innerHTML = btn.dataset.originalText;
      btn.classList.remove('btn-success');
    }, 2000);
  } else {
    console.error("Shopping list button not found");
  }
}

function saveShoppingList() {
  localStorage.setItem('wemeal_shopping_list', JSON.stringify(state.shoppingList));
  window.dispatchEvent(new CustomEvent('profile-updated'));
}

function toggleShoppingItem(id) {
  // Use loose equality (==) or string conversion to handle both old numeric IDs and new string IDs
  const item = state.shoppingList.find(i => String(i.id) === String(id));
  if (item) {
    item.checked = !item.checked;
    saveShoppingList();
    renderShoppingList();
  }
}

function clearShoppingList() {
  const clearBtn = document.getElementById('clear-shopping-list');
  if (!clearBtn) return;

  if (clearBtn.dataset.confirming === 'true') {
    state.shoppingList = [];
    saveShoppingList();
    renderShoppingList();

    // Reset button
    clearBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> Vider la liste';
    clearBtn.style.backgroundColor = '';
    delete clearBtn.dataset.confirming;

    if (typeof showToast === 'function') showToast("Liste vidée.");
  } else {
    clearBtn.dataset.confirming = 'true';
    clearBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Confirmer ?';
    clearBtn.style.backgroundColor = 'rgba(255,107,107,0.2)';

    setTimeout(() => {
      if (clearBtn.dataset.confirming === 'true') {
        clearBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> Vider la liste';
        clearBtn.style.backgroundColor = '';
        delete clearBtn.dataset.confirming;
      }
    }, 3000);
  }
}

function sanitizeShoppingList() {
  if (!state.shoppingList || state.shoppingList.length === 0) return;

  const seenIds = new Set();
  let changed = false;

  state.shoppingList.forEach((item, index) => {
    const idStr = String(item.id);
    if (seenIds.has(idStr)) {
      // Collision detected! Patch the ID to be unique
      item.id = `${idStr}-patch-${index}`;
      changed = true;
    }
    seenIds.add(String(item.id));
  });

  if (changed) {
    console.warn(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical - align: middle; margin - right: 4px; "><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71 - 3L13.71 3.86a2 2 0 0 0 - 3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Shopping list collisions detected and patched.`);
    saveShoppingList();
  }
}

function renderShoppingList() {
  // Fix any existing collisions in memory before rendering
  sanitizeShoppingList();

  const container = document.getElementById('shopping-list-items');
  const emptyState = document.getElementById('shopping-empty');
  const clearBtn = document.getElementById('clear-shopping-list');
  const manageBtn = document.getElementById('manage-shopping-btn');
  const affiliatesSection = document.getElementById('shopping-affiliates');

  if (state.shoppingList.length === 0) {
    container.classList.add('hidden');
    clearBtn.classList.add('hidden');
    if (manageBtn) manageBtn.classList.add('hidden');
    if (affiliatesSection) affiliatesSection.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  clearBtn.classList.remove('hidden');
  if (manageBtn) {
    manageBtn.classList.remove('hidden');
    manageBtn.textContent = state.isShoppingEditMode ? 'Terminer' : 'Gérer';
  }
  if (affiliatesSection) affiliatesSection.classList.remove('hidden');
  emptyState.classList.add('hidden');

  container.innerHTML = state.shoppingList.map(item => {
    if (state.isShoppingEditMode) {
      return `
        <li class="shopping-item editing">
          <input type="text" class="edit-qty" value="${item.qty}" onchange="updateShoppingItem('${item.id}', 'qty', this.value)">
          <input type="text" class="edit-name" value="${item.name}" onchange="updateShoppingItem('${item.id}', 'name', this.value)">
          <button class="btn-delete-item" onclick="removeFromShoppingList('${item.id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
        </li>
      `;
    }
    return `
      <li class="shopping-item ${item.checked ? 'checked' : ''}" onclick="toggleShoppingItem('${item.id}')">
        <div class="shopping-checkbox"></div>
        <span>${item.name}</span>
        <span class="item-qty">${item.qty}</span>
      </li>
    `;
  }).join('');
}

window.toggleShoppingEdit = function () {
  state.isShoppingEditMode = !state.isShoppingEditMode;
  renderShoppingList();
};

window.updateShoppingItem = function (id, field, value) {
  const item = state.shoppingList.find(i => i.id === id);
  if (item) {
    item[field] = value;
    localStorage.setItem('wemeal_shopping_list', JSON.stringify(state.shoppingList));
  }
};


// ============================================
// Favorites Management
// ============================================
function toggleFavorite(recipeId, buttonElement) {
  const index = state.favorites.indexOf(recipeId);

  if (index === -1) {
    // Freemium Limit Check
    if (!state.isPremium && state.favorites.length >= 15) {
      showPremiumPaywall('favorites');
      return;
    }
    state.favorites.push(recipeId);
    // Show confirmation
    showToast(`Ajouté aux favoris <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical - align: middle; margin - right: 4px; "><path d="M20.84 4.61a5.5 5.5 0 0 0 - 7.78 0L12 5.67l - 1.06 - 1.06a5.5 5.5 0 0 0 - 7.78 7.78l1.06 1.06L12 21.23l7.78 - 7.78 1.06 - 1.06a5.5 5.5 0 0 0 0 - 7.78v0z"></path></svg>`);
  } else {
    state.favorites.splice(index, 1);
    showToast("Retiré des favoris ");
  }

  localStorage.setItem('wemeal_favorites', JSON.stringify(state.favorites));
  updateStats();
  renderFavorites();
  window.dispatchEvent(new CustomEvent('profile-updated'));

  // Update ALL instances of this favorite button (Card, Detail, Favorites List)
  const isFav = index === -1;
  const allButtons = document.querySelectorAll(`.recipe-favorite[data-id="${recipeId}"], #recipe-detail-favorite`);

  allButtons.forEach(b => {
    // Check if it's the detail button which matches via ID, verify context if needed
    // Actually detail button doesn't have data-id usually, but we selected by ID.
    // If we are in detail view for THIS recipe, update it.
    if (b.id === 'recipe-detail-favorite') {
      if (state.currentRecipe && String(state.currentRecipe.id) === String(recipeId)) {
        b.classList.toggle('active', isFav);
      }
    } else {
      b.classList.toggle('active', isFav);
    }
  });
}

// ============================================
// History Management
// ============================================
function addToHistory(recipeId) {
  state.history.push({ recipeId, date: new Date().toISOString() });
  localStorage.setItem('wemeal_history', JSON.stringify(state.history));
  window.dispatchEvent(new CustomEvent('profile-updated'));
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR');
}

// ============================================
// Diabetic Mode
// ============================================
function toggleDiabeticMode(enabled) {
  state.isDiabeticMode = enabled;
  localStorage.setItem('wemeal_diabetic', JSON.stringify(enabled));

  const infoCard = document.getElementById('diabetic-info');
  infoCard.classList.toggle('hidden', !enabled);

  updateSugarTracker();
  updateProfileModeBadges();
  updateProfileDisplay();
  initializeHome();
}

function showGlycemiaModal() {
  document.getElementById('glycemia-modal').classList.add('active');
}

function hideGlycemiaModal() {
  document.getElementById('glycemia-modal').classList.remove('active');
}

function toggleVegetarianMode(enabled) {
  state.isVegetarianMode = enabled;
  localStorage.setItem('wemeal_vegetarian', JSON.stringify(enabled));

  // Mutual exclusion: If Vegetarian ON, Vegan OFF
  if (enabled && state.isVeganMode) {
    state.isVeganMode = false;
    localStorage.setItem('wemeal_vegan', 'false');
    const veganToggle = document.getElementById('vegan-toggle');
    if (veganToggle) veganToggle.checked = false;
    const veganInfo = document.getElementById('vegan-info');
    if (veganInfo) veganInfo.classList.add('hidden');
  }

  const vegInfo = document.getElementById('vegetarian-info');
  if (vegInfo) {
    if (enabled) {
      vegInfo.classList.remove('hidden');
    } else {
      vegInfo.classList.add('hidden');
    }
  }

  updateProfileModeBadges();
  updateProfileDisplay();
  initializeHome();
  window.dispatchEvent(new CustomEvent('profile-updated'));
}

function toggleVeganMode(enabled) {
  state.isVeganMode = enabled;
  localStorage.setItem('wemeal_vegan', JSON.stringify(enabled));

  // Mutual exclusion: If Vegan ON, Vegetarian OFF
  if (enabled && state.isVegetarianMode) {
    state.isVegetarianMode = false;
    localStorage.setItem('wemeal_vegetarian', 'false');
    const vegToggle = document.getElementById('vegetarian-toggle');
    if (vegToggle) vegToggle.checked = false;
    const vegInfo = document.getElementById('vegetarian-info');
    if (vegInfo) vegInfo.classList.add('hidden');
  }

  // Update Info Card Visibility
  const infoCard = document.getElementById('vegan-info');
  if (infoCard) {
    if (enabled) infoCard.classList.remove('hidden');
    else infoCard.classList.add('hidden');
  }

  updateProfileModeBadges();
  updateProfileDisplay();
  initializeHome(); // Refresh recipes
  window.dispatchEvent(new CustomEvent('profile-updated'));
}

function toggleGlutenFreeMode(enabled) {
  state.isGlutenFreeMode = enabled;
  localStorage.setItem('wemeal_gluten_free', JSON.stringify(enabled));

  // Update Info Card Visibility
  const infoCard = document.getElementById('gluten-free-info');
  if (infoCard) {
    if (enabled) infoCard.classList.remove('hidden');
    else infoCard.classList.add('hidden');
  }

  updateProfileModeBadges();
  updateProfileDisplay();
  initializeHome();
  window.dispatchEvent(new CustomEvent('profile-updated'));
}

function updateProfileModeBadges() {
  const container = document.getElementById('profile-mode-badges');
  const profileAvatar = document.getElementById('profile-avatar');

  if (profileAvatar) {
    if (state.isEndoMode) {
      profileAvatar.style.border = '3px solid #ec4899'; // Pink
    } else if (state.isDiabeticMode) {
      profileAvatar.style.border = '3px solid #ef4444'; // Red
    } else if (state.isGlutenFreeMode) {
      profileAvatar.style.border = '3px solid #f97316'; // Orange
    } else if (state.isVeganMode || state.isVegetarianMode) {
      profileAvatar.style.border = '3px solid #22c55e'; // Green
    } else {
      profileAvatar.style.border = '3px solid transparent';
    }
  }

  if (!container) return;

  let badges = '';
  if (state.isEndoMode) {
    badges += `<span class="profile-mode-badge endo" style="background: rgba(236, 72, 153, 0.2); color: #ec4899;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ec4899" style="margin-right: 4px; vertical-align: middle;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
      Endo
    </span>`;
  }
  if (state.isDiabeticMode) {
    badges += `<span class="profile-mode-badge diabetic">
      <span style="font-size: 1.2rem;"></span>
      Diabétique
    </span>`;
  }
  if (state.isVegetarianMode && !state.isVeganMode) {
    badges += `<span class="profile-mode-badge vegetarian">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
      Végétarien
    </span>`;
  }
  if (state.isVeganMode) {
    badges += `<span class="profile-mode-badge vegan">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      Végétalien
    </span>`;
  }
  if (state.isGlutenFreeMode) {
    badges += `<span class="profile-mode-badge gluten-free" style="background: rgba(249, 115, 22, 0.2); color: #f97316;">
      <span style="font-size: 1.2rem;"></span>
      Sans Gluten
    </span>`;
  }

  // Debug Badge/Button inside profile
  if (window.firebaseUser && state.userProfile && state.userProfile.hasDebugAccess) {
    badges += `<button onclick="switchPage('debug')" class="profile-mode-badge debug" style="background: rgba(139, 92, 246, 0.2); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.4); cursor: pointer;">
      <span style="font-size: 1.2rem;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg></span>
      Debug Mode
    </button>`;
  }

  container.innerHTML = badges;
}

function deleteAccount() {
  if (confirm('Voulez-vous vraiment supprimer toutes vos données ? Cette action est irréversible.')) {
    localStorage.clear();
    location.reload();
  }
}

// ============================================
// Navigation
// ============================================
// ============================================
// ROUTING SYSTEM
// ============================================
const ROUTES = {
  'home': '/',
  'surprise': '/surprise',
  'cooking': '/cooking',
  'profile': '/profile',
  'shopping-list': '/shopping-list',
  'scan': '/scan',
  'debug': '/debug'
};

const REVERSE_ROUTES = {
  '/': 'home',
  '/surprise': 'surprise',
  '/cooking': 'cooking',
  '/profile': 'profile',
  '/shopping-list': 'shopping-list',
  '/scan': 'scan',
  '/debug': 'debug'
};

function updateURL(pageName) {
  const path = ROUTES[pageName];
  if (path) {
    // Only push if different
    if (window.location.pathname !== path) {
      history.pushState({ page: pageName }, "", path);
      console.log(` Route updated: ${path}`);
    }
  }
}

function handleDeepLink() {
  const path = window.location.pathname;
  // Handle /surprise/something? No, just strict for now.
  const cleanPath = path === '/' ? '/' : path.replace(/\/$/, "");

  const pageName = REVERSE_ROUTES[cleanPath] || 'home';
  console.log(` Deep Link: ${cleanPath} -> ${pageName}`);

  // Replace state to ensuring deep link is in history
  history.replaceState({ page: pageName }, "", path);

  switchPage(pageName, false); // false = don't push state again
}

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.page) {
    console.log(` Back to: ${event.state.page}`);
    switchPage(event.state.page, false);
  } else {
    switchPage('home', false);
  }
});

function switchPage(pageName, shouldUpdateURL = true) {
  state.currentPage = pageName;

  // Update URL if requested
  if (shouldUpdateURL) {
    updateURL(pageName);
  }

  // CORRECT LOGIC: Use .page and .active class based on index.html structure
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  const target = document.getElementById(`page-${pageName}`);
  if (target) {
    target.classList.add('active');
  } else {
    // Fallback if ID not found (e.g. shopping-list might differ?)
    console.warn(`Page ID page-${pageName} not found`);
  }

  // Update nav
  document.querySelectorAll('.bottom-nav .nav-item').forEach(el => el.classList.remove('active'));
  const navItem = document.querySelector(`.bottom-nav .nav-item[data-page="${pageName}"]`);
  if (navItem) navItem.classList.add('active');

  // Update Limits UI on view switch
  updateFreeLimitsUI();

  // Specific logic
  if (pageName === 'home') {
    initializeHome();
    // Maybe refresh?
  }

  switch (pageName) {
    case 'favorites': renderFavorites(); break;
    case 'shopping': renderShoppingList(); break;
    case 'profile': renderHistoryList(); updateStats(); updateProfileModeBadges(); break;
    case 'debug': updateDebugStateUI(); break;
  }
}

// ============================================
// WeMeal+ Free Limits Sync  
// ============================================
function updateFreeLimitsUI() {
  const surpriseText = document.getElementById('surprise-limit-text');
  const favText = document.getElementById('favorites-limit-text');
  const freemiumBlock = document.getElementById('freemium-action-block');
  const premiumBlock = document.getElementById('premium-action-block');

  if (state.isPremium) {
    if (surpriseText) surpriseText.style.display = 'none';
    if (favText) favText.style.display = 'none';

    // Profile view UI
    if (freemiumBlock) freemiumBlock.classList.add('hidden');
    if (premiumBlock) premiumBlock.classList.remove('hidden');

    // Show remaining days in the premium block if available
    const premiumStatusHighlight = document.getElementById('premium-status-highlight');
    if (premiumStatusHighlight && state.premiumUntil) {
      // Check for lifetime (far future)
      const isLifetime = state.premiumUntil > 200000000000000;

      if (isLifetime) {
        premiumStatusHighlight.innerHTML = `
          <div class="premium-remaining-pill lifetime">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M12 2v20M2 12h20M7.5 7.5l9 9M7.5 16.5l9-9"></path></svg></span>
            <span style="font-size: 1.2rem; font-weight: bold;">∞</span>
            <span>WeMeal+ à vie</span>
          </div>
        `;
        premiumStatusHighlight.style.display = 'block';
      } else {
        const remaining = Math.ceil((state.premiumUntil - Date.now()) / (1000 * 60 * 60 * 24));
        if (remaining > 0) {
          premiumStatusHighlight.innerHTML = `
            <div class="premium-remaining-pill">
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M12 2v20M2 12h20M7.5 7.5l9 9M7.5 16.5l9-9"></path></svg></span>
              <span>Expire dans ${remaining} jours</span>
            </div>
          `;
          premiumStatusHighlight.style.display = 'block';
        } else {
          premiumStatusHighlight.style.display = 'none';
        }
      }
    }

    // Also update the modal countdown
    const modalCountdown = document.getElementById('premium-modal-countdown');
    if (modalCountdown && state.premiumUntil) {
      const isLifetime = state.premiumUntil > 200000000000000;

      if (isLifetime) {
        modalCountdown.innerHTML = `
          <div class="premium-countdown-badge lifetime" style="border-color: #f59e0b; background: rgba(245, 158, 11, 0.1);">
            <div class="premium-countdown-value" style="font-size: 4rem;">∞</div>
            <div class="premium-countdown-label">Accès à vie</div>
          </div>
          <p style="margin-top: var(--space-md); color: var(--text-secondary); font-size: 0.9rem;">
            Votre accès WeMeal+ est actif de manière <strong>illimitée</strong>. Merci de nous soutenir !
          </p>
        `;
      } else {
        const remaining = Math.ceil((state.premiumUntil - Date.now()) / (1000 * 60 * 60 * 24));
        if (remaining > 0) {
          modalCountdown.innerHTML = `
            <div class="premium-countdown-badge">
              <div class="premium-countdown-value">${remaining}</div>
              <div class="premium-countdown-label">Jours Restants</div>
            </div>
            <p style="margin-top: var(--space-md); color: var(--text-secondary); font-size: 0.9rem;">
              Votre accès à WeMeal+ est actif jusqu'au <strong>${new Date(state.premiumUntil).toLocaleDateString()}</strong>.
            </p>
          `;
        } else {
          modalCountdown.innerHTML = `
            <div class="premium-countdown-badge" style="border-color: var(--danger);">
              <div class="premium-countdown-value" style="color: var(--danger);">0</div>
              <div class="premium-countdown-label">Aujourd'hui</div>
            </div>
            <p style="margin-top: var(--space-md); color: var(--text-secondary); font-size: 0.9rem;">
              Votre abonnement expire aujourd'hui.
            </p>
          `;
        }
      }
    }
  } else {
    // Profile view UI
    if (freemiumBlock) freemiumBlock.classList.remove('hidden');
    if (premiumBlock) premiumBlock.classList.add('hidden');

    // Surprise
    const surpriseCount = Math.max(0, state.freeSurpriseRemaining);
    if (surpriseText) {
      surpriseText.style.display = 'block';
      surpriseText.innerHTML = `Il vous reste <strong>${surpriseCount}</strong> recherches gratuites.`;
    }

    // Favorites
    const favCount = (state.favorites || []).length;
    const maxFavs = 15;
    if (favText) {
      favText.style.display = 'block';
      favText.innerHTML = `${favCount} / ${maxFavs} favoris gratuits utilisés.`;
    }
  }
}

window.showPremiumStatusModal = function () {
  const modal = document.getElementById('premium-status-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
  }
};

// ============================================
// Surprise Me
// ============================================
function handleFindRecipe() {
  const glowContainer = document.querySelector('.surprise-search-container');
  const overlay = document.getElementById('ai-thinking-overlay');
  const thinkingEl = document.getElementById('ai-thinking');
  const surpriseView = document.getElementById('surprise-view');

  // Speed up the search bar glow
  if (glowContainer) {
    glowContainer.classList.remove('ai-slowing');
    glowContainer.classList.add('ai-loading');
  }

  const homeInput = document.getElementById('ingredients-input');
  const surpriseInput = document.getElementById('surprise-ingredients');

  // Use whichever input has a value
  let inputVal = '';
  if (surpriseInput && surpriseInput.value.trim()) {
    inputVal = surpriseInput.value;
  } else if (homeInput) {
    inputVal = homeInput.value;
  }

  // Parse ingredients
  const newIngredients = inputVal.split(',').map(i => i.trim()).filter(i => i);

  if (inputVal) {
    const lowerValue = inputVal.toLowerCase();
    if (lowerValue.includes('vegan')) {
      // toggleVeganMode(true); 
    } else if (lowerValue.includes('vegetarien') || lowerValue.includes('végétarien')) {
      toggleVegetarianMode(true);
      document.getElementById('vegetarian-toggle').checked = true;
    }

    state.ingredients = [...new Set([...state.ingredients, ...newIngredients])];
    if (homeInput) homeInput.value = '';
    if (surpriseInput) surpriseInput.value = '';
    renderIngredientTags();
  }

  if (state.ingredients.length === 0) {
    showToast("Veuillez ajouter au moins un ingrédient ! 🍅");
    const inputToFocus = surpriseInput || homeInput;
    if (inputToFocus) {
      inputToFocus.focus();
      inputToFocus.classList.add('shake');
      setTimeout(() => inputToFocus.classList.remove('shake'), 500);
    }
    if (glowContainer) glowContainer.classList.remove('ai-loading');
    return;
  }

  // Blur the page and show the centered thinking overlay
  if (surpriseView) surpriseView.classList.add('page-blur');
  if (overlay) overlay.classList.add('visible');
  if (thinkingEl) {
    thinkingEl.classList.remove('thinking-hide', 'ai-slowing');
  }

  // Trigger Logic
  processSurpriseSearch();
}

// ============================================
// Free Tier Limits & Premium Check
// ============================================
function checkSurpriseLimit() {
  if (state.isPremium) return true;
  if (state.freeSurpriseRemaining <= 0) {
    // Hide loading states if limit reached
    const overlay = document.getElementById('ai-thinking-overlay');
    const glowContainer = document.querySelector('.surprise-search-container');
    const surpriseView = document.getElementById('surprise-view');
    if (overlay) overlay.classList.remove('visible');
    if (glowContainer) glowContainer.classList.remove('ai-loading');
    if (surpriseView) surpriseView.classList.remove('page-blur');

    showPremiumPaywall('surprise');
    return false;
  }
  return true;
}

function processSurpriseSearch() {
  if (!checkSurpriseLimit()) return;

  // Check Diabetic Mode
  if (state.isDiabeticMode && !state.currentGlycemia && !state.glycemiaSkipped) {
    console.log("Diabetic mode intercept");
    // Hide thinking + blur for modal
    const overlay = document.getElementById('ai-thinking-overlay');
    const glowContainer = document.querySelector('.surprise-search-container');
    const surpriseView = document.getElementById('surprise-view');
    if (overlay) overlay.classList.remove('visible');
    if (glowContainer) glowContainer.classList.remove('ai-loading');
    if (surpriseView) surpriseView.classList.remove('page-blur');
    showGlycemiaModal();
    return;
  }

  // Deduct free attempt if not premium
  if (!state.isPremium) {
    state.freeSurpriseRemaining--;
    updateFreeLimitsUI(); // Sync the view right away
    // We will sync this decrease to DB when user profiles are synced
    window.dispatchEvent(new CustomEvent('profile-updated'));
  }

  executeSearch();
}

function executeSearch() {
  setTimeout(() => {
    // 1. Filter Recipes (compute but DON'T render yet)
    const allRecipes = window.recipesDatabase || window.recipes || [];
    let matched = allRecipes.filter(r => {
      const rIngs = r.ingredients ? r.ingredients.map(i => (i.name || i).toLowerCase()) : [];
      const userIngs = state.ingredients.map(i => i.toLowerCase());
      const rName = r.name ? r.name.toLowerCase() : '';
      const rKeywords = r.keywords ? r.keywords.map(k => k.toLowerCase()) : [];

      // Build comprehensive category terms for matching (handles both old French labels and new English codes)
      const catNamesFr = { breakfast: 'petit-déj', lunch: 'déjeuner', dinner: 'dîner', snack: 'snack', appetizer: 'apéritif', dessert: 'dessert', soup: 'soupe', salad: 'salade', pasta: 'pâtes', meat: 'viande', fish: 'poisson', veggie: 'végétarien', asian: 'asiatique', healthy: 'healthy', cheese: 'fromage', italian: 'italien', thai: 'thaï', mexican: 'mexicain', quick: 'rapide', comfort: 'comfort food' };
      const catNamesEn = Object.fromEntries(Object.entries(catNamesFr).map(([k, v]) => [v, k]));
      const rawCats = Array.isArray(r.category) ? r.category : (r.category ? [r.category] : []);
      // Build all possible search terms for this recipe's categories
      const allCatTerms = new Set();
      rawCats.forEach(c => {
        const cl = c.toLowerCase();
        allCatTerms.add(cl);                           // raw stored value (e.g. "lunch" or "Déjeuner")
        if (catNamesFr[cl]) allCatTerms.add(catNamesFr[cl]); // English→French (lunch→déjeuner)
        if (catNamesEn[cl]) allCatTerms.add(catNamesEn[cl]); // French→English (déjeuner→lunch)
      });

      return userIngs.some(ui =>
        rIngs.some(ri => ri.includes(ui) || ui.includes(ri)) ||
        rName.includes(ui) ||
        rKeywords.some(k => k.includes(ui)) ||
        [...allCatTerms].some(ct => ct.includes(ui) || ui.includes(ct))
      );
    });

    if (state.isVeganMode) matched = matched.filter(r => r.isVegan);
    if (state.isVegetarianMode) matched = matched.filter(r => r.isVegetarian || r.isVegan);

    // 2. Start the slow-down animation (results NOT visible yet)
    const glowContainer = document.querySelector('.surprise-search-container');
    const thinkingEl = document.getElementById('ai-thinking');
    const overlay = document.getElementById('ai-thinking-overlay');
    const surpriseView = document.getElementById('surprise-view');

    // Slow down the search bar glow
    if (glowContainer) {
      glowContainer.classList.remove('ai-loading');
      glowContainer.classList.add('ai-slowing');
    }

    // Slow down the thinking bubble glow
    if (thinkingEl) {
      thinkingEl.classList.add('ai-slowing');
    }

    // Phase 2: After slow-down, fade out thinking bubble
    setTimeout(() => {
      if (thinkingEl) {
        thinkingEl.classList.add('thinking-hide');
      }

      // Phase 3: After fade-out completes, remove overlay + blur
      setTimeout(() => {
        // Hide overlay
        if (overlay) overlay.classList.remove('visible');

        // Clean up thinking classes
        if (thinkingEl) {
          thinkingEl.classList.remove('ai-slowing', 'thinking-hide');
        }

        // Remove blur to reveal the page
        if (surpriseView) surpriseView.classList.remove('page-blur');

        // Clean up search bar glow
        if (glowContainer) {
          glowContainer.classList.remove('ai-slowing');
        }

        // Phase 4: NOW render and show results (after blur is gone)
        setTimeout(() => {
          const resultSection = document.getElementById('surprise-result');
          if (matched.length > 0) {
            resultSection.classList.remove('hidden');
            renderRecipesGrid(matched, 'surprise-recipes');
          } else {
            resultSection.classList.remove('hidden');
            document.getElementById('surprise-recipes').innerHTML = `
              <div class="glass no-recipes-card" style="grid-column: 1/-1; padding: var(--space-xl); text-align: center;">
                <div class="no-recipes-icon">${window.ICONS.ui.chefHat}</div>
                <h3 style="margin-bottom: var(--space-sm);">Pas de recette trouvée</h3>
                <p style="color: var(--text-muted); line-height: 1.6;">
                  Essayez avec d'autres ingrédients !
                </p>
                <button class="btn btn-secondary" style="margin-top: var(--space-lg);" onclick="state.ingredients=[]; renderIngredientTags(); document.getElementById('surprise-result').classList.add('hidden');">
                  Réessayer
                </button>
              </div>
            `;
          }

          // Scroll to results
          setTimeout(() => {
            resultSection.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }, 300); // Short delay for blur transition to complete
      }, 600); // Wait for fade-out animation (0.5s + buffer)
    }, 1800); // Duration of the slow-down phase
  }, 2000); // Initial "thinking" delay
}


// 2. Render Tags
function renderIngredientTags() {
  const container = document.getElementById('ingredient-tags');
  const surpriseContainer = document.getElementById('surprise-tags');

  const html = state.ingredients.map(ing => `
    <div class="ingredient-tag">
      ${ing}
      <span onclick="removeIngredient('${ing.replace(/'/g, "\\'")}')">×</span>
    </div>
  `).join('');

  if (container) container.innerHTML = html;
  if (surpriseContainer) surpriseContainer.innerHTML = html;
}

// Global scope for onclick
window.removeIngredient = function (ing) {
  state.ingredients = state.ingredients.filter(i => i !== ing);
  renderIngredientTags();
};

// ============================================
// Loading
// ============================================
function showLoading() {
  document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('active');
}

// Toast Notification
function showToast(message) {
  // Check if toast container exists, if not create it
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.innerHTML = message;
  toast.style.cssText = `
    background: rgba(15, 23, 42, 0.9);
    color: white;
    padding: 12px 24px;
    border-radius: 99px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Remove after 2s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ============================================
// Tutorial Logic
// ============================================
function initTutorial() {
  const seenHeader = localStorage.getItem('wemeal_tutorial_seen');
  if (!seenHeader) {
    const overlay = document.getElementById('tutorial-overlay');

    // Safety check if overlay exists (was added to HTML)
    if (!overlay) return;

    overlay.classList.remove('hidden');

    let currentSlide = 0;
    const slides = overlay.querySelectorAll('.tutorial-slide');
    const dots = overlay.querySelectorAll('.tutorial-dot');
    const nextBtn = document.getElementById('tutorial-next');
    const skipBtn = document.getElementById('tutorial-skip');

    function showSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));

      slides[index].classList.add('active');
      dots[index].classList.add('active');

      if (index === slides.length - 1) {
        nextBtn.textContent = "C'est parti !";
      } else {
        nextBtn.textContent = "Suivant";
      }
    }

    function closeTutorial() {
      overlay.classList.add('hidden');
      localStorage.setItem('wemeal_tutorial_seen', 'true');
    }

    nextBtn.onclick = () => {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
      } else {
        closeTutorial();
      }
    };

    skipBtn.onclick = closeTutorial;
  }
}

// ============================================
// Initialization
// ============================================

function setupRecipeDetailButtons() {
  console.log("Setting up recipe detail buttons via delegation...");
  // Logic moved to global listener

  const openFilterBtn = document.getElementById('btn-open-filters');
  if (openFilterBtn) {
    openFilterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openHomeFilters();
    });
  }
}

// Global Event Delegation for Dynamic Buttons
document.addEventListener('click', (e) => {
  // Filter button — handle before anything else
  const filterBtn = e.target.closest('#btn-open-filters');
  if (filterBtn) {
    e.preventDefault();
    e.stopPropagation();
    openHomeFilters();
    return;
  }


  // 1. Recipe Detail Back Button
  const backBtn = e.target.closest('#recipe-back');
  if (backBtn) {
    console.log("Back button clicked");
    closeRecipeDetail();
    return;
  }

  // ... (keeping other handlers)


  // 3. Add to Shopping List
  const shopBtn = e.target.closest('#add-to-shopping-list-btn');
  if (shopBtn) {
    console.log("Add to shopping list clicked");
    if (state.currentRecipe) {
      addToShoppingList(state.currentRecipe.ingredients);
    } else {
      console.error("No current recipe set");
    }
    return;
  }

  // 4. Start Cooking (Classic)
  const startBtn = e.target.closest('#start-cooking-btn');
  if (startBtn) {
    startCookingMode();
    return;
  }

  // 5. Start Cooking (Voice)
  const voiceBtn = e.target.closest('#start-cooking-voice-btn');
  if (voiceBtn) {
    window.autoStartVoice = true;
    startCookingMode();
    return;
  }

  // 6. Start Cooking Party
  const partyBtn = e.target.closest('#start-cooking-party-btn');
  if (partyBtn) {
    console.log("Start party click detected via delegation");

    // Check for overlap just in case
    const rect = partyBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const topElement = document.elementFromPoint(centerX, centerY);

    if (topElement && topElement !== partyBtn && !partyBtn.contains(topElement)) {
      console.warn("Party button is covered by:", topElement);
    }

    startCookingPartyConfig();
    return;
  }

  // 7. Favorite Button (Contextual)
  const favIcon = e.target.closest('#recipe-detail-favorite');
  if (favIcon) {
    if (state.currentRecipe) toggleFavorite(state.currentRecipe.id, favIcon);
    return;
  }
});

function setupFindRecipe() {
  const findBtn = document.getElementById('find-recipe-btn');
  const input = document.getElementById('ingredients-input');
  const glycemiaSkip = document.getElementById('glycemia-skip');
  const glycemiaConfirm = document.getElementById('glycemia-confirm');

  if (findBtn) {
    findBtn.onclick = handleFindRecipe; // Use onclick to replace existing
  }

  if (input) {
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const value = e.target.value.trim();
        if (value) {
          const newIngredients = value.split(/[,\n]+/).map(i => i.trim()).filter(i => i);
          state.ingredients = [...new Set([...state.ingredients, ...newIngredients])];
          e.target.value = '';
          renderIngredientTags();
        }
      }
    };
  }

  // Glycemia modal
  if (glycemiaSkip) {
    glycemiaSkip.onclick = () => {
      hideGlycemiaModal();
      state.currentGlycemia = null;
      state.glycemiaSkipped = true;
      handleFindRecipe();
    };
  }

  if (glycemiaConfirm) {
    glycemiaConfirm.onclick = () => {
      const value = document.getElementById('glycemia-input').value;
      if (!value || value.trim() === '') {
        document.getElementById('glycemia-error').style.display = 'block';
        return;
      }
      state.currentGlycemia = parseInt(value);
      state.glycemiaSkipped = false;
      document.getElementById('glycemia-error').style.display = 'none';
      hideGlycemiaModal();
      handleFindRecipe();
    };
  }
}

// ============================================
// WeMeal+ Premium Paywall Logic
// ============================================
let selectedPlan = 'yearly';
window.appliedPromoCode = null;
window.currentDiscountPercent = 0;

function showPremiumPaywall(triggerSource = 'profile') {
  const modal = document.getElementById('premium-paywall-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('active');

    // Reset Promo & Breakdown
    window.appliedPromoCode = null;
    window.currentDiscountPercent = 0;
    const msgEl = document.getElementById('promo-message');
    const inputEl = document.getElementById('promo-code-input');
    const breakdownEl = document.getElementById('price-breakdown');
    if (msgEl) msgEl.style.display = 'none';
    if (inputEl) inputEl.value = '';
    if (breakdownEl) breakdownEl.style.display = 'none';

    // Reset Gift Mode
    const giftToggle = document.getElementById('gift-mode-toggle');
    const giftExp = document.getElementById('gift-explanation');
    if (giftToggle) {
      // A premium user can ONLY buy gifts.
      // Additionally, if opened explicitly via the gift button, it must be gift mode.
      const forceGift = state.isPremium || triggerSource === 'profile_gift';
      giftToggle.checked = forceGift;
      giftToggle.disabled = forceGift;

      if (giftToggle.checked) {
        giftExp.style.display = 'block';
        document.getElementById('start-premium-btn').textContent = "Acheter la carte cadeau";
      } else {
        giftExp.style.display = 'none';
        document.getElementById('start-premium-btn').textContent = "S'abonner à WeMeal+";
      }
    }
  }

  // Optional: customize messaging based on trigger
  const title = modal.querySelector('.premium-title');
  if (triggerSource === 'surprise') {
    title.textContent = "Recherches Épuisées";
  } else if (triggerSource === 'favorites') {
    title.textContent = "Favoris Pleins";
  } else {
    title.textContent = "WeMeal+";
  }
}

window.updatePriceBreakdown = function (discountPercent = 0) {
  const breakdownEl = document.getElementById('price-breakdown');
  if (!breakdownEl) return;

  const originalPriceSpan = document.getElementById('original-price');
  const discountAmountSpan = document.getElementById('discount-amount');
  const finalPriceSpan = document.getElementById('final-price');

  const basePrice = (selectedPlan === 'yearly') ? 39.99 : 4.99;
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  window.currentDiscountPercent = discountPercent;

  originalPriceSpan.textContent = `${basePrice.toFixed(2)}€`;
  discountAmountSpan.textContent = `-${discountAmount.toFixed(2)}€`;
  finalPriceSpan.textContent = `${finalPrice.toFixed(2)}€`;

  breakdownEl.style.display = 'block';
};

window.addEventListener('promo-code-applied', (e) => {
  const { discount } = e.detail;
  window.updatePriceBreakdown(discount);
});

function hidePremiumPaywall() {
  const modal = document.getElementById('premium-paywall-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
    document.getElementById('paywall-success-animation')?.classList.add('hidden');
    document.getElementById('paywall-gift-success')?.classList.add('hidden');
    document.getElementById('paywall-gift-card')?.classList.add('hidden');
    if (document.getElementById('paywall-content')) {
      document.getElementById('paywall-content').style.display = 'block';
    }
  }
}
window.hidePremiumPaywall = hidePremiumPaywall;

function setupPaywall() {
  const closeBtn = document.getElementById('close-paywall-btn');
  if (closeBtn) closeBtn.addEventListener('click', hidePremiumPaywall);

  // Plan Selection
  const planCards = document.querySelectorAll('.pricing-card');
  planCards.forEach(card => {
    card.addEventListener('click', () => {
      planCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedPlan = card.dataset.plan;

      // Refresh breakdown if a promo is active
      if (window.currentDiscountPercent > 0) {
        window.updatePriceBreakdown(window.currentDiscountPercent);
      }
    });
  });

  // Promo Code
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', async () => {
      const code = document.getElementById('promo-code-input').value.trim().toUpperCase();
      const msgEl = document.getElementById('promo-message');

      if (!code) {
        msgEl.textContent = "Veuillez entrer un code.";
        msgEl.style.color = "var(--danger)";
        msgEl.style.display = "block";
        return;
      }

      msgEl.style.display = "block";
      msgEl.style.color = "white";
      msgEl.textContent = "Vérification...";

      // Validation via CustomEvent to firebase-loader.js
      const validationEvent = new CustomEvent('validate-promo-code', {
        detail: { code: code, responseElement: msgEl }
      });
      window.dispatchEvent(validationEvent);
    });
  }

  // Checkout Button (Stripe Redirect)
  const startBtn = document.getElementById('start-premium-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (!state.userProfile) {
        hidePremiumPaywall();
        if (typeof window.openAuthModal === 'function') {
          window.openAuthModal();
        } else {
          const authModal = document.getElementById('auth-modal');
          if (authModal) {
            authModal.classList.remove('hidden');
            authModal.classList.add('active');
          }
        }
        return;
      }

      // Gift Mode Check
      const isGift = document.getElementById('gift-mode-toggle') && document.getElementById('gift-mode-toggle').checked;
      const uid = window.firebaseUser?.uid || state.userProfile?.uid || null;

      if (!uid) {
        console.error('No authenticated user UID found for Stripe checkout.');
        if (typeof showToast === 'function') showToast('Erreur : impossible de trouver votre compte.');
        return;
      }

      const btn = document.getElementById('start-premium-btn');
      const originalText = btn.textContent;
      btn.textContent = "Redirection...";
      btn.disabled = true;

      if (isGift) {
        // Dispatch event so firebase-loader can call createGiftCheckoutSession
        window.dispatchEvent(new CustomEvent('init-gift-checkout', {
          detail: {
            plan: selectedPlan,
            promo: window.appliedPromoCode
          }
        }));

        // Timeout to reset button if function fails
        setTimeout(() => {
          if (btn) { btn.textContent = originalText; btn.disabled = false; }
        }, 5000);
        return;
      }

      // Regular Subscription Check
      if (state.isPremium && !isGift) {
        showToast("Vous êtes déjà premium !");
        btn.textContent = originalText;
        btn.disabled = false;
        return;
      }

      // Dispatch event to firebase-loader.js to get dynamic session URL
      window.dispatchEvent(new CustomEvent('init-stripe-checkout', {
        detail: {
          plan: selectedPlan,
          promo: window.appliedPromoCode
        }
      }));

      // Fallback reset
      setTimeout(() => {
        if (btn) { btn.textContent = originalText; btn.disabled = false; }
      }, 5000);

    });
  }

  // Gift toggle listener
  const giftToggle = document.getElementById('gift-mode-toggle');
  if (giftToggle) {
    giftToggle.addEventListener('change', (e) => {
      const isGift = e.target.checked;
      document.getElementById('gift-explanation').style.display = isGift ? 'block' : 'none';
      document.getElementById('start-premium-btn').textContent = isGift ? "Acheter la carte cadeau" : "S'abonner à WeMeal+";
    });
  }
}

function simulatePurchaseSuccess() {
  document.getElementById('paywall-content').style.display = 'none';
  const successAnim = document.getElementById('paywall-success-animation');
  successAnim.classList.remove('hidden');

  // Enable premium locally for immediate feedback
  state.isPremium = true;
  window.dispatchEvent(new CustomEvent('profile-updated'));

  // Close button
  document.getElementById('close-success-btn').onclick = hidePremiumPaywall;
}

window.showGiftSuccessAnimation = function (preloadedCode = null) {
  document.getElementById('paywall-content').style.display = 'none';
  const successAnim = document.getElementById('paywall-gift-success');
  successAnim.classList.remove('hidden');

  // Trigger re-flow for animation
  const scene = successAnim.querySelector('.gift-animation-scene');
  if (scene) {
    scene.style.animation = 'none';
    scene.offsetHeight; // trigger reflow
    scene.style.animation = null;
  }

  // After 6.5s (duration of animation), fetch code and show the card
  setTimeout(() => {
    successAnim.classList.add('hidden');
    document.getElementById('paywall-gift-card').classList.remove('hidden');

    if (preloadedCode) {
      document.getElementById('gift-card-code').textContent = preloadedCode;
    } else {
      document.getElementById('gift-card-code').textContent = "Chargement...";
      window.dispatchEvent(new CustomEvent('fetch-latest-gift-code'));
    }
  }, 6500);

  // Setup download button
  const downloadBtn = document.getElementById('download-gift-card-btn');
  if (downloadBtn) {
    downloadBtn.onclick = () => window.generateGiftCardImage();
  }
};

window.generateGiftCardImage = async function () {
  const cardElement = document.getElementById('downloadable-gift-card');
  if (!cardElement) return;

  const btn = document.getElementById('download-gift-card-btn');
  const ogText = btn.innerHTML;
  btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Génération...`;
  btn.disabled = true;

  try {
    const canvas = await html2canvas(cardElement, {
      scale: 3, // High quality
      backgroundColor: null,
      logging: false
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `Carte-Cadeau-WeMeal-${document.getElementById('gift-card-code').textContent}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("Carte cadeau téléchargée !");
  } catch (err) {
    console.error("Error generating image:", err);
    showToast("Erreur lors de la génération de l'image.");
  } finally {
    btn.innerHTML = ogText;
    btn.disabled = false;
  }
};

window.renderGiftHistory = function (gifts) {
  const container = document.getElementById('gift-history-list');
  if (!container) return;

  if (!gifts || gifts.length === 0) {
    container.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)" style="margin-bottom: 10px;">
        <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2v2c0 1.11.89 2 2 2h2v9c0 1.11.89 2 2 2h8c1.11 0 2-.89 2-2v-9h2c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
      </svg>
      <p style="color: var(--text-secondary); font-size: 0.9rem;">Aucun cadeau acheté</p>
    `;
    return;
  }

  container.innerHTML = gifts.map(g => {
    let d = "Inconnue";
    if (g.createdAt) {
      if (g.createdAt.toDate) d = g.createdAt.toDate().toLocaleDateString('fr-FR');
      else d = new Date(g.createdAt).toLocaleDateString('fr-FR');
    }

    const isUsed = g.status === 'used';
    const uiStatus = isUsed ? "Utilisé" : "Non utilisé";
    const statusClass = isUsed ? "used" : "unused";
    const planName = g.plan === 'monthly' ? "1 Mois" : "1 An";

    return `
      <div class="gift-history-item">
        <div class="gift-history-details">
          <div class="gift-history-code">${g.code || 'MEALXXXXX'}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Acheté le ${d} • Pass ${planName}</div>
          <div class="gift-history-status ${statusClass}" style="font-size: 0.8rem; margin-top: 4px; font-weight: 500;">
            ${uiStatus}
          </div>
        </div>
        <button class="btn btn-glass btn-small" onclick="reprintGiftCard('${g.code}', '${planName}')" style="padding: 6px 10px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        </button>
      </div>
    `;
  }).join('');
};

window.reprintGiftCard = function (code, durationLabel) {
  if (typeof showPremiumPaywall === 'function') {
    showPremiumPaywall('history_reprint');
    document.getElementById('paywall-content').style.display = 'none';
    document.getElementById('paywall-gift-success').classList.add('hidden');

    document.getElementById('gift-card-code').textContent = code;
    document.getElementById('gift-card-duration').textContent = durationLabel.toUpperCase();

    document.getElementById('paywall-gift-card').classList.remove('hidden');

    const downloadBtn = document.getElementById('download-gift-card-btn');
    if (downloadBtn) downloadBtn.onclick = () => window.generateGiftCardImage();
  }
};
let _initHomeTimeout = null;

function initializeHome() {
  if (_initHomeTimeout) clearTimeout(_initHomeTimeout);
  _initHomeTimeout = setTimeout(() => {
    _initializeHomeActual();
  }, 50);
}

function _initializeHomeActual() {
  // Only fetch weather if we don't have it yet
  if (!state.currentWeather) {
    if (state.userLocation) {
      fetchWeatherByLocation(state.userLocation);
    } else {
      updateWeatherDisplay({ temp: '--', desc: 'Chargement...', type: 'sunny', tempType: 'mild' }, 'Localisation...');
    }
  } else {
    updateWeatherDisplay(state.currentWeather, state.currentWeatherCity || 'Votre position');
  }

  // Rebuild recipes if DB changed or first init (prevent flicker from redundant calls)
  const dbSize = (window.recipesDatabase || []).length;
  if (!state._homeInitialized || state._homeDbSize !== dbSize) {
    state.homeCurrentRecipes = getRecommendedRecipes(state.currentWeather, 10000);

    // Only reset display count to 9 if we just initialized or it's missing
    if (!state.homeDisplayCount || state.homeDisplayCount < 9) {
      state.homeDisplayCount = 9;
    }

    state._homeInitialized = true;
    state._homeDbSize = dbSize;

    // Only render if we actually rebuilt the state!
    renderRecipesGrid(state.homeCurrentRecipes.slice(0, state.homeDisplayCount), 'home-recipes');
  }

  updateLoadMoreButtonVisibility();
}

window.loadMoreHomeRecipes = function () {
  if (state.homeDisplayCount < state.homeCurrentRecipes.length) {
    state.homeDisplayCount += 9;
    renderRecipesGrid(state.homeCurrentRecipes.slice(0, state.homeDisplayCount), 'home-recipes');
  }
  updateLoadMoreButtonVisibility();
};

function updateLoadMoreButtonVisibility() {
  const loadMoreBtn = document.getElementById('home-load-more');
  if (loadMoreBtn) {
    if (state.homeDisplayCount >= state.homeCurrentRecipes.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  }
}

function initializeApp() {
  console.log("Initializing App...");

  // Check if returning from a successful Stripe Checkout
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutStatus = urlParams.get('checkout');

  if (checkoutStatus === 'success') {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (typeof showPremiumPaywall === 'function') {
      showPremiumPaywall('stripe_return');
      setTimeout(() => {
        if (typeof simulatePurchaseSuccess === 'function') {
          simulatePurchaseSuccess();
        }
      }, 500);
    }
  } else if (checkoutStatus === 'gift_success') {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (typeof showPremiumPaywall === 'function') {
      showPremiumPaywall('stripe_return');
      setTimeout(() => {
        if (typeof showGiftSuccessAnimation === 'function') {
          showGiftSuccessAnimation();
        }
      }, 500);
    }
  }

  // Check onboarding (Profile)
  // checkOnboarding(); // Now handled by firebase-loader.js after auth resolves
  setupOnboarding();

  // Check Tutorial
  initTutorial();

  // Setup Paywall
  setupPaywall();

  // Request location if returning user
  if (state.userProfile) {
    requestLocation();
  }

  // Setup DOM Listeners
  setupRecipeDetailButtons();

  // Settings Toggles
  const diabeticToggle = document.getElementById('diabetic-toggle');
  const endoToggle = document.getElementById('endo-toggle'); // NEW ENDO TOGGLE

  if (diabeticToggle) {
    diabeticToggle.checked = state.isDiabeticMode;
    toggleDiabeticInfo(state.isDiabeticMode);
    diabeticToggle.addEventListener('change', (e) => toggleDiabeticMode(e.target.checked));
  }

  if (endoToggle) {
    endoToggle.checked = state.isEndoMode;

    // Initial visibility check
    const infoCard = document.getElementById('endo-info');
    if (infoCard) {
      if (state.isEndoMode) infoCard.classList.remove('hidden');
      else infoCard.classList.add('hidden');
    }

    endoToggle.addEventListener('change', (e) => {
      state.isEndoMode = e.target.checked;
      localStorage.setItem('wemeal_endo', JSON.stringify(state.isEndoMode));
      updateProfileModeBadges();
      updateProfileDisplay();

      // Toggle Info Card
      const infoCard = document.getElementById('endo-info');
      if (infoCard) {
        if (state.isEndoMode) infoCard.classList.remove('hidden');
        else infoCard.classList.add('hidden');
      }

      window.dispatchEvent(new CustomEvent('profile-updated'));
    });
  }

  const vegetarianToggle = document.getElementById('vegetarian-toggle');
  if (vegetarianToggle) {
    vegetarianToggle.checked = state.isVegetarianMode;
    vegetarianToggle.addEventListener('change', (e) => toggleVegetarianMode(e.target.checked));
  }

  const veganToggle = document.getElementById('vegan-toggle');
  if (veganToggle) {
    veganToggle.checked = state.isVeganMode;
    veganToggle.addEventListener('change', (e) => toggleVeganMode(e.target.checked));
  }

  const glutenFreeToggle = document.getElementById('gluten-free-toggle');
  if (glutenFreeToggle) {
    glutenFreeToggle.checked = state.isGlutenFreeMode;
    // Init status text
    const text = document.getElementById('gluten-free-active-text');
    if (state.isGlutenFreeMode && text) text.classList.remove('hidden');

    glutenFreeToggle.addEventListener('change', (e) => toggleGlutenFreeMode(e.target.checked));
  }

  // Authentication UI Logic moved to global scope
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => switchPage(item.dataset.page));
  });

  // Setup Feature Buttons (Modularized)
  setupRecipeDetailButtons();
  setupFindRecipe();

  // Shopping List specific events
  const clearListBtn = document.getElementById('clear-shopping-list');
  if (clearListBtn) clearListBtn.addEventListener('click', clearShoppingList);

  // Filter Chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => setActiveFilter(chip.dataset.filter));
  });

  updateStats();
  addRippleEffects();

  // Trigger Router
  setTimeout(handleDeepLink, 100); // Small delay to ensure DOM is ready
  console.log("App initialization complete. Event listeners attached.");
}

function toggleDiabeticInfo(show) {
  const el = document.getElementById('diabetic-info');
  if (el) {
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
  }
}



// ============================================
// Ripple Effects
// ============================================
function addRippleEffects() {
  document.querySelectorAll('.btn, .nav-item, .recipe-card').forEach(element => {
    element.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      ripple.style.cssText = `
        position: absolute;
        background: rgba(255,255,255,0.4);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        width: 0; height: 0;
        left: ${e.clientX - rect.left}px;
        top: ${e.clientY - rect.top}px;
        animation: ripple-animation 0.6s ease-out forwards;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  if (!document.getElementById('ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `@keyframes ripple-animation { to { width: 300px; height: 300px; opacity: 0; } }`;
    document.head.appendChild(style);
  }

  // Surprise Search Animation Listener
  const surpriseBtn = document.getElementById('surprise-btn');
  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', (e) => {
      e.preventDefault(); // crucial for form buttons
      const input = document.getElementById('surprise-search');
      if (input && input.value.trim() !== "") {
        triggerSurpriseAnimation();
      } else {
        // Shake if empty
        input.focus();
        input.parentElement.classList.add('shake');
        setTimeout(() => input.parentElement.classList.remove('shake'), 500);
      }
    });
  }
}


// ============================================
// Surprise Cloud Animation
// ============================================
function triggerSurpriseAnimation() {
  const container = document.querySelector('.surprise-hero');
  if (!container) return;

  // Clear previous cloud if any
  const existingCloud = document.getElementById('surprise-cloud');
  if (existingCloud) existingCloud.remove();

  // Create Cloud Container
  const cloud = document.createElement('div');
  cloud.id = 'surprise-cloud';
  cloud.className = 'surprise-cloud';
  container.appendChild(cloud);

  // Add Glow Effect Background
  const glow = document.createElement('div');
  glow.className = 'surprise-cloud-glow';
  cloud.appendChild(glow);

  // Generate 25 thumbnails
  const recipeEmojis = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  const count = 25;

  for (let i = 0; i < count; i++) {
    const thumb = document.createElement('div');
    thumb.className = 'cloud-thumbnail';

    // Content (Emoji or Image placeholder)
    thumb.innerHTML = recipeEmojis[Math.floor(Math.random() * recipeEmojis.length)];

    // Random Positioning in a "Cloud" (Gaussian-ish distribution)
    // Cluster them around center but with some spread
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 120; // 120px scatter radius
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius - 50; // Shift slightly up

    thumb.style.setProperty('--tx', `${x}px`);
    thumb.style.setProperty('--ty', `${y}px`);

    // Staggered Delay for pop-up effect
    const delay = Math.random() * 0.5; // 0 to 0.5s delay
    thumb.style.animationDelay = `${delay}s`;

    cloud.appendChild(thumb);
  }

  // After animation, simulate "Search Completed" (e.g., scroll down or show results)
  setTimeout(() => {
    // Reveal results section or scroll
    const resultsSection = document.getElementById('surprise-results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
      // Populate results if needed (mock)
      document.getElementById('surprise-query-display').textContent = document.getElementById('surprise-search').value;
    }
  }, 2500);
}


// ============================================
// Global Authentication UI Logic
// ============================================
const authModal = document.getElementById('auth-modal');
const authClose = document.getElementById('auth-close-btn');
const authToggleModeBtn = document.getElementById('auth-toggle-mode-btn');
const authActionBtn = document.getElementById('auth-action-btn');
const authTitle = document.getElementById('auth-title');

window.authIsLoginMode = true;

window.openAuthModal = function () {
  if (authModal) {
    authModal.classList.add('active');
    authModal.classList.remove('hidden'); // Just in case
    if (!window.firebaseUser && document.getElementById('auth-close-btn')) {
      document.getElementById('auth-close-btn').style.display = 'none'; // Lock
    }
  }
};

window.closeAuthModal = function () {
  if (!window.firebaseUser) {
    // Bounce animation to show it's locked
    const modalGlass = authModal.querySelector('.modal');
    if (modalGlass) {
      modalGlass.classList.add('shake');
      setTimeout(() => modalGlass.classList.remove('shake'), 400);
    }
    return;
  }
  if (authModal) {
    authModal.classList.remove('active');
    authModal.classList.add('hidden'); // Just in case
    document.getElementById('auth-error-msg').style.display = 'none';
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
  }
};

if (authClose) authClose.addEventListener('click', closeAuthModal);

if (authToggleModeBtn) {
  authToggleModeBtn.addEventListener('click', () => {
    window.authIsLoginMode = !window.authIsLoginMode;
    if (window.authIsLoginMode) {
      authTitle.textContent = "Connexion";
      authActionBtn.textContent = "Se connecter";
      authToggleModeBtn.textContent = "Pas de compte ? S'inscrire";
    } else {
      authTitle.textContent = "Inscription";
      authActionBtn.textContent = "Créer mon compte";
      authToggleModeBtn.textContent = "Déjà un compte ? Se connecter";
    }
    const errorMsg = document.getElementById('auth-error-msg');
    if (errorMsg) errorMsg.style.display = 'none';
  });
}

if (authActionBtn) {
  authActionBtn.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
      const errorMsg = document.getElementById('auth-error-msg');
      if (errorMsg) {
        errorMsg.textContent = "Veuillez remplir tous les champs.";
        errorMsg.style.display = 'block';
      }
      return;
    }

    window.dispatchEvent(new CustomEvent('auth-submit-request', {
      detail: { isLogin: window.authIsLoginMode, email, password }
    }));
  });
}

// Attach the Profile Login/Logout Button specifically when DOM is ready or just attach it here:
const delBtn = document.getElementById('delete-account-btn');
if (delBtn) {
  delBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
    </svg>
    Se Connecter / Créer un compte
  `;
  delBtn.classList.remove('delete-account-btn');
  delBtn.style.backgroundColor = 'var(--primary)';
  delBtn.style.color = 'white';
  delBtn.style.border = 'none';

  delBtn.addEventListener('click', () => {
    if (window.firebaseUser) {
      if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        window.dispatchEvent(new CustomEvent('auth-logout-request'));
      }
    } else {
      openAuthModal();
    }
  });

  window.authProfileButton = delBtn;
}


document.addEventListener('DOMContentLoaded', initializeApp);

// Expose for Firebase refresh
window.initializeHome = initializeHome;

// ============================================
// Theme Toggle
// ============================================
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  if (!themeToggle) return;

  // Load saved theme preference
  const savedTheme = localStorage.getItem('wemeal_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.body.dataset.theme = savedTheme;
  if (themeToggle) themeToggle.checked = savedTheme === 'dark';
  if (themeIcon) themeIcon.innerHTML = savedTheme === 'dark' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

  themeToggle.addEventListener('change', (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    document.body.dataset.theme = newTheme;
    localStorage.setItem('wemeal_theme', newTheme);
    if (themeIcon) themeIcon.innerHTML = newTheme === 'dark' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  });
}

// Initialize theme toggle on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initThemeToggle);

// ============================================
// UI Click Sound
// ============================================
let clickAudioCtx;

function playClickSound() {
  try {
    if (!clickAudioCtx) {
      clickAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (clickAudioCtx.state === 'suspended') {
      clickAudioCtx.resume();
    }

    const oscillator = clickAudioCtx.createOscillator();
    const gainNode = clickAudioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(clickAudioCtx.destination);

    // Soft, satisfying pop sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, clickAudioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, clickAudioCtx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.08, clickAudioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, clickAudioCtx.currentTime + 0.08);

    oscillator.start(clickAudioCtx.currentTime);
    oscillator.stop(clickAudioCtx.currentTime + 0.08);
  } catch (e) {
    // Silently fail — sound is non-critical
  }
}

// Global click listener for UI sounds
document.addEventListener('click', (e) => {
  const target = e.target.closest(
    '.btn, .btn-primary, .btn-glass, .nav-item, .filter-chip, .suggestion-chip, ' +
    '.recipe-card, .recipe-favorite, .toggle, .settings-row, .cooking-done-btn, ' +
    '.btn-search-action, .wizard-step, .tutorial-dot, .shopping-item, ' +
    '.btn-icon-small, .cooking-close, .recipe-detail-back, .btn-danger, .party-size-btn, .party-config-start, .member-done-btn'
  );
  if (target) {
    playClickSound();
  }
});

// ============================================
// Cooking Party Logic
// ============================================

class CookingPartyManager {
  constructor(recipe, members) {
    this.recipe = recipe;
    this.members = members;
    this.assignments = [];
    this.completedSteps = new Set();
    this.parallelKeywords = [
      "pendant ce temps", "alors que", "d'un autre côté",
      "simultanément", "en même temps", "pendant que", "dans un autre"
    ];
    this.independentVerbs = [
      "couper", "éplucher", "laver", "ciseler", "hacher", "émincer", "râper",
      "presser", "tailler", "zester", "concasser", "détailler", "préparer",
      "peser", "sortir", "préchauffer", "beurrer", "chemiser", "battre", "fouetter",
      "dans un bol", "dans un saladier", "faire", "cuire",
      "ajouter", "saisir", "chauffer", "verser", "mélanger", "remuer",
      "laisser", "réserver", "assaisonner", "servir", "disposer", "garnir",
      "saupoudrer", "badigeonner", "enfourner", "mijoter"
    ];
    this.dependencyMarkers = [
      "ajouter le", "ajouter la", "ajouter les", "incorporer", "verser",
      "mélanger le tout", "cette préparation", "le mélange", "la préparation"
    ];
    this.initialAssign();
  }

  initialAssign() {
    this.assignTasksToIdleMembers();
  }

  assignStep(memberIndex, stepIndex) {
    this.assignments.push({
      memberId: this.members[memberIndex].id,
      stepIndex: stepIndex,
      isCompleted: false
    });
  }

  findNextAvailableStep() {
    for (let i = 0; i < this.recipe.steps.length; i++) {
      if (this.completedSteps.has(i)) continue;
      if (this.assignments.some(a => a.stepIndex === i && !a.isCompleted)) continue;
      if (this.isStepDispatchable(i)) return i;
    }
    return null;
  }

  isStepDispatchable(index) {
    if (index === 0) return true;

    // Helper to check parallel status
    const isParallelStep = (idx) => {
      if (idx < 0 || idx >= this.recipe.steps.length) return false;
      const step = this.recipe.steps[idx];
      const text = ((typeof step === 'object') ? step.text : step).toLowerCase().trim();

      // 1. Explicit Parallel Keywords
      if (this.parallelKeywords.some(kw => text.includes(kw))) return true;

      // 2. Independent Verbs
      const startsWithIndependent = this.independentVerbs.some(v => text.startsWith(v));
      if (startsWithIndependent) {
        const hasDependency = this.dependencyMarkers.some(m => text.includes(m));
        return !hasDependency;
      }
      return false;
    };

    let hardDeps = [];

    if (isParallelStep(index)) {
      // CASE A: Current step is PARALLEL
      // It should only depend on the last SEQUENTIAL step (the anchor).
      // It should NOT depend on other parallel steps in the same block.
      let ptr = index - 1;
      while (ptr >= 0) {
        if (!isParallelStep(ptr)) {
          hardDeps.push(ptr); // Found the anchor
          break;
        }
        ptr--;
      }
    } else {
      // CASE B: Current step is SEQUENTIAL (The Barrier)
      // It must wait for ALL immediate preceding parallel steps
      // PLUS the immediate sequential step before them.
      let ptr = index - 1;
      while (ptr >= 0) {
        hardDeps.push(ptr); // Add dependency
        if (!isParallelStep(ptr)) {
          break; // Found the sequential anchor, stop collecting
        }
        ptr--;
      }
    }

    return hardDeps.every(d => this.completedSteps.has(d));
  }

  completeStep(memberId) {
    const assignmentIndex = this.assignments.findIndex(a => a.memberId === memberId && !a.isCompleted);
    if (assignmentIndex === -1) return;

    const assignment = this.assignments[assignmentIndex];
    assignment.isCompleted = true;
    this.completedSteps.add(assignment.stepIndex);

    // Try to assign a new task to this member
    const nextStep = this.findNextAvailableStep();
    if (nextStep !== null) {
      this.assignStep(this.members.findIndex(m => m.id === memberId), nextStep);
    }

    this.assignTasksToIdleMembers();
  }

  assignTasksToIdleMembers() {
    this.members.forEach((member, index) => {
      const isBusy = this.assignments.some(a => a.memberId === member.id && !a.isCompleted);
      if (!isBusy) {
        const nextStep = this.findNextAvailableStep();
        if (nextStep !== null) {
          this.assignStep(index, nextStep);
        }
      }
    });
  }

  isSessionComplete() {
    return this.completedSteps.size === this.recipe.steps.length;
  }
}

let partyManager = null;
const partyColors = [
  "#0891b2", // Cyan
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#22c55e", // Green
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#3b82f6", // Blue
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#84cc16"  // Lime
];

function startCookingPartyConfig() {
  const modal = document.getElementById('cooking-party-config-modal');
  modal.classList.add('active');

  const sizeBtns = document.querySelectorAll('.party-size-btn');
  const membersConfig = document.getElementById('party-members-config');
  let currentSize = 2;
  // Store current color indices for each member
  const memberColorIndices = new Array(4).fill(0).map((_, i) => i % partyColors.length);

  function renderMembers(size) {
    membersConfig.innerHTML = "";
    for (let i = 0; i < size; i++) {
      const row = document.createElement('div');
      row.className = "member-config-row";

      // Ensure index is within bounds
      const colorIndex = memberColorIndices[i] % partyColors.length;
      const currentColor = partyColors[colorIndex];

      row.innerHTML = `
          <div class="member-color-indicator" 
               style="background: ${currentColor}; cursor: pointer;" 
               title="Changer la couleur"
               onclick="cycleMemberColor(${i})">
          </div>
          <input type="text" class="member-name-input" 
                 placeholder="Cuisinier ${i + 1}" 
                 value="Cuisinier ${i + 1}" 
                 id="member-name-${i}">
        `;
      membersConfig.appendChild(row);
    }
  }

  // Global function to handle color cycling
  window.cycleMemberColor = (index) => {
    memberColorIndices[index] = (memberColorIndices[index] + 1) % partyColors.length;
    // Re-render only the specific color indicator to avoid losing focus if typing
    // But for simplicity/robustness, we can re-render the row color or just update the style
    // Let's update the style directly for better UX (no input loss)
    const colorBox = document.querySelector(`#member-name-${index}`).previousElementSibling;
    if (colorBox) {
      colorBox.style.background = partyColors[memberColorIndices[index]];
    }
  };

  sizeBtns.forEach(btn => {
    btn.onclick = () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = parseInt(btn.dataset.size);
      renderMembers(currentSize);
    };
  });

  document.getElementById('party-config-cancel').onclick = () => modal.classList.remove('active');

  document.getElementById('party-config-start').onclick = () => {
    const members = [];
    for (let i = 0; i < currentSize; i++) {
      members.push({
        id: "member-" + Date.now() + "-" + i,
        name: document.getElementById(`member-name-${i}`).value || `Cuisinier ${i + 1}`,
        color: partyColors[memberColorIndices[i]]
      });
    }
    modal.classList.remove('active');
    startCookingParty(members);
  };

  renderMembers(currentSize); // Initial
}

// ... existing code ...

function startCookingParty(members) {
  if (!state.currentRecipe) return;

  partyManager = new CookingPartyManager(state.currentRecipe, members);

  const mode = document.getElementById('cooking-party-mode');
  mode.classList.add('active');

  document.getElementById('party-close').onclick = () => mode.classList.remove('active');

  updateCookingPartyDashboard();
}

function updateCookingPartyDashboard() {
  const dashboard = document.getElementById('party-dashboard');
  if (!dashboard || !partyManager) return;

  const size = partyManager.members.length;
  dashboard.setAttribute('data-size', size);
  dashboard.innerHTML = "";

  const activeAssignments = partyManager.assignments.filter(a => !a.isCompleted);
  const isMerged = activeAssignments.length === 1 && !partyManager.isSessionComplete();
  dashboard.setAttribute('data-merged', isMerged);

  partyManager.members.forEach((member, index) => {
    const assignment = partyManager.assignments.find(a => a.memberId === member.id && !a.isCompleted);
    const tile = document.createElement('div');
    tile.className = "party-tile";
    tile.style.setProperty('--member-color', member.color);

    if (isMerged && assignment) {
      tile.classList.add('active-merged');
    }

    let content = "";
    if (assignment) {
      const step = state.currentRecipe.steps[assignment.stepIndex];
      const text = (typeof step === 'object') ? step.text : step;

      let avatarsHtml = "";
      if (isMerged) {
        // Show all members' avatars in merged mode
        avatarsHtml = `
          <div class="merged-avatars" style="display: flex; gap: 8px; margin-bottom: 24px;">
            ${partyManager.members.map(m => `
              <div class="member-avatar small" title="${m.name}">
                <span style="background: ${m.color}; width: 12px; height: 12px; border-radius: 4px;"></span>
              </div>
            `).join('')}
          </div>
        `;
      }

      content = `
        <div class="party-tile-content">
          ${isMerged ? avatarsHtml : ''}
          <div class="step-number">${isMerged ? 'Tâche Collective' : `Étape ${assignment.stepIndex + 1}`}</div>
          <div class="party-step-text" style="${isMerged ? 'font-size: 2.5rem; text-align: center;' : ''}">${text}</div>
          <button class="btn btn-primary member-done-btn" 
                  style="${isMerged ? 'align-self: center; transform: scale(1.2);' : ''}"
                  onclick="partyHandleMemberDone('${member.id}')">
            <span class="btn-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg></span> ${isMerged ? "On a fini !" : "J'ai fini !"}
          </button>
        </div>
      `;
    } else {
      const allDone = partyManager.isSessionComplete();

      if (allDone) {
        tile.classList.add('finished');
        content = `
          <div class="state-overlay finished">
            <div class="state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg></div>
            <div class="state-title">Bravo Chef !</div>
            <div class="state-text">Session terminée !</div>
          </div>
        `;
      } else {
        // User is idle but recipe is not done -> Waiting for dependencies
        tile.classList.add('waiting');
        content = `
          <div class="state-overlay waiting">
            <div class="state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
            <div class="state-title">En attente...</div>
            <div class="state-text">Les autres chefs préparent la suite. <br>Gardez le rythme !</div>
            <div class="loading-dots-mini">
              <span></span><span></span><span></span>
            </div>
          </div>
        `;
      }
    }

    // Wrap header in a condition: only show if NOT merged, or show differently
    const headerHtml = isMerged ? '' : `
      <div class="party-member-header">
        <div class="member-avatar">
          <span style="background: ${member.color}"></span>
        </div>
        <div class="member-name-label">${member.name}</div>
      </div>
    `;

    tile.innerHTML = `
      ${headerHtml}
      ${content}
    `;
    dashboard.appendChild(tile);
  });

  const finishBtn = document.getElementById('party-finish-session-btn');
  if (partyManager.isSessionComplete()) {
    finishBtn.classList.remove('hidden');
    finishBtn.onclick = partyCompleteSession;
  } else {
    finishBtn.classList.add('hidden');
  }
}

window.partyHandleMemberDone = function (memberId) {
  partyManager.completeStep(memberId);
  updateCookingPartyDashboard();
};

function partyCompleteSession() {
  document.getElementById('cooking-party-mode').classList.remove('active');
  partyManager = null;
  // Track cooked recipe for sugar tracker as well (approximate)
  state.cookedToday.push({
    recipeId: state.currentRecipe.id,
    sugar: state.currentRecipe.sugar,
    date: new Date().toISOString()
  });
  localStorage.setItem('wemeal_cooked_today', JSON.stringify(state.cookedToday));
  updateStats();
  showToast(`Session terminée ! Bon appétit ! <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2 - 2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0 - 5 5v6c0 1.1.9 2 2 2h3zm0 0v7"></path></svg>`);
}

// ============================================
// Auto Meal Planning (WeMeal+)
// ============================================
const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

window.generateMealPlan = function () {
  if (!state.isPremium) {
    if (typeof showPremiumPaywall === 'function') {
      showPremiumPaywall('planning');
    }
    return;
  }

  const allRecipes = window.recipesDatabase || window.recipes || [];
  if (allRecipes.length < 14) {
    showToast("Pas assez de recettes pour générer un planning complet.");
    return;
  }

  // Hide intro, show grid
  document.getElementById('planning-intro').classList.add('hidden');
  document.getElementById('planning-grid').classList.remove('hidden');

  // Stop background generation if any
  if (window.planningBgInterval) clearInterval(window.planningBgInterval);

  // Generate 14 random unique recipes
  const shuffled = [...allRecipes].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 14);

  state.currentMealPlan = {};

  let i = 0;
  DAYS_OF_WEEK.forEach(day => {
    state.currentMealPlan[day] = {
      midi: selected[i++],
      soir: selected[i++]
    };
  });

  if (typeof window.renderMealPlan === 'function') {
    window.renderMealPlan();
  }
};

window.renderMealPlan = function () {
  const container = document.getElementById('planning-days-container');
  if (!container || !state.currentMealPlan) return;

  container.innerHTML = DAYS_OF_WEEK.map(day => {
    const midi = state.currentMealPlan[day].midi;
    const soir = state.currentMealPlan[day].soir;

    const renderMeal = (meal, label) => {
      const isCooked = state.cookedRecipes.includes(meal.id);
      const imgHtml = meal.image
        ? `<img src="${meal.image}" alt="${meal.name}" class="meal-image-small">`
        : `<div class="meal-image-small" style="display:flex; align-items:center; justify-content:center; background: rgba(var(--primary-rgb), 0.1); font-size: 1.8rem; box-shadow: none; border: 1px solid rgba(255,255,255,0.1);">${meal.emoji || '<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"></path></svg>'}</div>`;

      return `
        <div class="meal-slot ${isCooked ? 'cooked' : ''}" onclick="openRecipeDetail('${meal.id}')">
          ${imgHtml}
          <div class="meal-info">
            <span class="meal-id-label">${label} ${isCooked ? '<span class="cooked-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' : ''}</span>
            <div class="meal-name-row">
              <span class="meal-name">${meal.name}</span>
              ${meal.image ? `<span class="meal-emoji-tag">${meal.emoji || '<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"></path></svg>'}</span>` : ''}
            </div>
          </div>
          <div style="display:flex; align-items:center; color: var(--text-secondary); opacity: 0.5;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      `;
    };

    return `
      <div class="glass planning-day-card">
        <div class="day-title">
          <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>
          <span>${day}</span>
        </div>
        ${renderMeal(midi, 'Midi')}
        ${renderMeal(soir, 'Soir')}
      </div>
    `;
  }).join('');
};

window.initPlanningBackground = function () {
  const container = document.getElementById('planning-bg-emojis');
  if (!container) return;

  const foodEmojis = ['', '', '', '🍖', '', '', '', '', '', '', '', '', '', '', '', '', ''];

  if (window.planningBgInterval) clearInterval(window.planningBgInterval);

  const addEmoji = () => {
    const intro = document.getElementById('planning-intro');
    if (document.getElementById('page-planning').classList.contains('active') &&
      intro && !intro.classList.contains('hidden')) {
      const emoji = document.createElement('div');
      emoji.className = 'floating-food';
      emoji.textContent = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];

      const startX = Math.random() * window.innerWidth;
      const targetX = (Math.random() - 0.5) * 400; // random drift
      const targetY = -(window.innerHeight + 100);

      emoji.style.left = startX + 'px';
      emoji.style.bottom = '-50px';
      emoji.style.setProperty('--tw-x', targetX + 'px');
      emoji.style.setProperty('--tw-y', targetY + 'px');

      const duration = 10 + Math.random() * 10;
      emoji.style.animationDuration = duration + 's';

      container.appendChild(emoji);
      setTimeout(() => emoji.remove(), duration * 1000);
    }
  };

  // Initial batch
  for (let i = 0; i < 8; i++) setTimeout(addEmoji, i * 500);

  window.planningBgInterval = setInterval(addEmoji, 2000);
};

// Hook into switchPage if it exists
const originalSwitchPage = window.switchPage;
window.switchPage = function (pageId) {
  if (typeof originalSwitchPage === 'function') originalSwitchPage(pageId);
  if (pageId === 'planning') {
    window.initPlanningBackground();
  } else {
    if (window.planningBgInterval) clearInterval(window.planningBgInterval);
  }
};

window.addPlanToShoppingList = function () {
  if (!state.currentMealPlan) return;

  showToast("Préparation de votre panier...");

  let allIngredients = [];
  Object.values(state.currentMealPlan).forEach(meals => {
    if (meals.midi && meals.midi.ingredients) allIngredients.push(...meals.midi.ingredients);
    if (meals.soir && meals.soir.ingredients) allIngredients.push(...meals.soir.ingredients);
  });

  setTimeout(() => {
    if (typeof addToShoppingList === 'function') {
      addToShoppingList(allIngredients);
    }
    if (typeof switchPage === 'function') {
      switchPage('shopping');
    }
  }, 800);
};
// ============================================
// DEBUG FUNCTIONS
// ============================================
function updateDebugStateUI() {
  const container = document.getElementById('debug-user-state');
  if (!container) return;

  const debugInfo = {
    uid: window.firebaseUser ? window.firebaseUser.uid : 'Guest',
    email: window.firebaseUser ? window.firebaseUser.email : 'None',
    isPremium: state.isPremium,
    premiumUntil: state.premiumUntil,
    premiumUntilFormatted: state.premiumUntil ? new Date(state.premiumUntil).toLocaleString() : 'None',
    hasDebugAccess: state.userProfile ? state.userProfile.hasDebugAccess : false,
    ingredients: state.ingredients,
    currentPage: state.currentPage,
    onboardingSeen: localStorage.getItem('wemeal_tutorial_seen')
  };

  container.textContent = JSON.stringify(debugInfo, null, 2);
}

window.debugResetOnboarding = function () {
  localStorage.removeItem('wemeal_tutorial_seen');
  alert("Onboarding réinitialisé. Rechargez la page ou revenez à l'accueil.");
};

window.debugTogglePremium = function () {
  state.isPremium = !state.isPremium;
  localStorage.setItem('wemeal_is_premium', JSON.stringify(state.isPremium));
  updateFreeLimitsUI();
  updateDebugStateUI();
  showToast(`Premium local: ${state.isPremium}`);
};

window.debugClearCache = function () {
  if (confirm("Tout effacer (Favoris, Planning, Onboarding) ?")) {
    localStorage.clear();
    location.reload();
  }
};

window.debugShowState = function () {
  console.log("=== FULL SYSTEM STATE ===");
  console.log("Global State:", state);
  console.log("Firebase User:", window.firebaseUser);
  console.log("Firebase Profile:", state.userProfile);
  showToast("State logged in dev console ");
};

let isDebugInspectorActive = false;
window.toggleDebugInspector = function () {
  isDebugInspectorActive = !isDebugInspectorActive;
  const btn = document.getElementById('btn-toggle-inspector');

  if (isDebugInspectorActive) {
    btn.textContent = "Désactiver l'inspecteur";
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-danger');
    document.body.style.cursor = "crosshair";
    document.addEventListener('mouseover', handleDebugHover);
  } else {
    btn.textContent = "Activer l'inspecteur";
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-danger');
    document.body.style.cursor = "";
    document.removeEventListener('mouseover', handleDebugHover);
    // Remove last tooltip if any
    const existing = document.getElementById('debug-inspector-tooltip');
    if (existing) existing.remove();
  }
};

function handleDebugHover(e) {
  if (!isDebugInspectorActive) return;

  const target = e.target;
  let tooltip = document.getElementById('debug-inspector-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'debug-inspector-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.background = 'rgba(0,0,0,0.9)';
    tooltip.style.color = '#8b5cf6';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '10px';
    tooltip.style.zIndex = '999999';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.border = '1px solid #8b5cf6';
    tooltip.style.fontFamily = 'monospace';
    document.body.appendChild(tooltip);
  }

  const id = target.id ? `#${target.id}` : '';
  const classes = target.className ? `.${[...target.classList].join('.')}` : '';
  tooltip.textContent = `${target.tagName.toLowerCase()}${id}${classes}`;

  tooltip.style.left = `${e.clientX + 10}px`;
  tooltip.style.top = `${e.clientY + 10}px`;
}

// ============================================
// NOTIFICATION INTERFACE LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const bellBtn = document.getElementById('notification-bell');
  const modal = document.getElementById('notification-modal');
  const closeBtn = document.getElementById('close-notifications');
  const list = document.getElementById('notifications-list');
  const badge = document.getElementById('notification-badge');
  const clearBtn = document.getElementById('clear-notifications');

  if (!bellBtn) return;

  // Open Modal
  bellBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    badge.classList.add('hidden');
    // Save "last seen" to clear badge
    localStorage.setItem('wemeal_last_notif_seen', new Date().toISOString());
  });

  // Close Modal
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Clear All
  clearBtn.addEventListener('click', async () => {
    if (confirm('Voulez-vous supprimer tout votre historique de notifications ?')) {
      const items = list.querySelectorAll('.notification-item');
      for (const item of items) {
        const id = item.dataset.id;
        if (window.clearNotificationFromFirestore) {
          await window.clearNotificationFromFirestore(id);
        }
      }
    }
  });

  // Listen for data updates from firebase-loader.js
  window.addEventListener('notifications-updated', (e) => {
    const notifications = e.detail;
    renderNotifications(notifications);
    updateNotificationBadge(notifications);
  });

  function renderNotifications(notifications) {
    if (!list) return;
    list.innerHTML = '';

    if (notifications.length === 0) {
      list.innerHTML = '<div class="notification-empty">Aucune notification pour le moment.</div>';
      return;
    }

    notifications.forEach(notif => {
      const date = notif.sentAt?.seconds ? new Date(notif.sentAt.seconds * 1000) : new Date();
      const timeStr = date.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

      const item = document.createElement('div');
      item.className = 'notification-item';
      item.dataset.id = notif.id;
      item.innerHTML = `
                <button class="delete-notification" onclick="window.clearNotificationFromFirestore('${notif.id}')">&times;</button>
                <h4>${notif.title}</h4>
                <p>${notif.body}</p>
                <span class="notification-time">${timeStr}</span>
            `;
      list.appendChild(item);
    });
  }

  function updateNotificationBadge(notifications) {
    if (!badge) return;
    const lastSeen = new Date(localStorage.getItem('wemeal_last_notif_seen') || 0);

    const hasUnread = notifications.some(n => {
      const sentAt = n.sentAt?.seconds ? new Date(n.sentAt.seconds * 1000) : new Date();
      return sentAt > lastSeen;
    });

    if (hasUnread) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
});

// ============================================
// NEW FEATURES — Phases 1-5
// ============================================

// --- Utility: Toast Notification ---
function showToast(msg) {
  const t = document.getElementById('wemeal-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
window.showToast = showToast;

// --- PHASE 1: Skeleton Loading ---
function showSkeletonLoading(containerId, count = 6) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  for (let i = 0; i < count; i++) {
    c.innerHTML += `<div class="skeleton-card"><div class="skeleton-circle"></div><div class="skeleton-lines"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div></div></div>`;
  }
}

// --- PHASE 1: Navigation Badges ---
function updateNavBadges() {
  // Shopping count badge
  const shoppingNav = document.querySelector('.nav-item[data-page="shopping"] .nav-icon');
  if (shoppingNav) {
    let badge = shoppingNav.querySelector('.nav-badge');
    const items = JSON.parse(localStorage.getItem('wemeal_shopping_list') || '[]');
    const count = items.length;
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-badge';
        shoppingNav.style.position = 'relative';
        shoppingNav.appendChild(badge);
      }
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else if (badge) {
      badge.classList.add('hidden');
    }
  }

  // Planning dot badge (if no plan generated)
  const planningNav = document.querySelector('.nav-item[data-page="planning"] .nav-icon');
  if (planningNav) {
    let dot = planningNav.querySelector('.nav-badge-dot');
    const hasPlan = localStorage.getItem('wemeal_meal_plan');
    if (!hasPlan) {
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'nav-badge-dot';
        planningNav.style.position = 'relative';
        planningNav.appendChild(dot);
      }
    } else if (dot) {
      dot.remove();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {

  // --- Season Detection ---
  updateSeasonBanner();

  // --- Nav badges ---
  updateNavBadges();

  // --- Share Button ---
  const shareBtn = document.getElementById('recipe-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const recipe = state.currentRecipe;
      if (!recipe) return;
      const shareData = {
        title: `${recipe.emoji} ${recipe.name} — WeMeal`,
        text: `Découvre cette recette : ${recipe.name}\n⏱️ ${recipe.time} | 🔥 ${recipe.calories} kcal\nSur WeMeal !`,
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(() => { });
      } else {
        navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        showToast('📋 Lien copié !');
      }
    });
  }

  // --- Notes & Rating ---
  const saveNoteBtn = document.getElementById('save-note-btn');
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      const recipe = state.currentRecipe;
      if (!recipe) return;
      const note = document.getElementById('recipe-note-input').value;
      const notes = JSON.parse(localStorage.getItem('wemeal_notes') || '{}');
      notes[recipe.id] = note;
      localStorage.setItem('wemeal_notes', JSON.stringify(notes));
      showToast('📝 Note sauvegardée !');
    });
  }

  const ratingContainer = document.getElementById('recipe-rating');
  if (ratingContainer) {
    ratingContainer.addEventListener('click', (e) => {
      const star = e.target.closest('.rating-star');
      if (!star || !state.currentRecipe) return;
      const val = parseInt(star.dataset.star);
      const ratings = JSON.parse(localStorage.getItem('wemeal_ratings') || '{}');
      ratings[state.currentRecipe.id] = val;
      localStorage.setItem('wemeal_ratings', JSON.stringify(ratings));
      updateRatingStars(val);
      showToast(`⭐ Note : ${val}/5`);
    });
  }

  // --- Gamification ---
  renderAchievements();
});

// --- Rating Star display ---
function updateRatingStars(rating) {
  document.querySelectorAll('#recipe-rating .rating-star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.star) <= rating);
  });
}

// --- Load notes & rating when recipe opens ---
const _origOpenDetail = openRecipeDetail;
openRecipeDetail = function (recipeOrId) {
  _origOpenDetail(recipeOrId);

  const recipe = state.currentRecipe;
  if (!recipe) return;

  // Load note
  const notes = JSON.parse(localStorage.getItem('wemeal_notes') || '{}');
  const noteInput = document.getElementById('recipe-note-input');
  if (noteInput) noteInput.value = notes[recipe.id] || '';

  // Load rating
  const ratings = JSON.parse(localStorage.getItem('wemeal_ratings') || '{}');
  updateRatingStars(ratings[recipe.id] || 0);
};

// --- Season Detection (integrated in weather widget) ---
function updateSeasonBanner() {
  const month = new Date().getMonth(); // 0-11
  let season, icon;
  if (month >= 2 && month <= 4) {
    season = 'Printemps'; icon = '🌸';
  } else if (month >= 5 && month <= 7) {
    season = 'Été'; icon = '☀️';
  } else if (month >= 8 && month <= 10) {
    season = 'Automne'; icon = '🍂';
  } else {
    season = 'Hiver'; icon = '❄️';
  }
  const iconEl = document.getElementById('season-icon-w');
  const labelEl = document.getElementById('season-label-w');
  if (iconEl) iconEl.textContent = icon;
  if (labelEl) labelEl.textContent = season;
}

// --- PHASE 5: Gamification ---

// Secret Book Recipes (unlocked at 100%)
const SECRET_RECIPES = [
  { icon: '🫕', name: 'Pot-au-Feu des Origines', desc: 'La toute première recette qui a inspiré WeMeal. Un bouillon de bœuf mijoté 6 heures, légumes oubliés et moelle fondante.', time: '360 min', difficulty: 'Expert' },
  { icon: '🥘', name: 'Ratatouille de Grand-Mère', desc: 'La recette originale de la grand-mère d\'un fondateur, transmise sur un carnet jauni.', time: '90 min', difficulty: 'Intermédiaire' },
  { icon: '🍮', name: 'Crème Brûlée Fondatrice', desc: 'La recette secrète testée le soir de la création de WeMeal, devenue la recette "chance" de l\'équipe.', time: '45 min', difficulty: 'Facile' },
  { icon: '🦞', name: 'Bisque de Homard Perdita', desc: 'Une bisque raffinée nommée d\'après la chatte de l\'un des fondateurs. Servie lors du premier dîner de lancement.', time: '120 min', difficulty: 'Expert' },
  { icon: '🍫', name: 'Fondant Noir Impérial', desc: 'Le dessert servi lors de la célébration du 1000ème utilisateur WeMeal. Chocolat 99%, caramel salé, noisettes torréfiées.', time: '35 min', difficulty: 'Intermédiaire' }
];

const MILESTONE_TIERS = [
  { tier: 1, fraction: 1 / 3, name: 'Rang Bronze', emoji: '🥉', color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32, #a0522d, #e8a96b)', reward: 'Bordure de profil animée Bronze permanente', borderClass: 'rank-bronze' },
  { tier: 2, fraction: 2 / 3, name: 'Rang Argent', emoji: '🥈', color: '#b0b0c8', gradient: 'linear-gradient(135deg, #e8e8ff, #b0b0c8, #8888aa)', reward: 'Bordure Argent + 1 semaine WeMeal+ offerte', borderClass: 'rank-silver' },
  { tier: 3, fraction: 1, name: 'Rang Or ✨', emoji: '🏆', color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700, #ff8c00, #ffe566)', reward: '1 mois WeMeal+ + Accès au Livre Secret des Fondateurs', borderClass: 'rank-gold' }
];


function renderAchievements() {
  const container = document.getElementById('achievements-grid');
  const streakContainer = document.getElementById('streak-container');
  if (!container) return;

  // --- CLOUD GUARD ---
  // Prevent calculating 0 achievements and overwriting cloud data before it arrives
  if (!window.isCloudDataLoaded) {
    console.log("⏳ Waiting for cloud data before rendering achievements...");
    // Listen for the event to re-run once data is ready
    window.addEventListener('cloud-data-loaded', () => renderAchievements(), { once: true });

    // Optionally show a loading state if needed, but for now we just wait
    return;
  }

  const historyCount = state.history.length;
  const favCount = state.favorites.length;
  const customCount = state.customRecipes ? state.customRecipes.length : 0;

  // Compute streak (with grace period for today)
  const today = new Date();
  const dateSet = new Set();
  state.history.forEach(h => {
    dateSet.add(new Date(h.date).toDateString());
  });
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dateSet.has(d.toDateString())) {
      streak++;
    } else {
      if (i === 0) continue; // Grace: no entry today yet? Keep streak alive till midnight
      break;
    }
  }

  // Streak display
  if (streakContainer) {
    if (streak >= 2) {
      streakContainer.innerHTML = `<div class="streak-badge"><span class="streak-fire">🔥</span><span class="streak-count">${streak}</span><span class="streak-text">jours d'affilée !</span></div>`;
    } else {
      streakContainer.innerHTML = '';
    }
  }

  const achievements = [
    { id: 'first', icon: '👨‍🍳', name: 'Premier Plat', desc: '1ère recette consultée', unlocked: historyCount >= 1 },
    { id: 'five', icon: '🥄', name: 'Apprenti Chef', desc: '5 recettes consultées', unlocked: historyCount >= 5 },
    { id: 'ten', icon: '🍴', name: 'Cuisinier', desc: '10 recettes consultées', unlocked: historyCount >= 10 },
    { id: 'twenty', icon: '⭐', name: 'Chef Étoilé', desc: '20 recettes consultées', unlocked: historyCount >= 20 },
    { id: 'fifty', icon: '👑', name: 'Maître Chef', desc: '50 recettes consultées', unlocked: historyCount >= 50 },
    { id: 'fav3', icon: '❤️', name: 'Gourmet', desc: '3 recettes en favoris', unlocked: favCount >= 3 },
    { id: 'fav10', icon: '💎', name: 'Collectionneur', desc: '10 recettes en favoris', unlocked: favCount >= 10 },
    { id: 'custom', icon: '✨', name: 'Créateur', desc: '1 recette personnalisée', unlocked: customCount >= 1 },
    { id: 'streak3', icon: '🔥', name: 'Assidu', desc: '3 jours d\'affilée', unlocked: streak >= 3 }
  ];

  // — Merge and respect Admin Revocations —
  const storedUnlocked = JSON.parse(localStorage.getItem('wemeal_unlocked_achievements') || '[]');
  const processed = JSON.parse(localStorage.getItem('wemeal_processed_achievements') || '[]');
  const revoked = JSON.parse(localStorage.getItem('wemeal_revoked_achievements') || '[]');

  achievements.forEach(a => {
    const meetsCriteria = a.unlocked; // Calculated from history/favs etc.
    const hasBeenProcessed = processed.includes(a.id);
    const isInCloud = storedUnlocked.includes(a.id);
    const isRevoked = revoked.includes(a.id);

    // Achievement is UNLOCKED if:
    // It's in the cloud list (Admin grant or previously synced)
    // OR it meets criteria AND hasn't been processed (first-time auto unlock)
    // AND it has not been revoked explicitly by an admin
    if (!isRevoked && (isInCloud || (meetsCriteria && !hasBeenProcessed))) {
      a.unlocked = true;
    } else {
      a.unlocked = false;
    }
  });

  const currentUnlockedIds = achievements.filter(a => a.unlocked).map(a => a.id);
  const newlyUnlocked = currentUnlockedIds.filter(id => !storedUnlocked.includes(id));

  // — Re-calculate tier based on final state —
  const finalUnlockedCount = currentUnlockedIds.length;
  const unlockedCount = finalUnlockedCount; // For UI
  const total = achievements.length;
  const storedMilestone = parseInt(localStorage.getItem('wemeal_milestone_tier') || '0');

  // Start with calculation purely based on current unlocked count to allow demotions
  let currentMilestone = 0;
  for (const t of MILESTONE_TIERS) {
    if (unlockedCount >= Math.ceil(total * t.fraction)) {
      if (t.tier > currentMilestone) currentMilestone = t.tier;
    }
  }

  // Handle demotions: If the calculated milestone is less than the previously stored milestone,
  // it means the admin revoked an achievement and the user lost their rank.
  if (currentMilestone < storedMilestone) {
    // Clear the stored milestone so they can re-trigger the rewards if they earn it back
    localStorage.setItem('wemeal_milestone_tier', String(currentMilestone));

    // Clear any generated codes for the tiers they just lost, allowing fresh generation next time
    for (let i = currentMilestone + 1; i <= storedMilestone; i++) {
      localStorage.removeItem(`wemeal_milestone_code_t${i}`);
    }
    window.dispatchEvent(new CustomEvent('profile-updated'));
  }

  // Apply rank border & badge to profile avatar
  const avatar = document.getElementById('profile-avatar');
  const badge = document.getElementById('profile-rank-badge');
  if (avatar) {
    avatar.classList.remove('rank-bronze', 'rank-silver', 'rank-gold');
    if (badge) {
      badge.classList.remove('bronze', 'silver', 'gold');
      badge.classList.add('hidden');
    }

    const tier = MILESTONE_TIERS.find(t => t.tier === currentMilestone);
    if (tier && currentMilestone > 0) {
      avatar.classList.add(tier.borderClass);
      if (badge) {
        badge.classList.remove('hidden');
        badge.classList.add(tier.borderClass.replace('rank-', ''));
        badge.textContent = tier.emoji;
      }
    }
  }

  // — Build Progress Bar —
  const progressPct = total > 0 ? (unlockedCount / total) * 100 : 0;
  const progressHtml = `
    <div class="achp-wrap" id="achp-wrap" onclick="window.openMilestoneInfoModal()" title="Voir les récompenses de rang">
      <div class="achp-header-row">
        <span class="achp-label">🏅 Progression des Rangs</span>
        <span class="achp-count">${unlockedCount} / ${total} Succès</span>
      </div>
      <div class="achp-bar-track">
        <div class="achp-bar-fill" style="width: ${progressPct}%"></div>
        ${MILESTONE_TIERS.map(t => `
          <div class="achp-dot ${currentMilestone >= t.tier ? 'achp-dot-reached' : ''}" style="left:${t.fraction * 100}%; --dot-color:${t.color};">
            <span>${t.emoji}</span>
          </div>
        `).join('')}
      </div>
      <div class="achp-labels-row">
        ${MILESTONE_TIERS.map(t => `<span class="achp-tier-tag ${currentMilestone >= t.tier ? 'achp-tier-reached' : ''}" style="--dot-color:${t.color};">${t.emoji} ${t.name}</span>`).join('')}
      </div>
    </div>
  `;

  // — Secret Book Button (only if 100%) —
  const secretBookHtml = currentMilestone >= 3 ? `
    <button class="secret-book-btn" onclick="event.stopPropagation(); window.openSecretBook()">
      <span>📖</span>
      <span>Le Livre Secret des Fondateurs</span>
      <span class="secret-book-vip">VIP</span>
    </button>` : '';

  // Inject progress bar container above the grid
  let progressContainer = document.getElementById('achp-container');
  if (!progressContainer) {
    progressContainer = document.createElement('div');
    progressContainer.id = 'achp-container';
    container.parentNode.insertBefore(progressContainer, container);
  }
  progressContainer.innerHTML = progressHtml + secretBookHtml;

  // — Render achievement cards —
  container.innerHTML = achievements.map(a => `
    <div class="achievement-card ${a.unlocked ? 'unlocked' : ''} ${newlyUnlocked.includes(a.id) ? 'just-unlocked' : ''}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
    </div>
  `).join('');

  // Show achievement unlocked modal for newly unlocked
  if (newlyUnlocked.length > 0) {
    const first = achievements.find(a => a.id === newlyUnlocked[0]);
    if (first) {
      setTimeout(() => showAchievementModal(first), 500);
    }
    // Update storage with the new merged list
    localStorage.setItem('wemeal_unlocked_achievements', JSON.stringify(currentUnlockedIds));

    // Also track as processed so we don't loop if admin removes it later
    const processedNew = Array.from(new Set([...JSON.parse(localStorage.getItem('wemeal_processed_achievements') || '[]'), ...newlyUnlocked]));
    localStorage.setItem('wemeal_processed_achievements', JSON.stringify(processedNew));

    // Trigger sync to cloud
    window.dispatchEvent(new CustomEvent('profile-updated'));
  }

  // Show milestone modal if tier has advanced
  if (currentMilestone > storedMilestone) {
    const tierInfo = MILESTONE_TIERS.find(t => t.tier === currentMilestone);
    if (tierInfo) {
      localStorage.setItem('wemeal_milestone_tier', String(currentMilestone));
      window.dispatchEvent(new CustomEvent('profile-updated'));
      setTimeout(() => showMilestoneModal(tierInfo), newlyUnlocked.length > 0 ? 3500 : 500);
    }
  }
}

// =============================================
// Achievement Unlocked Modal
// =============================================
function showAchievementModal(achievement) {
  const userName = (state.userProfile && state.userProfile.displayName) ? state.userProfile.displayName : 'Chef';
  const overlay = document.createElement('div');
  overlay.className = 'ach-modal-overlay';
  overlay.innerHTML = `
    <div class="ach-modal-card" role="dialog" aria-modal="true">
      <div class="ach-modal-shine"></div>
      <div class="ach-modal-icon-ring">${achievement.icon}</div>
      <div class="ach-modal-sub">Succès Débloqué !</div>
      <div class="ach-modal-title">${achievement.name}</div>
      <div class="ach-modal-desc">${achievement.desc}</div>
      <div class="ach-modal-congrats">Bien joué, ${userName} ! 🎉</div>
      <div class="ach-modal-btns">
        <button class="ach-btn-share" onclick="window.shareAchievement('${achievement.name}', '${achievement.icon}')">📤 Partager</button>
        <button class="ach-btn-close" onclick="this.closest('.ach-modal-overlay').remove()">Fermer</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// =============================================
// Milestone Reward Modal
// =============================================

// Helper: generate a MEAL + 5 random chars code
async function generateMilestoneCode(tier) {
  if (tier < 2) return null; // Bronze has no code

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand5 = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  // Check if user already has a milestone code for this tier stored
  const storedKey = `wemeal_milestone_code_t${tier}`;
  const existing = localStorage.getItem(storedKey);
  if (existing) return existing;

  if (!window.db) return null; // Firebase not ready

  const benefitType = tier === 2 ? '1_week_premium' : '1_month_premium';
  const durationDays = tier === 2 ? 7 : 30;

  // Retry up to 3 times to ensure unique code
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = 'MEAL' + rand5();
    try {
      const { doc, setDoc, getDoc } = window.firebaseFunctions || {};
      if (!doc || !setDoc || !getDoc) return null;

      // Check uniqueness in Firestore
      const ref = doc(window.db, 'benefit_codes', code);
      const snap = await getDoc(ref);
      if (snap.exists()) continue; // Collision, try again

      // Write the benefit code
      await setDoc(ref, {
        type: benefitType,
        durationDays,
        isActive: true,
        maxUses: 1,
        totalUses: 0,
        oncePerUser: false,
        isMilestoneReward: true,
        milestoneOwnerUid: state.currentUser?.uid || null,
        createdAt: new Date().toISOString()
      });

      // Cache locally so we show the same code if modal is reopened
      localStorage.setItem(storedKey, code);
      return code;
    } catch (err) {
      console.warn('Milestone code generation error:', err);
    }
  }
  return null;
}

async function showMilestoneModal(tierInfo) {
  // Prevent multiple milestone modals from stacking
  if (document.querySelector('.milestone-overlay')) {
    document.querySelectorAll('.milestone-overlay').forEach(el => el.remove());
  }

  const userName = (state.userProfile && state.userProfile.displayName) ? state.userProfile.displayName : 'Chef';
  const overlay = document.createElement('div');
  overlay.className = 'ach-modal-overlay milestone-overlay';

  // Show loading state while code is generated
  overlay.innerHTML = `
    <div class="ach-modal-card milestone-card" style="--tier-gradient: ${tierInfo.gradient}; --tier-color: ${tierInfo.color};" role="dialog" aria-modal="true">
      <div class="milestone-glow-bg"></div>
      <div class="milestone-badge-anim">${tierInfo.emoji}</div>
      <div class="milestone-congrats">Félicitations, ${userName} !</div>
      <div class="milestone-tier-name">${tierInfo.name}</div>
      <div class="milestone-reward-box">
        <div class="milestone-reward-title">🎁 Votre récompense</div>
        <div class="milestone-reward-text">${tierInfo.reward}</div>
        ${tierInfo.tier >= 2 ? `<div class="milestone-promo" style="opacity:0.5">⏳ Génération de votre code…</div>` : ''}
      </div>
      <button class="ach-btn-close milestone-close-btn" onclick="this.closest('.ach-modal-overlay').remove()">Super ! 🚀</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  const colors = tierInfo.tier === 1 ? ['#cd7f32', '#a0522d', '#ffd700'] :
    tierInfo.tier === 2 ? ['#c0c0c0', '#e8e8e8', '#88aaff'] :
      ['#ffd700', '#ff8c00', '#fffde4'];
  if (typeof confetti === 'function') {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors });
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.3 }, colors }), 900);
  }
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  // Generate the real code and update the display
  if (tierInfo.tier >= 2) {
    const code = await generateMilestoneCode(tierInfo.tier);
    // Find the element within THIS specific modal instance instead of using a global ID
    const codeEl = overlay.querySelector('.milestone-promo');
    if (codeEl) {
      if (code) {
        codeEl.style.opacity = '1';
        codeEl.innerHTML = `🎟 <strong>${code}</strong> <span class="promo-copy-hint">Copier</span>`;
        codeEl.title = 'Touchez pour copier';
        codeEl.onclick = () => window.copyPromoCode(codeEl);
      } else {
        codeEl.textContent = '⚠️ Code non disponible – reconnectez-vous';
      }
    }
  }
}


// =============================================
// Milestone Info Modal (progress bar click)
// =============================================
window.openMilestoneInfoModal = function () {
  const overlay = document.createElement('div');
  overlay.className = 'ach-modal-overlay';
  overlay.innerHTML = `
    <div class="ach-modal-card minfo-card" role="dialog" aria-modal="true">
      <div class="ach-modal-title" style="font-size:1.25rem">🏅 Système de Rang</div>
      <p class="minfo-intro">Débloquez des succès et montez en rang pour gagner des récompenses exclusives !</p>
      <div class="minfo-tiles">
        ${MILESTONE_TIERS.map(t => `
          <div class="minfo-tile" style="--tile-color: ${t.color}">
            <div class="minfo-tile-icon">${t.emoji}</div>
            <div class="minfo-tile-name">${t.name}</div>
            <div class="minfo-tile-reward">${t.reward}</div>
          </div>
        `).join('')}
      </div>
      <button class="ach-btn-close" onclick="this.closest('.ach-modal-overlay').remove()">Compris !</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
};

// =============================================
// Share Achievement
// =============================================
window.shareAchievement = function (name, icon) {
  const text = `${icon} Je viens de débloquer le succès "${name}" sur WeMeal ! 🍽️\nhttps://wemeal.online`;
  if (navigator.share) {
    navigator.share({ title: 'Succès WeMeal', text }).catch(() => { });
  } else {
    navigator.clipboard.writeText(text).then(() => showToast('✅ Copié dans le presse-papiers !'));
  }
};

// =============================================
// Copy Promo Code
// =============================================
window.copyPromoCode = function (el) {
  const code = el.textContent.replace('Copier', '').replace('🎟', '').trim();
  navigator.clipboard.writeText(code).then(() => {
    showToast('✅ Code promo copié !');
    const hint = el.querySelector('.promo-copy-hint');
    if (hint) hint.textContent = 'Copié !';
  });
};

// =============================================
// Secret Book Modal
// =============================================
window.openSecretBook = function () {
  const overlay = document.createElement('div');
  overlay.className = 'ach-modal-overlay secret-overlay';
  overlay.innerHTML = `
    <div class="ach-modal-card secret-book-card" role="dialog" aria-modal="true">
      <div class="secret-book-header">
        <span class="secret-book-hicon">📖</span>
        <div>
          <div class="secret-book-htitle">Le Livre Secret des Fondateurs</div>
          <div class="secret-book-hsub">Réservé aux Chefs Légendaires</div>
        </div>
      </div>
      <p class="secret-book-intro">Merci de votre fidélité absolue. Voici les recettes originelles qui ont inspiré WeMeal, jamais partagées avant…</p>
      <div class="secret-recipes-list">
        ${SECRET_RECIPES.map(r => `
          <div class="secret-recipe-card">
            <div class="secret-recipe-icon">${r.icon}</div>
            <div class="secret-recipe-body">
              <div class="secret-recipe-name">${r.name}</div>
              <div class="secret-recipe-desc">${r.desc}</div>
              <div class="secret-recipe-meta">⏱ ${r.time} &nbsp;·&nbsp; 👨‍🍳 ${r.difficulty}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="ach-btn-close" onclick="this.closest('.ach-modal-overlay').remove()">📕 Refermer le livre</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
};



// --- Update nav badges on shopping list changes ---
const _origRenderShopping = typeof renderShoppingList === 'function' ? renderShoppingList : null;
if (_origRenderShopping) {
  renderShoppingList = function () {
    _origRenderShopping();
    updateNavBadges();
  };
}

// --- Patch switchPage to update badges ---
const _origSwitchPage2 = switchPage;
switchPage = function (pageName, shouldUpdateURL) {
  _origSwitchPage2(pageName, shouldUpdateURL);
  updateNavBadges();
};

// --- Difficulty helper for recipe cards ---
function getDifficulty(recipe) {
  const time = parseInt(recipe.time) || 30;
  const steps = (recipe.steps || []).length;
  if (time <= 15 && steps <= 4) return { label: 'Facile', cls: 'easy' };
  if (time >= 45 || steps >= 8) return { label: 'Difficile', cls: 'hard' };
  return { label: 'Moyen', cls: 'medium' };
}

// --- Patch renderRecipeCard to add difficulty + gradient background ---
const _origRenderCard = renderRecipeCard;
renderRecipeCard = function (recipe, container) {
  _origRenderCard(recipe, container);
  // Get the last appended card
  const card = container.lastElementChild;
  if (!card) return;

  // Add difficulty badge
  const diff = getDifficulty(recipe);
  const meta = card.querySelector('.recipe-meta');
  if (meta && !meta.querySelector('.difficulty-badge')) {
    const badge = document.createElement('span');
    badge.className = `difficulty-badge ${diff.cls}`;
    badge.textContent = diff.label;
    meta.appendChild(badge);
  }

  // Add gradient background to emoji circle
  const emojiDiv = card.querySelector('.recipe-emoji');
  if (emojiDiv) {
    // Generate a color based on recipe category
    const gradients = {
      'meat': 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(234,88,12,0.1))',
      'fish': 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))',
      'veggie': 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.1))',
      'vegetarian': 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.1))',
      'vegan': 'linear-gradient(135deg, rgba(22,163,74,0.2), rgba(16,185,129,0.1))',
      'dessert': 'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(236,72,153,0.1))',
      'breakfast': 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))',
      'soup': 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.1))',
      'salad': 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.1))',
      'asian': 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))',
      'pasta': 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(234,179,8,0.1))',
      'appetizer': 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.1))',
    };
    const rawCat = Array.isArray(recipe.category) ? (recipe.category[0] || '') : (recipe.category || '');
    const cat = rawCat.toLowerCase();
    emojiDiv.style.background = gradients[cat] || 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))';
  }
};

