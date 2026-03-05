const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const STRIPE_SEC = process.env.STRIPE_SECRET_KEY || "sk_test_SECRET_KEY";
const stripe = require("stripe")(STRIPE_SEC, {
  apiVersion: "2023-10-16",
});

admin.initializeApp();

/**
 * Returns a safe HTTP(S) origin or null.
 * @param {unknown} value
 * @return {string|null}
 */
function normalizeOrigin(value) {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch (err) {
    return null;
  }
}

exports.stripeWebhook = onRequest({ cors: true }, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endSec = process.env.STRIPE_WEBHOOK_SECRET || "whsec_SECRET";

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endSec);
  } catch (err) {
    logger.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const uid = session.client_reference_id;

      if (session.metadata && session.metadata.isGift === 'true') {
        const uid = session.client_reference_id;
        const plan = session.metadata.plan || 'yearly';

        try {
          // Generate a unique MEALxxxxx code
          const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
          const giftCode = `MEAL${randomStr}`;

          await admin.firestore().collection("gift_codes").doc(giftCode).set({
            code: giftCode,
            plan: plan,
            status: 'unused',
            buyerId: uid || 'anonymous',
            stripeCheckoutSessionId: session.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Save stripeCustomerId for the buyer if they don't have one
          // This ensures that even free users who only buy gifts have their Stripe customer ID recorded
          if (uid && session.customer) {
            await admin.firestore().collection("users").doc(uid).set({
              stripeCustomerId: session.customer
            }, { merge: true });
          }

          logger.info(`Generated gift code ${giftCode} for user ${uid}`);
        } catch (error) {
          logger.error(`Error generating gift code for session ${session.id}:`, error);
        }
      } else if (uid) {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription,
          );
          await admin.firestore().collection("users").doc(uid).set({
            isPremium: true,
            premiumSince: admin.firestore.FieldValue.serverTimestamp(),
            premiumUntil: admin.firestore.Timestamp.fromMillis(
              subscription.current_period_end * 1000,
            ),
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          }, { merge: true });

          logger.info(`Upgraded user ${uid} to Premium!`);
        } catch (error) {
          logger.error(`Error updating user ${uid}:`, error);
        }
      } else {
        logger.warn("Received checkout.session.completed but missing uid and not a gift.");
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customers = await admin.firestore().collection("users")
        .where("stripeCustomerId", "==", subscription.customer)
        .limit(1)
        .get();

      if (!customers.empty) {
        const uid = customers.docs[0].id;
        const status = subscription.status;
        const isPremium = status === "active" || status === "trialing";

        await admin.firestore().collection("users").doc(uid).set({
          isPremium: isPremium,
          premiumUntil: admin.firestore.Timestamp.fromMillis(
            subscription.current_period_end * 1000,
          ),
        }, { merge: true });

        logger.info(`Updated user ${uid} premium status to ${isPremium}`);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customers = await admin.firestore().collection("users")
        .where("stripeCustomerId", "==", subscription.customer)
        .limit(1)
        .get();

      if (!customers.empty) {
        const uid = customers.docs[0].id;
        await admin.firestore().collection("users").doc(uid).set({
          isPremium: false,
          premiumUntil: null,
        }, { merge: true });

        logger.info(`Removed premium from user ${uid} (subscription deleted)`);
      }
      break;
    }
    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.send();
});

exports.createCheckoutSession = onCall({ cors: true }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Must be logged in.");
  }

  const {
    plan,
    origin: requestedOrigin,
    stripePromoId,
  } = request.data || {};
  const uid = request.auth.uid;

  const PRICES = {
    yearly: process.env.STRIPE_PRICE_YEARLY ||
      "price_1T2wQ8AeBKY5olKpuoFfY7uZ",
    monthly: process.env.STRIPE_PRICE_MONTHLY ||
      "price_1T2wPeAeBKY5olKpBxhAy96t",
  };

  const priceId = PRICES[plan] || PRICES.yearly;
  let successUrl = "";
  let cancelUrl = "";

  const returnScheme = request.data?.returnScheme;
  if (returnScheme === "wemeal") {
    // Mobile deep-links
    successUrl = "wemeal://checkout/success";
    cancelUrl = "wemeal://checkout/cancelled";
  } else {
    // Web URLs
    const origin = normalizeOrigin(requestedOrigin) ||
      normalizeOrigin(process.env.APP_URL) ||
      "https://wemeal-61b0c.web.app";
    successUrl = `${origin}?checkout=success`;
    cancelUrl = `${origin}?checkout=cancelled`;
  }

  try {
    const checkoutPayload = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: uid,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    };

    if (
      typeof stripePromoId === "string" &&
      stripePromoId.startsWith("promo_")
    ) {
      checkoutPayload.discounts = [{ promotion_code: stripePromoId }];
      delete checkoutPayload.allow_promotion_codes;

      // Track usage in Firestore (find promo by stripePromoId)
      try {
        const promosSnap = await admin.firestore().collection("promo_codes")
          .where("stripePromoId", "==", stripePromoId).limit(1).get();
        if (!promosSnap.empty) {
          const promoDoc = promosSnap.docs[0];
          const promoData = promoDoc.data();
          const newTotal = (promoData.totalUses || 0) + 1;
          const updates = {
            totalUses: admin.firestore.FieldValue.increment(1),
          };
          if (promoData.maxUses && promoData.maxUses > 0 &&
            newTotal >= promoData.maxUses) {
            updates.isActive = false;
          }
          await promoDoc.ref.update(updates);
        }
      } catch (trackErr) {
        logger.warn("Failed to track promo usage:", trackErr);
      }
    }

    const session = await stripe.checkout.sessions.create(checkoutPayload);
    return { url: session.url };
  } catch (err) {
    logger.error("Checkout session error:", err);
    throw new HttpsError("internal", err.message);
  }
});

exports.createGiftCheckoutSession = onCall({ cors: true }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Must be logged in.");
  }

  const {
    plan,
    origin: requestedOrigin,
    stripePromoId,
  } = request.data || {};
  const uid = request.auth.uid;

  // Uses the same price variables but converts to price_data for one-time payment
  // Note: if you use an existing recurring price ID with mode='payment', Stripe will throw an error
  // So we fetch the price details to create an ad-hoc price_data, or use the price ID directly if it's already a one-time price.
  // Since they are recurring prices, we MUST pass `price_data`. We'll just hardcode standard amounts or fetch them.
  const AMOUNTS = {
    yearly: 3999, // 39.99 EUR
    monthly: 499, // 4.99 EUR
  };

  const amount = AMOUNTS[plan] || AMOUNTS.yearly;
  const periodLabel = plan === 'monthly' ? '1 Mois' : '1 An';

  let successUrl = "";
  let cancelUrl = "";

  const returnScheme = request.data?.returnScheme;
  if (returnScheme === "wemeal") {
    // Mobile deep-links
    successUrl = "wemeal://checkout/gift_success";
    cancelUrl = "wemeal://checkout/cancelled";
  } else {
    // Web URLs
    const origin = normalizeOrigin(requestedOrigin) ||
      normalizeOrigin(process.env.APP_URL) ||
      "https://wemeal-61b0c.web.app";
    successUrl = `${origin}?checkout=gift_success`;
    cancelUrl = `${origin}?checkout=cancelled`;
  }


  try {
    const checkoutPayload = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Carte Cadeau WeMeal+ (${periodLabel})`,
            description: "Un code cadeau exclusif généré après paiement.",
          },
          unit_amount: amount,
        },
        quantity: 1
      }],
      client_reference_id: uid,
      metadata: {
        isGift: 'true',
        plan: plan || 'yearly'
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      invoice_creation: { enabled: true }
    };

    // Attempt to use existing Stripe Customer ID if the user has one
    try {
      const userDoc = await admin.firestore().collection("users").doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.stripeCustomerId) {
          checkoutPayload.customer = userData.stripeCustomerId;
        }
      }
    } catch (err) {
      logger.warn(`Could not fetch user ${uid} to attach Stripe Customer ID`, err);
    }

    if (
      typeof stripePromoId === "string" &&
      stripePromoId.startsWith("promo_")
    ) {
      checkoutPayload.discounts = [{ promotion_code: stripePromoId }];
      delete checkoutPayload.allow_promotion_codes;
    }

    const session = await stripe.checkout.sessions.create(checkoutPayload);
    return { url: session.url };
  } catch (err) {
    logger.error("Gift Checkout session error:", err);
    throw new HttpsError("internal", err.message);
  }
});

/**
 * Verifies that the current request is from an authenticated admin user.
 * @param {object} request - The callable function request object
 * @throws {HttpsError} If the user is unauthenticated or not an admin
 */
async function verifyAdmin(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Must be logged in.");
  }
  const userSnap = await admin.firestore()
    .collection("users").doc(request.auth.uid).get();
  if (!userSnap.exists || userSnap.data().isAdmin !== true) {
    throw new HttpsError("permission-denied", "Must be an admin.");
  }
}

exports.createStripePromo = onCall({ cors: true }, async (request) => {
  await verifyAdmin(request);
  const { code, discount, isActive, maxRedemptions } = request.data;

  try {
    // 1. Check if promotion code already exists on Stripe
    const existingPromos = await stripe.promotionCodes.list({
      code: code,
      active: true,
      limit: 1,
    });

    if (existingPromos.data.length > 0) {
      const existing = existingPromos.data[0];
      logger.info(`Using existing promotion code ${existing.id} for ${code}`);
      return { success: true, promoId: existing.id, alreadyExisted: true };
    }

    // 2. Create Coupon
    const coupon = await stripe.coupons.create({
      percent_off: discount,
      duration: "forever",
    });

    logger.info(`Created coupon ${coupon.id} for promo ${code}`);

    // 3. Create Promotion Code
    const promoData = {
      coupon: coupon.id,
      code: code,
      active: isActive === undefined ? true : isActive,
    };
    if (maxRedemptions && maxRedemptions > 0) {
      promoData.max_redemptions = parseInt(maxRedemptions);
    }
    const promo = await stripe.promotionCodes.create(promoData);

    return { success: true, promoId: promo.id };
  } catch (err) {
    logger.error("Stripe Promo Error:", err);
    throw new HttpsError("internal", err.message);
  }
});

exports.getStripeStats = onCall({ cors: true }, async (request) => {
  await verifyAdmin(request);
  try {
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    let totalMRRCents = 0;
    subscriptions.data.forEach((sub) => {
      if (sub.plan && sub.plan.amount) {
        if (sub.plan.interval === "year") {
          totalMRRCents += sub.plan.amount / 12;
        } else {
          totalMRRCents += sub.plan.amount;
        }
      }
    });

    return {
      activeSubscriptions: subscriptions.data.length,
      monthlyRecurringRevenueEur: Math.round(totalMRRCents / 100),
    };
  } catch (err) {
    throw new HttpsError("internal", err.message);
  }
});

exports.getUserInvoiceUrl = onCall({ cors: true }, async (request) => {
  await verifyAdmin(request);
  const { stripeCustomerId } = request.data;
  if (!stripeCustomerId) {
    throw new HttpsError("invalid-argument", "Missing Stripe Customer ID.");
  }
  try {
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 1,
    });
    if (invoices.data.length > 0 && invoices.data[0].hosted_invoice_url) {
      return { url: invoices.data[0].hosted_invoice_url };
    }
    return { url: null };
  } catch (err) {
    throw new HttpsError("internal", err.message);
  }
});

exports.deleteUser = onCall({ cors: true }, async (request) => {
  await verifyAdmin(request);
  const { uid } = request.data;
  if (!uid) {
    throw new HttpsError("invalid-argument", "Missing User ID.");
  }

  try {
    await admin.auth().deleteUser(uid);
    logger.info(`Admin deleted user account: ${uid}`);
    return { success: true };
  } catch (err) {
    logger.error("Error deleting user:", err);
    throw new HttpsError("internal", err.message);
  }
});

/**
 * Applies a benefit code (non-Stripe) to a user
 */
exports.applyBenefitCode = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Auth required");
  }

  const { code } = request.data;
  const uid = request.auth.uid;

  if (!code) {
    throw new HttpsError("invalid-argument", "Code required");
  }

  const db = admin.firestore();
  const normalizedCode = code.trim().toUpperCase();
  console.log(`Checking benefit code: "${normalizedCode}"`);

  let message = "";

  await db.runTransaction(async (transaction) => {
    // 1. Check if it's a gift code first
    if (normalizedCode.startsWith('MEAL')) {
      const giftRef = db.collection("gift_codes").doc(normalizedCode);
      const giftSnap = await transaction.get(giftRef);

      if (giftSnap.exists) {
        const gift = giftSnap.data();
        if (gift.status === 'used') {
          throw new HttpsError("failed-precondition", "Ce code cadeau a déjà été utilisé.");
        }

        const userRef = db.collection("users").doc(uid);
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();

        const now = Date.now();
        let currentUntilMs = now;
        if (userData && userData.premiumUntil) {
          if (typeof userData.premiumUntil.toMillis === 'function') {
            currentUntilMs = userData.premiumUntil.toMillis();
          } else if (typeof userData.premiumUntil === 'number') {
            currentUntilMs = userData.premiumUntil;
          }
        }

        // Fetch buyer info
        let buyerName = "un ami";
        if (gift.buyerId && gift.buyerId !== 'anonymous') {
          const buyerRef = db.collection("users").doc(gift.buyerId);
          const buyerDoc = await transaction.get(buyerRef);
          if (buyerDoc.exists) {
            const buyerData = buyerDoc.data();
            buyerName = buyerData.pseudo || buyerData.displayName || buyerData.firstName || "un ami";
          }
        }

        const durationMs = gift.plan === 'monthly' ? (30 * 24 * 60 * 60 * 1000) : (365 * 24 * 60 * 60 * 1000);

        const updates = {
          isPremium: true,
          premiumUntil: Math.max(currentUntilMs, now) + durationMs
        };

        transaction.update(userRef, updates);
        transaction.update(giftRef, {
          status: 'used',
          usedBy: uid,
          usedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        message = `Carte Cadeau activée ! ${gift.plan === 'monthly' ? '1 mois' : '1 an'} de WeMeal+ offert par ${buyerName}.`;
        return; // Exit transaction early for gift codes
      }
      // If starts with MEAL but not found, fall through to regular benefit code
    }

    const benefitRef = db.collection("benefit_codes").doc(normalizedCode);
    const benefitSnap = await transaction.get(benefitRef);

    if (!benefitSnap.exists) {
      console.warn(`Code "${normalizedCode}" not found in Firestore.`);
      throw new HttpsError("not-found", "Code inconnu");
    }

    const benefit = benefitSnap.data();
    console.log(`Found benefit code:`, benefit);

    if (!benefit.isActive) {
      console.warn(`Benefit code "${normalizedCode}" is inactive.`);
      throw new HttpsError("failed-precondition", "Ce code n'est plus actif");
    }

    if (benefit.maxUses && benefit.maxUses > 0) {
      const totalUses = benefit.totalUses || 0;
      if (totalUses >= benefit.maxUses) {
        throw new HttpsError("failed-precondition", "Ce code a atteint sa limite d'utilisation");
      }
    }

    const userRef = db.collection("users").doc(uid);
    const userDoc = await transaction.get(userRef);
    const userData = userDoc.data();
    const updates = {};

    // Calculate safe current balance
    const now = Date.now();
    let currentUntilMs = now;
    if (userData && userData.premiumUntil) {
      if (typeof userData.premiumUntil.toMillis === 'function') {
        currentUntilMs = userData.premiumUntil.toMillis();
      } else if (typeof userData.premiumUntil === 'number') {
        currentUntilMs = userData.premiumUntil;
      }
    }

    switch (benefit.type) {
      case "1_year": {
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        updates.premiumUntil = Math.max(currentUntilMs, now) + oneYear;
        updates.isPremium = true;
        message = "1 an de WeMeal+ ajouté !";
        break;
      }
      case "1_month_premium": {
        const oneMonth = 30 * 24 * 60 * 60 * 1000;
        updates.premiumUntil = Math.max(currentUntilMs, now) + oneMonth;
        updates.isPremium = true;
        message = "1 mois de WeMeal+ ajouté (Récompense) !";
        break;
      }
      case "1_week_premium": {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        updates.premiumUntil = Math.max(currentUntilMs, now) + oneWeek;
        updates.isPremium = true;
        message = "1 semaine de WeMeal+ ajoutée (Récompense) !";
        break;
      }
      case "lifetime": {
        // Far future date: 31 Dec 9999
        updates.premiumUntil = 253402300799000;
        updates.isPremium = true;
        message = "Accès WeMeal+ à vie débloqué ! ∞";
        break;
      }
      case "debug": {
        updates.hasDebugAccess = true;
        message = "Mode Debug activé ! 🔧";
        break;
      }
      default:
        throw new HttpsError("internal", "Type d'avantage inconnu");
    }

    const usageRef = benefitRef.collection("usages").doc();
    const newTotal = (benefit.totalUses || 0) + 1;
    const benUpdates = { totalUses: newTotal };
    if (benefit.maxUses && benefit.maxUses > 0 && newTotal >= benefit.maxUses) {
      benUpdates.isActive = false;
    }

    transaction.update(userRef, updates);
    transaction.set(usageRef, {
      uid: uid,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
      benefitType: benefit.type,
    });
    transaction.update(benefitRef, benUpdates);
  });

  return { success: true, message };
});

exports.getUserRecentPurchases = onCall({ cors: true }, async (request) => {
  await verifyAdmin(request);
  const { stripeCustomerId } = request.data;
  if (!stripeCustomerId) {
    return { purchases: [] };
  }
  try {
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 5,
    });
    const purchases = invoices.data.map((inv) => ({
      id: inv.id,
      amount: inv.amount_paid,
      status: inv.status,
      date: inv.created,
      url: inv.hosted_invoice_url,
    }));
    return { purchases };
  } catch (err) {
    logger.error("Error fetching purchases:", err);
    throw new HttpsError("internal", err.message);
  }
});

exports.getLatestGiftCode = onCall(async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Must be logged in.");
  }
  const uid = request.auth.uid;

  try {
    const snap = await admin.firestore().collection("gift_codes")
      .where("buyerId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snap.empty) {
      return { code: null };
    }
    return { code: snap.docs[0].data().code };
  } catch (err) {
    logger.error("Error fetching gift code:", err);
    throw new HttpsError("internal", err.message);
  }
});
