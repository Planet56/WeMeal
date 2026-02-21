// ============================================
// WeMeal - Firebase Integration Sync
// ============================================

import { app, auth, db } from './firebase-config.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-functions.js";

// Expose Firebase Functions helpers used by script.js checkout flow.
const functions = getFunctions(app, "us-central1");
window.firebaseFunctions = {
    httpsCallable: (name) => httpsCallable(functions, name)
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
        await syncLocalDataToCloud(user.uid);

        // Remote Logout Listener
        const { onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
        if (window.userDocListener) window.userDocListener(); // Clear old
        window.userDocListener = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            const localProfileRaw = localStorage.getItem('wemeal_profile');
            if (!localProfileRaw) {
                console.log("ℹ️ No local profile yet, skipping session check");
                return;
            }

            const localProfile = JSON.parse(localProfileRaw);
            const localSessionVersion = localProfile.sessionVersion || 0;
            const cloudData = docSnap.data();
            const cloudSessionVersion = cloudData ? (cloudData.sessionVersion || 0) : 0;

            console.log(`🔍 Session Check: Local=${localSessionVersion}, Cloud=${cloudSessionVersion}`);

            // Only force logout if cloud version is strictly newer.
            if (localSessionVersion > 0 && cloudSessionVersion > localSessionVersion) {
                console.log("🚨 REMOTE LOGOUT TRIGGERED: Cloud version is newer than local.");
                window.dispatchEvent(new CustomEvent('auth-logout-request'));
            }
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
            const data = docSnap.data();

            // 1. Sync Preferences
            if (data.preferences) {
                localStorage.setItem('wemeal_diabetic', JSON.stringify(data.preferences.diabetic || false));
                localStorage.setItem('wemeal_endo', JSON.stringify(data.preferences.endo || false));
                localStorage.setItem('wemeal_vegetarian', JSON.stringify(data.preferences.vegetarian || false));
                localStorage.setItem('wemeal_vegan', JSON.stringify(data.preferences.vegan || false));

                // Update global state if script.js is loaded
                if (typeof state !== 'undefined') {
                    state.isDiabeticMode = data.preferences.diabetic || false;
                    state.isEndoMode = data.preferences.endo || false;
                    state.isVegetarianMode = data.preferences.vegetarian || false;
                    state.isVeganMode = data.preferences.vegan || false;
                }
            }

            // 2. Sync Favorites (including empty arrays, to avoid stale local data)
            if (data.favorites !== undefined) {
                const favorites = Array.isArray(data.favorites) ? data.favorites : [];
                localStorage.setItem('wemeal_favorites', JSON.stringify(favorites));
                if (typeof state !== 'undefined') state.favorites = favorites;
            }

            // 3. Sync History (including empty arrays, to avoid stale local data)
            if (data.history !== undefined) {
                const history = Array.isArray(data.history) ? data.history : [];
                localStorage.setItem('wemeal_history', JSON.stringify(history));
                if (typeof state !== 'undefined') state.history = history;
            }

            // 4. Sync Shopping List — always overwrite from Firestore (even empty) to avoid stale data from previous accounts
            if (data.shoppingList !== undefined) {
                const list = Array.isArray(data.shoppingList) ? data.shoppingList : [];
                localStorage.setItem('wemeal_shopping_list', JSON.stringify(list));
                if (typeof state !== 'undefined') state.shoppingList = list;
            }

            // 5. Sync Profile
            if (data.profile && typeof data.profile === 'object') {
                const currentLocalProfile = JSON.parse(localStorage.getItem('wemeal_profile') || 'null');
                const cloudProfile = data.profile;

                const cloudName = typeof cloudProfile.name === 'string' ? cloudProfile.name.trim() : '';
                const localName = typeof currentLocalProfile?.name === 'string' ? currentLocalProfile.name.trim() : '';
                const safeName = cloudName || localName || 'Gourmet';

                const cloudAvatar = typeof cloudProfile.avatar === 'string' ? cloudProfile.avatar.trim() : '';
                const cloudAvatarEmoji = typeof cloudProfile.avatarEmoji === 'string' ? cloudProfile.avatarEmoji.trim() : '';
                const localAvatarEmoji = typeof currentLocalProfile?.avatarEmoji === 'string' ? currentLocalProfile.avatarEmoji.trim() : '';

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
                } else if (localAvatarEmoji) {
                    safeAvatarEmoji = localAvatarEmoji;
                }

                const profile = {
                    ...cloudProfile,
                    name: safeName,
                    avatar: safeAvatar,
                    avatarEmoji: safeAvatarEmoji,
                    sessionVersion: data.sessionVersion || 0
                };
                localStorage.setItem('wemeal_profile', JSON.stringify(profile));
                if (typeof state !== 'undefined') state.userProfile = profile;
            }

            // 6. Sync Premium State
            if (typeof state !== 'undefined') {
                state.isPremium = data.isPremium || false;
                localStorage.setItem('wemeal_is_premium', JSON.stringify(state.isPremium));

                if (data.premiumUntil) {
                    // Convert Firestore Timestamp to ms
                    state.premiumUntil = data.premiumUntil.seconds ? data.premiumUntil.seconds * 1000 : data.premiumUntil;
                    localStorage.setItem('wemeal_premium_until', state.premiumUntil);
                } else {
                    state.premiumUntil = null;
                    localStorage.removeItem('wemeal_premium_until');
                }

                if (data.freeSurpriseRemaining !== undefined) {
                    state.freeSurpriseRemaining = data.freeSurpriseRemaining;
                    localStorage.setItem('wemeal_free_surprises', state.freeSurpriseRemaining);
                }
            }

            // Refresh UI visually
            if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
            if (typeof updateProfileModeBadges === 'function') updateProfileModeBadges();
            if (typeof updateFreeLimitsUI === 'function') updateFreeLimitsUI();
            if (typeof renderShoppingList === 'function') renderShoppingList();
            if (typeof updateStats === 'function') updateStats();
            if (typeof initializeHome === 'function') initializeHome();
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// Push local data to Firetore
async function syncLocalDataToCloud(uid) {
    try {
        if (typeof state === 'undefined') return;

        const docRef = doc(db, "users", uid);

        let updates = {};

        // If local prefs have been interacted with, sync them. 
        // For simplicity, we just sync everything now as source of truth.
        updates["preferences.diabetic"] = state.isDiabeticMode;
        updates["preferences.endo"] = state.isEndoMode;
        updates["preferences.vegetarian"] = state.isVegetarianMode;
        updates["preferences.vegan"] = state.isVeganMode;

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
            responseElement.textContent = "Code promo Stripe détecté !";
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
