# OMS_inventory

Warehouse-style lookup app for Advaning OMS inventory data.

## Scope

This repository contains only OMS inventory functionality:

- one normalized source table: `data/oms_inventory.json`
- one browser lookup console
- import/update scripts for newer OMS inventory files

It does not include finance, habits, cash flow, dashboards, behavioral analytics, or unrelated modules.

## Source Table

The app uses one normalized source table named `oms_inventory`. The source workbook sheet is also `OMS_inventory`.

Awnings, parts, accessories, replacement components, shipping/packaging items, and review-needed records are all filters over the same normalized table. Records are not copied into separate source sheets.

## Run Locally

```powershell
npm run dev
```

Open `http://127.0.0.1:4176`.

If PowerShell blocks `npm.ps1`, run the same server directly:

```powershell
node .\node_modules\next\dist\bin\next dev -H 0.0.0.0 -p 4176
```

Local development allows a no-Clerk fallback so you can keep working before hosted auth is configured. The deployed Vercel app requires Clerk and the approved email allowlist.

## Use Without Your Laptop

To use the lookup from a phone without connecting to your laptop, deploy it to Vercel as a normal HTTPS website.

- The production app uses Clerk login and Upstash Redis storage through Vercel.
- `GET /api/inventory`, `POST /api/import`, `POST /api/config`, and `GET /api/network` all require an approved signed-in user.
- If Redis is empty, the app seeds it from committed `data/oms_inventory.json`.
- Imports are authoritative replacements and persist to Redis online. Local development without Redis writes `data/oms_inventory.json` and `data/oms_inventory.csv`.
- Codex mobile is not required for the inventory app. Codex is only the builder/editor; once hosted, the app opens in Safari/Chrome like any other website.

Required Vercel environment:

```env
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
OMS_ALLOWED_EMAILS=sanchez.rivera0525@gmail.com
```

Install Clerk and Upstash from the Vercel Marketplace so the environment variables are attached to the `OMS_inventory` project.

Deploy after the marketplace integrations and env vars are present:

```powershell
npm run build
vercel --prod
```

## Update Inventory Data

Regenerate committed data from a newer workbook:

```powershell
npm run import -- "C:\path\to\new_oms_inventory.xlsx"
```

Or, if PowerShell blocks `npm.ps1`:

```powershell
node scripts\import-oms-inventory.cjs "C:\path\to\new_oms_inventory.xlsx"
```

The importer:

1. reads the `OMS_inventory` sheet,
2. validates and normalizes headers,
3. preserves duplicate model/part rows with unique internal `record_key` values,
4. derives `part_number`, `stock_status`, `warehouse_category`, and review fields,
5. writes `data/oms_inventory.json` and `data/oms_inventory.csv`.

The app also has an `Inventory Update / Import` section for uploading a newer `.xlsx`, `.xls`, `.csv`, or normalized `.json` file. Browser uploads are replacement imports: rows missing from the uploaded source are removed from the app data, and updates are saved through the local API.

Awning classes and per-item classification overrides are saved in `app_config` inside `data/oms_inventory.json`.

## Test

```powershell
npm test
```
