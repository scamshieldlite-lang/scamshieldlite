"use strict";
// packages/shared/subscription.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCT_PRICES = exports.PRODUCT_IDS = void 0;
// Google Play product IDs — must match Play Console exactly
exports.PRODUCT_IDS = {
  MONTHLY: "scamshieldlite_monthly",
  YEARLY: "scamshieldlite_yearly",
};
// Pricing display — update to match your Play Console prices
exports.PRODUCT_PRICES = {
  [exports.PRODUCT_IDS.MONTHLY]: "$5.99/month",
  [exports.PRODUCT_IDS.YEARLY]: "$64.99/year",
};
//# sourceMappingURL=subscription.js.map
