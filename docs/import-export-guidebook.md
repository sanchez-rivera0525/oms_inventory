# OMS Inventory Import and Export Guidebook

This guide defines the operational rules for moving inventory data into and out of the OMS Inventory console.

The goal is simple: imports should be controlled replacements, exports should be auditable evidence, and every edited row should explain where its data came from.

## Operating Principles

1. The app has one canonical table: `oms_inventory`.
2. Awnings, parts, accessories, shipping items, and review-needed records are filters over that same table.
3. Imports are replacement imports. If a SKU line is missing from the uploaded file, it is removed from the working dataset.
4. Exports must include the latest app state, including saved edits and any active unsaved edit draft.
5. Every row must carry data lineage through `source_*`, `edited_*`, `reviewed_*`, and `data_edit_source` fields.
6. Spreadsheet formatting is not the source of truth. Headers and cell values are the source of truth.

## Supported Import Files

The Load Sheet workflow accepts:

- `.xlsx`
- `.xls`
- `.csv`
- normalized `.json`

For spreadsheets with multiple sheets, the app chooses the inventory sheet in this order:

1. `master_lookup`
2. `OMS_inventory`
3. `oms_inventory`
4. `masterlist`
5. the only worksheet, if the workbook has exactly one sheet

If the workbook has multiple sheets and none of the known inventory sheet names, the import is rejected.

## Current Workbook Rule

For the current master workbook structure:

- `master_lookup` is the frontend canonical sheet.
- `Product_Lookup` is not treated as the import source.
- `oms_inventory_master`, `Sheet10`, and `legacy` are reference sheets.
- Reference sheets enrich existing rows and recover SKUs missing from `master_lookup`.
- Recovered reference-only rows are marked with fields such as `missing_from_master_lookup`, `database_only`, `frontend_only`, or `legacy_reference_only`.

This lets the app keep the cleaner frontend table while still preserving useful database and discontinued SKU evidence.

## Required Import Headers

An uploadable sheet must include:

- `description`
- `classification`
- either `model_number` or `part_number`

`part_number` is optional if the row is an awning and `model_number` is present.

Rows with neither `model_number` nor `part_number` are ignored.

## Header Normalization Rules

Headers are normalized into canonical snake_case fields. The importer accepts common aliases, including:

- `model`, `modelnumber`, `model_part_number`, `reconciled_list` -> `model_number`
- `item_no`, `item_number`, `part`, `part_no` -> `part_number`
- `type2`, `class` -> classification or series context depending on source
- `color`, `color_description`, `canopy_color_color` -> `canopy_color`
- `width`, `depth`, `height` -> carton dimension fields
- `product_weight`, `product_weight_lbs` -> `product_weight_lb`
- `gross_weight`, `gross_weight_lbs` -> `gross_weight_lb`
- `total_product_plus_pallet_weight` -> `total_product_pallet_weight_lb`
- `reviewed_timestamp` -> `reviewed_at`
- `edited_timestamp` -> `edited_at`
- `edit_source`, `source_of_data_edits` -> `data_edit_source`

Do not depend on visual column order. The importer depends on header names after normalization.

## Canonical Field Set

Current exports contain these canonical fields:

```text
model_number
part_number
description
classification
series
canopy_color
frame_color
carrier_type
shipping_dims
carton_1_width
carton_1_depth
carton_1_height
product_weight_lb
pallet_weight_lb
total_product_pallet_weight_lb
location
inventory
ships_via
stock_status
warehouse_category
missing_fields
last_updated
source_file_name
source_sheet_name
source_row_number
reviewed_by
reviewed_at
edited_by
edited_at
data_edit_source
record_key
match_key
source_classification
manual_classification
review_needed
review_notes
item_type
series_code
source_status
department
unit
oem
brand
upc
color_code
cost
store_price
gross_weight_lb
cubic_feet
pallet_size
retail
q3_2025_retail
specs
pictures
notes
notes2
shop_status
reference_sources
database_match
frontend_match
legacy_match
database_only
frontend_only
legacy_reference_only
missing_from_master_lookup
discontinued_reference
```

## Grouped Parts Rules

Some source sheets group parts under awning type or series headings.

The importer preserves grouped context for part rows when the row has a `part_number` but no `model_number`. It can carry forward:

- `classification`
- `item_type`
- `series`
- `series_code`
- `source_status`
- `department`
- `unit`

This is why rows grouped under Prestige, Luxury, Classic, Free-Standing, and similar source blocks can still become searchable part records.

## Normalization Rules

During import, the app:

- trims cell values
- derives `part_number` for non-awning rows when needed
- infers `series_code` from source values or SKU patterns
- converts known series codes into human-readable series names
- builds `shipping_dims` from width, depth, and height when possible
- fills carton dimension columns from `shipping_dims` when possible
- assigns stable internal `record_key` values
- keeps duplicate model numbers as separate inventory lines
- recalculates missing-field and validation flags
- sets `data_edit_source` to `upload`

## Audit Trail Fields

These fields are required for validation engineering:

| Field | Meaning |
| --- | --- |
| `source_file_name` | File that supplied the row |
| `source_sheet_name` | Sheet that supplied the row |
| `source_row_number` | Row number from the source sheet |
| `edited_by` | Operator who last edited the row inside the app |
| `edited_at` | Timestamp of the last in-app edit |
| `reviewed_by` | Operator who marked the row reviewed |
| `reviewed_at` | Timestamp of review |
| `data_edit_source` | Controlled source value, usually `upload` or `in_app` |

Allowed `data_edit_source` values:

- `upload`
- `in_app`
- `in_app_with_unsaved_draft` as export metadata when an unsaved draft is included

## In-App Edit Rules

Controlled in-app editing is limited to operational fields:

- dimensions
- weight
- carrier
- shipping method
- location
- inventory
- cost
- image link
- notes

When an operator saves an edit:

1. the edited fields are written into the active dataset
2. `edited_by` is stamped
3. `edited_at` is stamped
4. `data_edit_source` becomes `in_app`
5. validation flags are recalculated

When an operator clicks Mark Reviewed:

1. `reviewed_by` is stamped
2. `reviewed_at` is stamped
3. `data_edit_source` becomes `in_app`
4. validation flags are recalculated

## Export Formats

The app supports three export formats:

### XLSX

Use this for normal operations, Excel review, and re-uploadable inventory work.

The XLSX export includes:

- `oms_inventory` sheet with all canonical fields and all current rows
- `Export Metadata` sheet with export time, source, row count, field count, and table name
- autofilter on the inventory sheet
- numeric typing for key numeric fields

### CSV

Use this for lightweight review, diffing, or tools that prefer plain text.

CSV includes the same canonical fields as XLSX but no metadata sheet and no spreadsheet typing.

### JSON

Use this for app backup, debugging, or preserving the full normalized dataset shape.

JSON includes:

- metadata
- app config
- required searchable fields
- field list
- rows
- relationships
- summary data

## Export Rules

Exports are generated from the current app dataset, not from the original source file.

Exports include:

- uploaded data
- saved in-app edits
- reviewed-by stamps
- edited-by stamps
- current validation flags
- active unsaved edit draft, if one exists

If an unsaved draft is present during export:

- the exported row includes the draft value
- the exported row is stamped as `in_app`
- export metadata uses `export_source: in_app_with_unsaved_draft`
- the live app dataset is not saved unless the operator clicks Save SKU

## Importing an Export Back Into the App

Use XLSX or JSON for round trips.

Preferred round-trip path:

1. Export XLSX.
2. Review or adjust values in Excel.
3. Keep the `oms_inventory` sheet name.
4. Keep canonical headers unchanged.
5. Upload the workbook through Load Sheet.
6. Check the import summary before continuing work.

Do not upload the `Export Metadata` sheet by itself. It is informational only.

## Validation Checks

Before committing or deploying data changes, run:

```powershell
npm test
```

The test suite checks:

- inventory JSON shape
- canonical required fields
- audit fields
- source sheet rules
- recovered database/reference rows
- generated CSV headers
- generated XLSX structure
- XLSX row count
- XLSX audit columns
- JavaScript syntax

For command-line imports, use:

```powershell
npm run import -- "C:\path\to\new_oms_inventory.xlsx"
npm test
```

## Operator Checklist

Before import:

- confirm the source sheet is `master_lookup`, `OMS_inventory`, `oms_inventory`, `masterlist`, or the only sheet
- confirm `description` and `classification` headers exist
- confirm at least one SKU identifier column exists: `model_number` or `part_number`
- confirm shipping fields are not hidden only in notes if they should be structured
- keep reference sheets in the workbook when using the master workbook

After import:

- check row count
- check Cannot Ship
- check Missing Shipping Dims
- check Pending Carrier
- check Duplicate SKUs
- spot check at least one awning, one part, and one recovered reference SKU
- export XLSX and confirm `oms_inventory` plus `Export Metadata` sheets exist

Before export is used as evidence:

- save intended SKU edits
- mark reviewed rows when verification is complete
- export XLSX for Excel review
- keep the file name timestamp intact
- do not manually erase audit columns

## Common Failure Modes

| Problem | Likely cause | Fix |
| --- | --- | --- |
| Import rejected for missing headers | Header names are absent or not recognized | Rename headers to canonical names or supported aliases |
| Rows disappear after import | Replacement import removed rows not present in the upload | Use the complete source file, not a filtered subset |
| Parts lose series context | Group heading columns were removed | Keep series/classification grouping columns in the upload |
| Shipping dims missing | Width/depth/height and `shipping_dims` are blank | Fill structured dimension fields or `shipping_dims` |
| Carrier remains pending | `carrier_type` or `ships_via` is blank/unclear | Enter the lane: parcel, common carrier, LTL, UPS, FedEx, etc. |
| Duplicate SKUs show up | Multiple source rows share the same model/part key | Treat as operational review, not automatic deletion |
| Export has draft values | Export was run while edit form had unsaved changes | Save or discard before exporting final evidence |

## Source of Truth

The repo source files are:

- `data/oms_inventory.json` for normalized app data
- `data/oms_inventory.csv` for plain-text export/reference
- `src/app.js` for browser import/export behavior
- `scripts/import-oms-inventory.cjs` for command-line workbook imports
- `src/xlsx-export.js` for XLSX workbook export behavior
- `scripts/check-data.cjs` and `scripts/check-xlsx-export.mjs` for validation

When behavior changes, update this guidebook in the same commit.
