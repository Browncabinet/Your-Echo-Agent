## Clean up duplicate Stripe products

The 6 price IDs your app actually uses are:
- **Weekly subscriptions:** `starter_weekly`, `growth_weekly`, `power_weekly`
- **Top-up packs:** `topup_500`, `topup_1000`, `topup_2500`

Any product/price in your Payments panel outside this list is unused and safe to remove.

### How the cleanup happens

The Payments tool surface I have (`create_product`, `batch_create_product`, `create_price`, `get_go_live_status`) does **not** expose delete or archive. Product deletion has to happen in the Payments panel directly — I can't do it from code.

### What I'll do
1. Query the sandbox to list every product/price currently registered and identify which are duplicates (same `price_id` created more than once, or old IDs like `starter_monthly`, `trial_growth_5day`, etc.).
2. Give you the exact list of items to archive, grouped by "keep" vs "archive", so you can click through the Payments panel confidently.
3. Confirm the 6 canonical price IDs above resolve correctly after cleanup by re-running the go-live status check.

### What you'll do
Archive the flagged duplicates in the Payments panel (More → Payments → each product → Archive). Archiving is safe — it doesn't affect existing subscriptions, only prevents new checkouts against that price.

### Notes
- I will **not** create new products or prices during this cleanup — the 6 canonical ones already exist and are wired to the app.
- Live-mode products are auto-synced from sandbox on publish, so cleaning sandbox is what matters.
