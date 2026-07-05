# TaskFlow Portfolio Transition Notes

This document serves as an internal log of the changes made to transition the TaskFlow project from a commercial SaaS application (Crevio) to a personal portfolio demonstration project.

## Key Changes
1. **Commercial Framing Removed**: All references to subscription tiers (Free, Starter, Pro), upgrade limits, and checkout flows have been neutralized. The frontend now grants full access to all features by default (`planLimits.js`).
2. **Razorpay Secrets Purged**: All Razorpay environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_BRAND_NAME`, etc.) have been completely removed from `.env` and `.env.example` files.
3. **Billing Integration Disabled**: While the Razorpay integration code (`billingController.js`) remains in the codebase as a demonstration of API implementation skills, it is strictly isolated. The `billingRoutes.js` endpoints have been overridden to immediately return `503 Service Unavailable` with a "Billing disabled" message. It is impossible to trigger a live checkout or webhook event.
4. **Branding Cleanup**: All instances of "Crevio" and "Crevio Studios" have been removed from the frontend UI, terms of service, and metadata.
5. **Domain Update**: Hardcoded domain references and CORS origins were updated to accommodate deployment on `taskflow.siddhantpal.me`.

*Note: This file is included in `.gitignore` to prevent tracking in the public repository.*
