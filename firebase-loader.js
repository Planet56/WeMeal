// ============================================
// WeMeal - Firebase Integration Sync
// ============================================

import { app, auth, db } from './firebase-config.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, increment, arrayUnion, arrayRemove, query, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-functions.js";

// Expose Firebase Functions helpers used by script.js checkout flow.
const functions = getFunctions(app, "us-central1");
window.db = db; // Expose Firestore db for use in script.js (e.g. milestone codes)
window.firebaseDb = db; // Alias used by admin.js
window.firebaseFunctions = {
    httpsCallable: (name) => httpsCallable(functions, name),
    doc, getDoc, setDoc, updateDoc, collection, getDocs, increment, arrayUnion, arrayRemove, query, where
};



function isLikelyImageSource(value) {
    if (typeof value !== 'string') return false;
    const src = value.trim();
    return src.startsWith('data:image/') ||
        src.startsWith('http://') ||
        src.startsWith('https://') ||
        src.startsWith('blob:') ||
        src.startsWith('/');
}

// ============================================
// AUTHENTICATION LOGIC
// ============================================

// Listen for authentication state changes (User logs in or out)
onAuthStateChanged(auth, async (user) => {
    window.firebaseUser = user; // Global reference for script.js

    const uiBtn = window.authProfileButton || document.getElementById('delete-account-btn');
    const appEl = document.getElementById('app');

    if (user) {
        console.log("🔥 User signed in:", user.email);

        // Show App
        if (appEl) appEl.style.display = 'block';
        if (window.closeAuthModal) window.closeAuthModal();

        // Fetch User Data from Firestore
        await loadUserData(user.uid);

        // Mark as loaded and notify script.js
        window.isCloudDataLoaded = true;
        window.dispatchEvent(new CustomEvent('cloud-data-loaded'));

        // Check Onboarding AFTER data is loaded
        if (typeof checkOnboarding === 'function') checkOnboarding();

        // Update UI Button
        if (uiBtn) {
            uiBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              </svg>
              Se Déconnecter
            `;
            uiBtn.style.backgroundColor = 'transparent';
            uiBtn.style.border = '1px solid var(--danger)';
            uiBtn.style.color = 'var(--danger)';
        }

        // Fetch User Data from Firestore
        await loadUserData(user.uid);

        // Push local history / favorites if they exist (Migration)
        // Note: Avoid eager syncLocalDataToCloud on every load to prevent overwriting cloud with stale local cache
        // await syncLocalDataToCloud(user.uid); 

        // Remote Logout Listener
        const { onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
        if (window.userDocListener) window.userDocListener(); // Clear old
        window.userDocListener = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (!docSnap.exists()) return;
            const cloudData = docSnap.data();

            // 1. Session check for remote logout
            const localProfileRaw = localStorage.getItem('wemeal_profile');
            const localProfile = localProfileRaw ? JSON.parse(localProfileRaw) : null;
            const localSessionVersion = localProfile?.sessionVersion || 0;
            const cloudSessionVersion = cloudData.sessionVersion || 0;

            if (localSessionVersion > 0 && cloudSessionVersion > localSessionVersion) {
                console.log("🚨 REMOTE LOGOUT TRIGGERED");
                window.dispatchEvent(new CustomEvent('auth-logout-request'));
                return;
            }

            // 2. Real-time update of app state (silently, without triggering a re-sync)
            console.log("☁️ Real-time cloud update received");
            applyCloudDataToLocalState(cloudData);
        });

    } else {
        if (window.userDocListener) window.userDocListener();
        window.userDocListener = null;
        console.log("🔥 User signed out");

        // Hide App, Force Auth Modal
        if (appEl) appEl.style.display = 'none';
        if (window.openAuthModal) window.openAuthModal();
        const authSubtitle = document.getElementById('auth-subtitle');
        if (authSubtitle) {
            authSubtitle.textContent = "Créez un compte ou connectez-vous pour utiliser WeMeal.";
        }

        if (uiBtn) {
            uiBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
              </svg>
              Se Connecter / Créer un compte
            `;
            uiBtn.style.backgroundColor = 'var(--primary)';
            uiBtn.style.color = 'white';
            uiBtn.style.border = 'none';
        }

        // Clean up UI
        if (typeof initializeHome === 'function') initializeHome();
    }
});

// Handle Login/Signup from UI
window.addEventListener('auth-submit-request', async (e) => {
    const { isLogin, email, password } = e.detail;
    const errorMsg = document.getElementById('auth-error-msg');
    const actionBtn = document.getElementById('auth-action-btn');
    const originalText = actionBtn.textContent;

    actionBtn.textContent = "Chargement...";
    actionBtn.disabled = true;

    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            // New Account Registration
            // Force a clean slate by wiping leftover local session data before account creation
            localStorage.removeItem('wemeal_profile');
            localStorage.removeItem('wemeal_favorites');
            localStorage.removeItem('wemeal_shopping_list');
            localStorage.removeItem('wemeal_history');
            localStorage.removeItem('wemeal_diabetic');
            localStorage.removeItem('wemeal_endo');
            localStorage.removeItem('wemeal_vegetarian');
            localStorage.removeItem('wemeal_vegan');
            localStorage.removeItem('wemeal_is_premium');
            localStorage.removeItem('wemeal_free_surprises');
            if (typeof state !== 'undefined') {
                state.userProfile = null;
                state.favorites = [];
                state.history = [];
                state.shoppingList = []; // ← Critical: reset in-memory shopping list from previous session
            }

            const userCred = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document in Firestore with NO PROFILE so onboarding triggers
            await setDoc(doc(db, "users", userCred.user.uid), {
                email: userCred.user.email,
                profile: null,
                isAdmin: false, // Admin status must be granted manually via the Admin Panel
                banned: false,
                banReason: '',
                platform: 'web',
                preferences: {
                    diabetic: false,
                    endo: false,
                    vegetarian: false,
                    vegan: false,
                    theme: 'system',
                    calories: true
                },
                favorites: [],
                history: [],
                shoppingList: [] // Explicit empty list so old in-memory data is never synced here
            });
        }

        if (window.closeAuthModal) window.closeAuthModal();
        if (typeof showToast === 'function') showToast("🔥 Connecté avec succès !");

    } catch (error) {
        console.error("Auth error:", error);
        errorMsg.textContent = "Erreur : " + translateFirebaseError(error.code);
        errorMsg.style.display = 'block';
    } finally {
        actionBtn.textContent = originalText;
        actionBtn.disabled = false;
    }
});

// Handle Profile Updates from UI (Finish Onboarding / Edit Profile)
window.addEventListener('profile-updated', async () => {
    if (window.firebaseUser) {
        await syncLocalDataToCloud(window.firebaseUser.uid);
    }
});

// Handle Logout from UI
window.addEventListener('auth-logout-request', async () => {
    try {
        await signOut(auth);

        // Wipe local storage so next visitor on device gets locked out or starts fresh
        localStorage.clear();

        if (typeof showToast === 'function') showToast("Déconnecté.");
        setTimeout(() => location.reload(), 500); // Reload the app completely
    } catch (error) {
        console.error("Logout Error", error);
    }
});


// ============================================
// CLOUD DATA SYNC
// ============================================

async function loadUserData(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            applyCloudDataToLocalState(docSnap.data());
        }

        // Load gift history
        try {
            const { query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
            // Sorting locally to avoid requiring a composite index in Firestore
            const qGifts = query(collection(db, "gift_codes"), where("buyerId", "==", uid));
            // Filtering isMilestoneReward on client to prevent need for composite index
            const qMilestones = query(collection(db, "benefit_codes"), where("milestoneOwnerUid", "==", uid));

            const [querySnapshot, milestoneSnapshot] = await Promise.all([
                getDocs(qGifts),
                getDocs(qMilestones)
            ]);

            const gifts = [];
            querySnapshot.forEach((doc) => {
                gifts.push(doc.data());
            });

            milestoneSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.isMilestoneReward === true) {
                    gifts.push({
                        code: doc.id,
                        plan: data.type === '1_week_premium' ? 'weekly' : 'monthly',
                        status: data.totalUses > 0 ? 'used' : 'unused',
                        buyerId: data.milestoneOwnerUid,
                        createdAt: data.createdAt,
                        usedBy: data.usedBy || null,
                        isMilestone: true,
                        tier: data.type === '1_week_premium' ? 2 : 3
                    });
                }
            });

            // Sort locally descending
            gifts.sort((a, b) => {
                let d1 = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
                let d2 = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
                return d2 - d1;
            });

            if (typeof window.renderGiftHistory === 'function') {
                window.renderGiftHistory(gifts);
            }
        } catch (err) {
            console.error("Error loading gift history:", err);
            // Ignore index errors silently if they haven't been created yet
            if (typeof window.renderGiftHistory === 'function') window.renderGiftHistory([]);
        }

    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

function applyCloudDataToLocalState(data) {
    if (typeof window.state === 'undefined') {
        console.warn("⚠️ window.state not found. Retrying in 1s...");
        setTimeout(() => applyCloudDataToLocalState(data), 1000);
        return;
    }

    const state = window.state;

    // 1. Sync Preferences
    if (data.preferences) {
        // For boolean toggles, local 'true' should not be overwritten by cloud 'false'
        // (prevents race condition where stale cloud data resets a toggle the user just enabled)
        const updatePref = (key, val, stateKey) => {
            if (val === undefined) return;
            // If local is true and cloud is false, keep local (user just toggled ON)
            if (state[stateKey] === true && val === false) return;
            if (state[stateKey] !== val) {
                localStorage.setItem(key, JSON.stringify(val));
                state[stateKey] = val;
            }
        };
        updatePref('wemeal_diabetic', data.preferences.diabetic, 'isDiabeticMode');
        updatePref('wemeal_endo', data.preferences.endo, 'isEndoMode');
        updatePref('wemeal_vegetarian', data.preferences.vegetarian, 'isVegetarianMode');
        updatePref('wemeal_vegan', data.preferences.vegan, 'isVeganMode');
        updatePref('wemeal_gluten_free', data.preferences.glutenFree, 'isGlutenFreeMode');
    }

    // 2. Sync Favorites
    if (data.favorites !== undefined && Array.isArray(data.favorites)) {
        if (JSON.stringify(data.favorites) !== JSON.stringify(state.favorites)) {
            state.favorites = data.favorites;
            localStorage.setItem('wemeal_favorites', JSON.stringify(state.favorites));
        }
    }

    // 3. Sync History
    if (data.history !== undefined && Array.isArray(data.history)) {
        if (JSON.stringify(data.history) !== JSON.stringify(state.history)) {
            state.history = data.history;
            localStorage.setItem('wemeal_history', JSON.stringify(state.history));
        }
    }

    // 4. Sync Shopping List
    if (data.shoppingList !== undefined && Array.isArray(data.shoppingList)) {
        if (JSON.stringify(data.shoppingList) !== JSON.stringify(state.shoppingList)) {
            state.shoppingList = data.shoppingList;
            localStorage.setItem('wemeal_shopping_list', JSON.stringify(state.shoppingList));
        }
    }

    // 5. Sync Custom Recipes
    if (data.customRecipes !== undefined && Array.isArray(data.customRecipes)) {
        if (JSON.stringify(data.customRecipes) !== JSON.stringify(state.customRecipes)) {
            state.customRecipes = data.customRecipes;
            localStorage.setItem('wemeal_custom_recipes', JSON.stringify(state.customRecipes));
        }
    }

    if (data.isPremium !== undefined && state.isPremium !== data.isPremium) {
        state.isPremium = data.isPremium;
        localStorage.setItem('wemeal_is_premium', JSON.stringify(state.isPremium));
    }

    if (data.wemeal_unlocked_achievements !== undefined && Array.isArray(data.wemeal_unlocked_achievements)) {
        const localAch = JSON.parse(localStorage.getItem('wemeal_unlocked_achievements') || '[]');
        if (JSON.stringify(data.wemeal_unlocked_achievements) !== JSON.stringify(localAch)) {
            localStorage.setItem('wemeal_unlocked_achievements', JSON.stringify(data.wemeal_unlocked_achievements));

            // Also update processed list to avoid double notifications for things already in cloud
            const processed = JSON.parse(localStorage.getItem('wemeal_processed_achievements') || '[]');
            const newProcessed = Array.from(new Set([...processed, ...data.wemeal_unlocked_achievements]));
            localStorage.setItem('wemeal_processed_achievements', JSON.stringify(newProcessed));

            // Force immediate UI update if updateStats exists
            if (typeof updateStats === 'function') updateStats();
        }
    }

    if (data.wemeal_revoked_achievements !== undefined && Array.isArray(data.wemeal_revoked_achievements)) {
        const localRev = JSON.parse(localStorage.getItem('wemeal_revoked_achievements') || '[]');
        if (JSON.stringify(data.wemeal_revoked_achievements) !== JSON.stringify(localRev)) {
            localStorage.setItem('wemeal_revoked_achievements', JSON.stringify(data.wemeal_revoked_achievements));
            if (typeof updateStats === 'function') updateStats();
        }
    }

    if (data.wemeal_milestone_tier !== undefined) {
        localStorage.setItem('wemeal_milestone_tier', data.wemeal_milestone_tier);
    }

    if (data.premiumUntil !== undefined) {
        const cloudUntil = data.premiumUntil?.seconds ? data.premiumUntil.seconds * 1000 : data.premiumUntil;
        if (state.premiumUntil !== cloudUntil) {
            state.premiumUntil = cloudUntil;
            if (state.premiumUntil) localStorage.setItem('wemeal_premium_until', state.premiumUntil);
            else localStorage.removeItem('wemeal_premium_until');
        }
    }

    if (data.freeSurpriseRemaining !== undefined && state.freeSurpriseRemaining !== data.freeSurpriseRemaining) {
        state.freeSurpriseRemaining = data.freeSurpriseRemaining;
        localStorage.setItem('wemeal_free_surprises', state.freeSurpriseRemaining);
    }

    // 7. Sync Profile
    if (data.profile && typeof data.profile === 'object') {
        const currentLocalProfile = JSON.parse(localStorage.getItem('wemeal_profile') || 'null');
        const cloudProfile = data.profile;

        const cloudName = typeof cloudProfile.name === 'string' ? cloudProfile.name.trim() : '';
        const safeName = cloudName || currentLocalProfile?.name || 'Gourmet';

        const cloudAvatar = typeof cloudProfile.avatar === 'string' ? cloudProfile.avatar.trim() : '';
        const cloudAvatarEmoji = typeof cloudProfile.avatarEmoji === 'string' ? cloudProfile.avatarEmoji.trim() : '';

        let safeAvatar = null;
        let safeAvatarEmoji = '👤';

        if (cloudAvatar) {
            if (isLikelyImageSource(cloudAvatar)) {
                safeAvatar = cloudAvatar;
            } else {
                safeAvatarEmoji = cloudAvatar;
            }
        } else if (cloudAvatarEmoji) {
            safeAvatarEmoji = cloudAvatarEmoji;
        } else if (currentLocalProfile?.avatarEmoji) {
            safeAvatarEmoji = currentLocalProfile.avatarEmoji;
        }

        const profile = {
            ...cloudProfile,
            name: safeName,
            avatar: safeAvatar,
            avatarEmoji: safeAvatarEmoji,
            sessionVersion: data.sessionVersion || 0
        };

        if (JSON.stringify(profile) !== JSON.stringify(currentLocalProfile)) {
            localStorage.setItem('wemeal_profile', JSON.stringify(profile));
            state.userProfile = profile;
        }
    }

    // Refresh UI visually
    if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
    if (typeof updateProfileModeBadges === 'function') updateProfileModeBadges();
    if (typeof updateFreeLimitsUI === 'function') updateFreeLimitsUI();
    if (typeof renderShoppingList === 'function') renderShoppingList();
    if (typeof updateStats === 'function') updateStats();
    if (typeof requestLocation === 'function') requestLocation();
    if (typeof initializeHome === 'function') initializeHome();
    if (typeof renderFavorites === 'function') renderFavorites(document.getElementById('show-my-versions-btn')?.classList.contains('active'));

    // Refresh toggle checkboxes and info cards to match synced state
    if (typeof state !== 'undefined') {
        const setToggle = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
        setToggle('diabetic-toggle', state.isDiabeticMode);
        setToggle('endo-toggle', state.isEndoMode);
        setToggle('vegetarian-toggle', state.isVegetarianMode);
        setToggle('vegan-toggle', state.isVeganMode);
        setToggle('gluten-free-toggle', state.isGlutenFreeMode);

        // Refresh info card visibility
        const showHide = (id, show) => { const el = document.getElementById(id); if (el) { if (show) el.classList.remove('hidden'); else el.classList.add('hidden'); } };
        showHide('diabetic-info', state.isDiabeticMode);
        showHide('endo-info', state.isEndoMode);
        showHide('vegetarian-info', state.isVegetarianMode);
        showHide('vegan-info', state.isVeganMode);
        showHide('gluten-free-info', state.isGlutenFreeMode);

        // Refresh sugar tracker for diabetic mode
        if (typeof updateSugarTracker === 'function') updateSugarTracker();
    }

    // Always trigger a UI refresh after cloud data is applied
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderAchievements === 'function') renderAchievements();
}

// Push local data to Firetore
async function syncLocalDataToCloud(uid) {
    try {
        if (typeof window.state === 'undefined') return;
        const state = window.state;

        if (!window.isCloudDataLoaded) {
            console.warn("⚠️ syncLocalDataToCloud: Blocked. Data not fully loaded from cloud yet.");
            return;
        }

        const docRef = doc(db, "users", uid);

        let updates = {};

        // If local prefs have been interacted with, sync them. 
        // For simplicity, we just sync everything now as source of truth.
        updates["preferences.diabetic"] = state.isDiabeticMode;
        updates["preferences.endo"] = state.isEndoMode;
        updates["preferences.vegetarian"] = state.isVegetarianMode;
        updates["preferences.vegan"] = state.isVeganMode;
        updates["preferences.glutenFree"] = state.isGlutenFreeMode;

        // Gamification Sync
        const storedUnlocked = JSON.parse(localStorage.getItem('wemeal_unlocked_achievements') || '[]');
        if (storedUnlocked.length > 0) {
            updates.wemeal_unlocked_achievements = storedUnlocked;
        }
        const storedMilestone = parseInt(localStorage.getItem('wemeal_milestone_tier') || '0');
        if (storedMilestone > 0) {
            updates.wemeal_milestone_tier = storedMilestone;
        }

        // Always sync arrays, including empty arrays, so clear actions persist.
        if (Array.isArray(state.favorites)) {
            updates.favorites = state.favorites;
        }

        if (Array.isArray(state.history)) {
            updates.history = state.history;
        }

        // Always sync shopping list, including empty arrays, so "clear cart"
        // operations are persisted to Firestore and don't reappear on refresh.
        if (Array.isArray(state.shoppingList)) {
            updates.shoppingList = state.shoppingList;
        }

        if (Array.isArray(state.customRecipes)) {
            updates.customRecipes = state.customRecipes;
        }

        if (state.userProfile) {
            const profile = { ...state.userProfile };
            const safeName = typeof profile.name === 'string' ? profile.name.trim() : '';
            profile.name = safeName || 'Gourmet';

            if (typeof profile.avatar === 'string') {
                profile.avatar = profile.avatar.trim();
            }
            if (!profile.avatar) {
                const emoji = typeof profile.avatarEmoji === 'string' ? profile.avatarEmoji.trim() : '';
                profile.avatar = emoji || '👤';
            }

            updates.profile = profile;
        }

        // Sync Premium State (e.g., Surprise Me deductions)
        if (state.freeSurpriseRemaining !== undefined) {
            updates.freeSurpriseRemaining = state.freeSurpriseRemaining;
        }

        // New: Sync Achievements to Cloud
        const localAch = JSON.parse(localStorage.getItem('wemeal_unlocked_achievements') || '[]');
        if (localAch.length > 0) {
            updates.wemeal_unlocked_achievements = localAch;
        }
        const localTier = parseInt(localStorage.getItem('wemeal_milestone_tier') || '0');
        if (localTier > 0) {
            updates.wemeal_milestone_tier = localTier;
        }

        if (Object.keys(updates).length > 0) {
            // setDoc + merge avoids failures when the user doc doesn't exist yet.
            await setDoc(docRef, updates, { merge: true });
            console.log("☁️ Local data synced to cloud.");
        }
    } catch (e) {
        console.error("Error syncing to cloud:", e);
    }
}

// ============================================
// PROMO & BENEFIT CODE VERIFICATION
// ============================================
window.addEventListener('validate-promo-code', async (e) => {
    const { code, responseElement } = e.detail;
    if (!code) return;

    try {
        // 1. Try Stripe Promo first (UI only, doesn't apply yet)
        const promoRef = doc(db, "promo_codes", code);
        const docSnap = await getDoc(promoRef);

        if (docSnap.exists() && docSnap.data().isActive) {
            const data = docSnap.data();

            // Check usage limits (read-only check)
            if (data.maxUses && data.maxUses > 0) {
                const used = data.totalUses || 0;
                if (used >= data.maxUses) {
                    responseElement.textContent = "Ce code promo a atteint sa limite d'utilisation.";
                    responseElement.style.color = 'var(--danger)';
                    return;
                }
            }

            responseElement.textContent = "Code promo appliqué !";
            responseElement.style.color = 'var(--success)';

            window.appliedPromoCode = code;
            window.appliedStripePromoId = data.stripePromoId || null;

            window.dispatchEvent(new CustomEvent('promo-code-applied', {
                detail: { discount: data.discount || 0, stripePromoId: data.stripePromoId || null }
            }));
            return;
        }

        // 2. Try Benefit Code (Applies immediately via Cloud Function)
        responseElement.textContent = "Vérification des avantages...";
        const applyBenefitCode = httpsCallable(functions, 'applyBenefitCode');
        const result = await applyBenefitCode({ code });

        if (result.data && result.data.success) {
            responseElement.textContent = result.data.message;
            responseElement.style.color = 'var(--success)';

            // Trigger success animation if in paywall
            const successAnim = document.getElementById('paywall-success-animation');
            const mainContent = document.getElementById('paywall-content');
            if (successAnim && mainContent) {
                mainContent.style.display = 'none';
                successAnim.classList.remove('hidden');
                // Refresh data
                if (window.firebaseUser) loadUserData(window.firebaseUser.uid);
            }
        }
    } catch (error) {
        console.error("Benefit/Promo validation error", error);

        // Handle specific Firebase HttpsErrors
        console.error("Benefit Error Code:", error.code);
        console.error("Benefit Error Message:", error.message);

        let errorMsg = "Code invalide ou expiré.";
        if (error.code === 'functions/not-found' || error.code === 'not-found') errorMsg = "Code inconnu.";
        if (error.code === 'functions/already-exists' || error.code === 'already-exists') errorMsg = "Code déjà utilisé.";
        if (error.code === 'functions/failed-precondition' || error.code === 'failed-precondition') errorMsg = "Veuillez vous connecter.";

        // Show server message if it's a known error
        if (error.message && error.message.length < 50) errorMsg = error.message;

        responseElement.textContent = errorMsg;
        responseElement.style.color = 'var(--danger)';
        window.appliedPromoCode = null;
        window.appliedStripePromoId = null;
        window.dispatchEvent(new CustomEvent('promo-code-applied', {
            detail: { discount: 0 }
        }));
    }
});


function translateFirebaseError(code) {
    switch (code) {
        case 'auth/invalid-email':
        case 'auth/invalid-credential':
            return 'Email ou mot de passe incorrect.';
        case 'auth/email-already-in-use':
            return 'Cette adresse email est déjà utilisée.';
        case 'auth/weak-password':
            return 'Le mot de passe doit faire au moins 6 caractères.';
        default:
            return 'Une erreur est survenue, veuillez réessayer.';
    }
}


// ============================================
// Load Recipes from Firestore (Legacy override)
// ============================================
export async function loadRecipesFromFirebase() {
    try {
        const recipesRef = collection(db, 'recipes');
        const snapshot = await getDocs(recipesRef);

        if (snapshot.empty) return null;

        const recipes = [];
        snapshot.forEach(doc => recipes.push({ id: doc.id, ...doc.data() }));

        return recipes;
    } catch (error) {
        console.warn('⚠️ Failed to load recipes from Firestore:', error.message);
        return null;
    }
}

// Auto-Execute
(async () => {
    console.log("🔥 Firebase Recipes Loader Auto-Starting...");
    const recipes = await loadRecipesFromFirebase();
    if (recipes && recipes.length > 0) {
        window.recipesDatabase = recipes;
        window.recipes = recipes;
        console.log(`🔥 Override Static DB with ${recipes.length} Cloud recipes.`);
        window.dispatchEvent(new CustomEvent('recipes-updated', {
            detail: { count: recipes.length }
        }));
    }
})();

// ============================================
// STRIPE CHECKOUT INTEGRATION (Cloud Functions)
// ============================================

window.addEventListener('init-stripe-checkout', async (e) => {
    const { plan, promo } = e.detail;
    try {
        const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
        const result = await createCheckoutSession({
            plan: plan,
            origin: window.location.origin,
            stripePromoId: (promo && window.appliedStripePromoId) ? window.appliedStripePromoId : null,
            discount: promo ? (window.currentDiscountPercent || 0) : 0
        });

        if (result.data && result.data.url) {
            window.location.href = result.data.url;
        } else {
            console.error("No URL returned from createCheckoutSession");
            if (typeof showToast === 'function') showToast("Erreur lors de la création de la session Stripe.");
        }
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        if (typeof showToast === 'function') showToast("Service de paiement temporairement indisponible.");
    }
});

window.addEventListener('init-gift-checkout', async (e) => {
    const { plan, promo } = e.detail;
    try {
        const createGiftSession = httpsCallable(functions, 'createGiftCheckoutSession');
        const result = await createGiftSession({
            plan: plan,
            origin: window.location.origin,
            stripePromoId: (promo && window.appliedStripePromoId) ? window.appliedStripePromoId : null,
            discount: promo ? (window.currentDiscountPercent || 0) : 0
        });

        if (result.data && result.data.url) {
            window.location.href = result.data.url;
        } else {
            console.error("No URL returned from createGiftCheckoutSession");
            if (typeof showToast === 'function') showToast("Erreur lors de la création de la session Cadeau.");
        }
    } catch (error) {
        console.error("Gift Checkout Error:", error);
        if (typeof showToast === 'function') showToast("Service de cadeau temporairement indisponible.");
    }
});

window.addEventListener('fetch-latest-gift-code', async () => {
    try {
        const getLatestGiftCode = httpsCallable(functions, 'getLatestGiftCode');
        const result = await getLatestGiftCode();
        if (result.data && result.data.code) {
            const codeEl = document.getElementById('gift-card-code');
            if (codeEl) codeEl.textContent = result.data.code;
        } else {
            console.warn("No recent gift code found.");
            const codeEl = document.getElementById('gift-card-code');
            if (codeEl) codeEl.textContent = "Non trouvé";
        }
    } catch (error) {
        console.error("Error fetching latest gift code:", error);
        const codeEl = document.getElementById('gift-card-code');
        if (codeEl) codeEl.textContent = "Erreur";
    }
});
