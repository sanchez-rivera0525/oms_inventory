#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const XLSX = require("../vendor/xlsx.full.min.js");

const workbookPath = process.argv[2] || "C:/Users/sanch/Downloads/advaning.rev 2.xlsx";
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "data");

const REQUIRED_FIELDS = [
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

const EXTRA_FIELDS = [
  "stock_status",
  "warehouse_category",
  "missing_fields",
  "last_updated",
  "source_file_name",
  "source_sheet_name",
  "source_row_number",
  "record_key",
  "match_key",
  "source_classification",
  "manual_classification",
  "review_needed",
  "review_notes",
  "cost",
  "gross_weight_lb",
  "cubic_feet",
  "pallet_size",
  "retail",
  "q3_2025_retail",
  "specs",
  "pictures",
  "notes",
];

const OUTPUT_FIELDS = [...REQUIRED_FIELDS, ...EXTRA_FIELDS];

const HEADER_ALIASES = new Map(
  Object.entries({
    classification: "classification",
    class: "classification",
    series: "series",
    model_number: "model_number",
    modelnumber: "model_number",
    model: "model_number",
    item_no: "model_number",
    item_number: "model_number",
    itemno: "model_number",
    part_number: "part_number",
    part: "part_number",
    part_no: "part_number",
    part_number_alt: "part_number",
    description: "description",
    canopy_color_color: "canopy_color",
    canopy_color: "canopy_color",
    color: "canopy_color",
    frame_color: "frame_color",
    cost: "cost",
    carrier_type: "carrier_type",
    carrier: "carrier_type",
    product_weight_lb: "product_weight_lb",
    product_weight_lbs: "product_weight_lb",
    gross_weight_lb: "gross_weight_lb",
    carton_1_width_inches: "carton_1_width",
    carton_1_width: "carton_1_width",
    carton_1_depth_inches_length: "carton_1_depth",
    carton_1_depth_length: "carton_1_depth",
    carton_1_depth: "carton_1_depth",
    carton_1_height_inches: "carton_1_height",
    carton_1_height: "carton_1_height",
    cubic_feet: "cubic_feet",
    pallet_size: "pallet_size",
    pallet_lbs: "pallet_weight_lb",
    pallet_weight_lb: "pallet_weight_lb",
    total_product_pallet_weight_lb: "total_product_pallet_weight_lb",
    shipping_dims: "shipping_dims",
    shipping_dimensions: "shipping_dims",
    ships_via: "ships_via",
    retail: "retail",
    q3_2025_retail: "q3_2025_retail",
    specs: "specs",
    pictures: "pictures",
    notes: "notes",
    location: "location",
    inventory: "inventory",
    in_shop: "inventory",
    qty: "inventory",
    quantity: "inventory",
  }),
);

const CATEGORY_CLASSIFICATIONS = {
  Accessories: ["accessory", "remote", "hand crank", "battery", "sensor"],
  "Shipping/Packaging Items": ["paper", "poly foam", "plastic", "fabric swatch"],
  "Replacement Components": [
    "hardware",
    "tube",
    "fabric",
    "fabric valance",
    "fabric/valance",
    "bracket",
    "hook",
    "motor",
    "motor tool",
    "power cord",
    "cap",
    "hinge",
    "easy pitch",
    "arm",
    "loop",
    "cassette",
    "end cap",
    "coupling",
    "gear box",
    "foot/base",
    "clip",
    "leg",
    "brace",
    "gasket",
    "glass",
    "bar",
    "polycarb",
    "polycarbonate",
    "ss",
    "alu. 6061-t3",
    "rubber",
    "steal",
    "alu. 6061-t3 / ss",
    "paint",
  ],
};

const WAREHOUSE_CATEGORIES = [
  "Awnings",
  "Parts",
  "Accessories",
  "Replacement Components",
  "Shipping/Packaging Items",
  "Unknown / Review Needed",
];

main();

function main() {
  if (!fs.existsSync(workbookPath)) throw new Error(`Workbook not found: ${workbookPath}`);

  const workbookBytes = fs.readFileSync(workbookPath);
  const workbook = XLSX.read(workbookBytes, { type: "buffer", cellDates: false });
  const sheetName = workbook.SheetNames.includes("OMS_inventory")
    ? "OMS_inventory"
    : workbook.SheetNames.includes("oms_inventory")
      ? "oms_inventory"
      : "";
  if (!sheetName) throw new Error("Workbook must contain an OMS_inventory sheet.");

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "", blankrows: false });
  const existingConfig = readExistingConfig();
  const dataset = createDatasetFromAoa(rows, {
    source_file_name: path.basename(workbookPath),
    source_sheet_name: sheetName,
    generated_at: new Date().toISOString(),
    app_config: existingConfig,
  });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "oms_inventory.json"), `${JSON.stringify(dataset, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, "oms_inventory.csv"), toCsv(dataset.fields, dataset.rows));

  console.log(
    `Imported ${dataset.rows.length} oms_inventory rows (${dataset.summary.categories.Awnings || 0} awnings, ${
      dataset.summary.parts_and_accessories
    } parts/accessory records) from ${path.basename(workbookPath)}.`,
  );
}

function readExistingConfig() {
  const jsonPath = path.join(outputDir, "oms_inventory.json");
  if (!fs.existsSync(jsonPath)) return normalizeConfig();
  try {
    const existing = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    return normalizeConfig(existing.app_config);
  } catch (_error) {
    return normalizeConfig();
  }
}

function createDatasetFromAoa(aoa, meta) {
  if (!aoa.length) throw new Error("OMS_inventory sheet is empty.");

  const normalizedHeaders = normalizeHeaders(aoa[0]);
  const missingCoreHeaders = ["model_number", "description", "classification"].filter(
    (field) => !normalizedHeaders.canonicalHeaders.includes(field),
  );
  if (missingCoreHeaders.length) {
    throw new Error(`Missing required source headers after normalization: ${missingCoreHeaders.join(", ")}`);
  }

  const rows = aoa
    .slice(1)
    .map((row, index) => normalizeRecord(row, normalizedHeaders, index + 2, meta))
    .filter((record) => record.model_number || record.part_number);

  const dataset = {
    table_name: "oms_inventory",
    metadata: {
      purpose: "Warehouse-style lookup app for Advaning OMS inventory data.",
      source_sheet_name: meta.source_sheet_name,
      source_file_name: meta.source_file_name,
      generated_at: meta.generated_at,
      source_rule:
        "Awnings, parts, accessories, replacement components, shipping/packaging items, and review records are filters over one normalized oms_inventory table.",
      classification_rule:
        "Awnings are controlled by app_config.awning_classifications. Other warehouse sections filter the same records.",
    },
    app_config: normalizeConfig(meta.app_config),
    required_searchable_fields: REQUIRED_FIELDS,
    fields: OUTPUT_FIELDS,
    source_header_map: normalizedHeaders.sourceHeaderMap,
    missing_source_headers: normalizedHeaders.missingSourceHeaders,
    rows: assignRecordKeys(rows),
  };

  applyConfigToRows(dataset);
  return dataset;
}

function normalizeHeaders(headerRow) {
  const canonicalHeaders = [];
  const sourceHeaderMap = {};
  const counts = new Map();
  for (let index = 0; index < headerRow.length; index += 1) {
    const raw = cleanCell(headerRow[index]) || `Column ${index + 1}`;
    const canonicalBase = canonicalFieldName(raw);
    const count = counts.get(canonicalBase) || 0;
    counts.set(canonicalBase, count + 1);
    const canonical = count ? `${canonicalBase}_${count + 1}` : canonicalBase;
    canonicalHeaders.push(canonical);
    sourceHeaderMap[canonical] = raw;
  }

  const missingSourceHeaders = REQUIRED_FIELDS.filter((field) => field !== "part_number" && !canonicalHeaders.includes(field));
  return { canonicalHeaders, sourceHeaderMap, missingSourceHeaders };
}

function normalizeRecord(row, headers, sourceRowNumber, meta) {
  const base = {};
  headers.canonicalHeaders.forEach((header, index) => {
    base[header] = cleanCell(row[index]);
  });

  const record = {};
  OUTPUT_FIELDS.forEach((field) => {
    record[field] = cleanCell(base[field]);
  });

  record.model_number = cleanCell(record.model_number);
  record.source_classification = cleanCell(record.classification);
  record.classification = cleanCell(record.classification);
  record.description = cleanCell(record.description || record.canopy_color);
  record.part_number = cleanCell(record.part_number || (record.classification.toLowerCase() === "awning" ? "" : record.model_number));
  record.shipping_dims = cleanCell(record.shipping_dims || makeShippingDims(record));
  fillCartonDimsFromShippingDims(record);
  record.inventory = cleanCell(record.inventory);
  record.last_updated = meta.generated_at;
  record.source_file_name = meta.source_file_name;
  record.source_sheet_name = meta.source_sheet_name;
  record.source_row_number = sourceRowNumber;
  record.match_key = record.part_number || record.model_number || `row_${sourceRowNumber}`;
  return record;
}

function assignRecordKeys(rows) {
  const counts = new Map();
  rows.forEach((row) => {
    const key = normalizeKey(row.match_key || row.part_number || row.model_number || `row_${row.source_row_number}`);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const seen = new Map();
  return rows.map((row) => {
    const base = cleanCell(row.match_key || row.part_number || row.model_number || `row_${row.source_row_number}`);
    const normalized = normalizeKey(base);
    const occurrence = (seen.get(normalized) || 0) + 1;
    seen.set(normalized, occurrence);
    row.record_key = counts.get(normalized) > 1 ? `${base}__row_${row.source_row_number || occurrence}` : base;
    return row;
  });
}

function applyConfigToRows(dataset) {
  dataset.rows.forEach((row) => {
    const override = dataset.app_config.classification_overrides[row.record_key];
    row.classification = cleanCell(override || row.source_classification || row.classification);
    row.manual_classification = Boolean(override);
    row.stock_status = stockStatus(row.inventory);
    row.warehouse_category = warehouseCategory(row.classification, dataset.app_config);
    row.missing_fields = requiredMissingFields(row);
    row.review_needed = row.missing_fields.length > 0 || row.warehouse_category === "Unknown / Review Needed";
    row.review_notes = reviewNotes(row);
  });
  dataset.summary = summarize(dataset.rows);
}

function normalizeConfig(config = {}) {
  config = config || {};
  return {
    awning_classifications: Array.isArray(config.awning_classifications) ? config.awning_classifications : ["Awning"],
    classification_overrides:
      config.classification_overrides && typeof config.classification_overrides === "object" ? config.classification_overrides : {},
  };
}

function canonicalFieldName(rawHeader) {
  const normalized = cleanCell(rawHeader)
    .toLowerCase()
    .replace(/#/g, "number")
    .replace(/\+/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return HEADER_ALIASES.get(normalized) || normalized || "unknown";
}

function warehouseCategory(classification, config) {
  const value = cleanCell(classification).toLowerCase();
  const awningClasses = new Set((config.awning_classifications || ["Awning"]).map((item) => cleanCell(item).toLowerCase()));
  if (awningClasses.has(value)) return "Awnings";
  if (!value || value === "k" || value.includes("unknown") || value.includes("review") || value.includes("unclassified")) {
    return "Unknown / Review Needed";
  }
  if (CATEGORY_CLASSIFICATIONS.Accessories.includes(value)) return "Accessories";
  if (value.includes("carton") || value.includes("box") || CATEGORY_CLASSIFICATIONS["Shipping/Packaging Items"].includes(value)) {
    return "Shipping/Packaging Items";
  }
  if (CATEGORY_CLASSIFICATIONS["Replacement Components"].includes(value)) return "Replacement Components";
  return "Parts";
}

function stockStatus(value) {
  const text = cleanCell(value);
  if (!text) return "Review Needed";
  const stock = numeric(text);
  if (stock > 0) return "In Stock";
  if (stock === 0) return "Out of Stock";
  return "Review Needed";
}

function requiredMissingFields(record) {
  return REQUIRED_FIELDS.filter((field) => {
    if (field === "part_number" && record.warehouse_category === "Awnings") return false;
    return cleanCell(record[field]) === "";
  });
}

function reviewNotes(record) {
  const notes = [];
  if (record.missing_fields.length) notes.push(`Missing: ${record.missing_fields.join(", ")}`);
  if (record.warehouse_category === "Unknown / Review Needed") notes.push("Classification needs review.");
  return notes.join(" ");
}

function makeShippingDims(record) {
  const width = cleanCell(record.carton_1_width);
  const depth = cleanCell(record.carton_1_depth);
  const height = cleanCell(record.carton_1_height);
  return width && depth && height ? `${width} x ${depth} x ${height}` : "";
}

function fillCartonDimsFromShippingDims(record) {
  if (record.carton_1_width && record.carton_1_depth && record.carton_1_height) return;
  const dims = cleanCell(record.shipping_dims)
    .replace(/["']/g, "")
    .match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  if (!dims) return;
  if (!record.carton_1_width) record.carton_1_width = dims[1];
  if (!record.carton_1_depth) record.carton_1_depth = dims[2];
  if (!record.carton_1_height) record.carton_1_height = dims[3];
}

function summarize(rows) {
  const categories = Object.fromEntries(WAREHOUSE_CATEGORIES.map((category) => [category, 0]));
  const classifications = {};
  const missing_required_fields = {};
  let stock_units = 0;
  let needing_review = 0;

  rows.forEach((row) => {
    categories[row.warehouse_category] = (categories[row.warehouse_category] || 0) + 1;
    classifications[row.classification || "Blank"] = (classifications[row.classification || "Blank"] || 0) + 1;
    stock_units += numeric(row.inventory);
    if (row.review_needed) needing_review += 1;
    row.missing_fields.forEach((field) => {
      missing_required_fields[field] = (missing_required_fields[field] || 0) + 1;
    });
  });

  return {
    total_records: rows.length,
    stock_units,
    parts_and_accessories: rows.filter((row) => row.warehouse_category !== "Awnings").length,
    needing_review,
    categories,
    classifications,
    missing_required_fields,
  };
}

function toCsv(fields, rows) {
  const lines = [fields.map(csvCell).join(",")];
  rows.forEach((row) => {
    lines.push(fields.map((field) => csvCell(Array.isArray(row[field]) ? row[field].join("; ") : row[field])).join(","));
  });
  return `${lines.join("\n")}\n`;
}

function csvCell(value) {
  const text = cleanCell(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function cleanCell(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeKey(value) {
  return cleanCell(value).toLowerCase();
}

function numeric(value) {
  const parsed = Number(cleanCell(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}
