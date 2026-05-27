#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const dataPath = path.resolve(__dirname, "../data/oms_inventory.json");
const csvPath = path.resolve(__dirname, "../data/oms_inventory.csv");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const required = [
  "model_number",
  "part_number",
  "description",
  "classification",
  "series",
  "canopy_color",
  "frame_color",
  "carrier_type",
  "shipping_dims",
  "carton_1_width",
  "carton_1_depth",
  "carton_1_height",
  "product_weight_lb",
  "pallet_weight_lb",
  "total_product_pallet_weight_lb",
  "location",
  "inventory",
  "ships_via",
];
const auditFields = ["reviewed_by", "reviewed_at", "edited_by", "edited_at", "data_edit_source"];

assert(data.table_name === "oms_inventory", "table must be named oms_inventory");
const sourceSheetName = String(data.metadata.source_sheet_name || "").toLowerCase();
assert(["master_lookup", "oms_inventory", "masterlist"].includes(sourceSheetName), "source sheet must be master_lookup, OMS_inventory, or masterlist");
assert(Array.isArray(data.rows), "rows must be an array");
assert(data.rows.length >= 800, "expected the canonical master lookup plus recovered reference rows, not a tiny sample");
assert(!JSON.stringify(data).includes("Copy of PARTS"), "must not include Copy of PARTS data");
assert(!JSON.stringify(data).includes("Cash Flow"), "must not include finance data");
assert(!JSON.stringify(data).includes("Product Lookup Table:"), "must ignore the Product_Lookup comparison sheet");
assert(data.app_config, "app_config must be stored with the inventory data");
assert(Array.isArray(data.app_config.awning_classifications), "awning class configuration must be persisted");

required.forEach((field) => {
  assert(data.fields.includes(field), `${field} missing from normalized fields`);
  assert(data.required_searchable_fields.includes(field), `${field} missing from searchable fields`);
});

auditFields.forEach((field) => {
  assert(data.fields.includes(field), `${field} missing from normalized fields`);
});

["Awnings", "Parts", "Accessories", "Replacement Components", "Shipping/Packaging Items", "Unknown / Review Needed"].forEach(
  (category) => {
    assert(Object.prototype.hasOwnProperty.call(data.summary.categories, category), `${category} category missing`);
  },
);

const keys = new Set();
data.rows.forEach((row) => {
  assert(row.record_key, `row ${row.source_row_number} missing record_key`);
  assert(!keys.has(row.record_key), `duplicate record_key ${row.record_key}`);
  keys.add(row.record_key);
});

const awning = data.rows.find((row) => row.model_number === "EAF1310-A445H3");
assert(awning, "expected EAF1310-A445H3");
assert(awning.warehouse_category === "Awnings", "EAF1310 should be categorized as Awnings");
assert(
  /Ocean Blue/i.test(`${awning.description} ${awning.canopy_color}`),
  "EAF1310 should reflect the updated Ocean Blue source value",
);
assert(awning.series === "Prestige Series", "short P series code should normalize to Prestige Series");
assert(awning.reference_sources.includes("database"), "master lookup rows should retain database reference matches");
assert(data.metadata.reference_counts?.database >= 700, "database reference sheet should be indexed");
assert(data.metadata.reference_counts?.frontend >= 600, "frontend canonical reference sheet should be indexed");
assert(data.rows.filter((row) => row.missing_from_master_lookup).length >= 150, "missing master_lookup SKUs should be recovered");
assert(data.rows.every((row) => row.data_edit_source), "each row should expose data_edit_source for export auditing");
assert(data.rows.every((row) => ["upload", "in_app", "in_app_with_unsaved_draft"].includes(row.data_edit_source)), "data_edit_source values should be controlled");

const recovered = data.rows.find((row) => row.model_number === "EA1008-A222H");
assert(recovered, "expected database-only EA1008-A222H recovery row");
assert(recovered.missing_from_master_lookup === "yes", "database-only recovery rows should be marked missing from master_lookup");
assert(recovered.database_only === "yes", "database-only recovery rows should be marked database_only");

const part = data.rows.find((row) => row.model_number === "ZLA-WMB-B1");
assert(part, "expected ZLA-WMB-B1");
assert(part.part_number === "ZLA-WMB-B1", "parts should expose part_number");
assert(
  ["Parts", "Replacement Components"].includes(part.warehouse_category),
  "ZLA-WMB-B1 should be categorized as a warehouse part",
);
assert(normalizeDims(part.shipping_dims) === "4x7x3", "ZLA-WMB-B1 dimensions should come from source data");

assert(fs.existsSync(csvPath), "CSV export must exist");
const csv = fs.readFileSync(csvPath, "utf8");
assert(csv.includes("record_key"), "CSV should include record_key");
auditFields.forEach((field) => {
  assert(csv.split("\n")[0].includes(field), `CSV should include ${field}`);
});

console.log(
  `Data check passed: ${data.rows.length} rows, ${data.summary.categories.Awnings || 0} awnings, ${
    data.summary.parts_and_accessories
  } parts/accessories.`,
);

function assert(condition, message) {
  if (!condition) {
    console.error(`Data check failed: ${message}`);
    process.exit(1);
  }
}

function normalizeDims(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s*x\s*/g, "x")
    .trim();
}
