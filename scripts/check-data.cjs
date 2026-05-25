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

assert(data.table_name === "oms_inventory", "table must be named oms_inventory");
const sourceSheetName = String(data.metadata.source_sheet_name || "").toLowerCase();
assert(["oms_inventory", "masterlist"].includes(sourceSheetName), "source sheet must be OMS_inventory or masterlist");
assert(Array.isArray(data.rows), "rows must be an array");
assert(data.rows.length >= 600, "expected the single OMS_inventory sheet, not a tiny sample");
assert(!JSON.stringify(data).includes("Copy of PARTS"), "must not include Copy of PARTS data");
assert(!JSON.stringify(data).includes("Cash Flow"), "must not include finance data");
assert(data.app_config, "app_config must be stored with the inventory data");
assert(Array.isArray(data.app_config.awning_classifications), "awning class configuration must be persisted");

required.forEach((field) => {
  assert(data.fields.includes(field), `${field} missing from normalized fields`);
  assert(data.required_searchable_fields.includes(field), `${field} missing from searchable fields`);
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
