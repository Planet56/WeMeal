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

      if (uid) {
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
        logger.warn("Received checkout.session.completed but missing uid.");
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
  const origin = normalizeOrigin(requestedOrigin) ||
    normalizeOrigin(process.env.APP_URL) ||
    "https://wemeal-61b0c.web.app";

  try {
    const checkoutPayload = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: uid,
      success_url: `${origin}?checkout=success`,
      cancel_url: `${origin}?checkout=cancelled`,
      allow_promotion_codes: true,
    };

    if (
      typeof stripePromoId === "string" &&
      stripePromoId.startsWith("promo_")
    ) {
      checkoutPayload.discounts = [{ promotion_code: stripePromoId }];
    }

    const session = await stripe.checkout.sessions.create(checkoutPayload);
    return { url: session.url };
  } catch (err) {
    logger.error("Checkout session error:", err);
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
  const { code, discount, isActive } = request.data;

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
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: code,
      active: isActive === undefined ? true : isActive,
    });

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
  const benefitRef = db.collection("benefit_codes").doc(normalizedCode);
  const benefitSnap = await benefitRef.get();

  if (!benefitSnap.exists) {
    console.warn(`Benefit code "${normalizedCode}" not found in Firestore.`);
    throw new HttpsError("not-found", "Code inconnu");
  }

  const benefit = benefitSnap.data();
  console.log(`Found benefit code:`, benefit);

  if (!benefit.isActive) {
    console.warn(`Benefit code "${normalizedCode}" is inactive.`);
    throw new HttpsError("failed-precondition", "Ce code n'est plus actif");
  }
  const userRef = db.collection("users").doc(uid);

  const updates = {};
  let message = "";

  switch (benefit.type) {
    case "1_year": {
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const currentUntil = (userData && userData.premiumUntil) || Date.now();
      updates.premiumUntil = Math.max(currentUntil, Date.now()) + oneYear;
      updates.isPremium = true;
      message = "1 an de WeMeal+ ajouté !";
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

  // Record usage
  const usageRef = benefitRef.collection("usages").doc(uid);
  const usageSnap = await usageRef.get();

  if (usageSnap.exists && benefit.oncePerUser !== false) {
    throw new HttpsError("already-exists",
      "Code déjà utilisé par cet utilisateur");
  }

  await db.runTransaction(async (transaction) => {
    transaction.update(userRef, updates);
    transaction.set(usageRef, {
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
      benefitType: benefit.type,
    });
  });

  return { success: true, message };
});
