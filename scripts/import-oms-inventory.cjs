#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const XLSX = require("../vendor/xlsx.full.min.cjs");

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
  "item_type",
  "series_code",
  "source_status",
  "department",
  "unit",
  "oem",
  "brand",
  "upc",
  "color_code",
  "cost",
  "store_price",
  "gross_weight_lb",
  "cubic_feet",
  "pallet_size",
  "retail",
  "q3_2025_retail",
  "specs",
  "pictures",
  "notes",
  "notes2",
  "shop_status",
  "reference_sources",
  "database_match",
  "frontend_match",
  "legacy_match",
  "database_only",
  "frontend_only",
  "legacy_reference_only",
  "missing_from_master_lookup",
  "discontinued_reference",
];

const OUTPUT_FIELDS = [...REQUIRED_FIELDS, ...EXTRA_FIELDS];
const GROUPED_CONTEXT_FIELDS = ["classification", "item_type", "series", "series_code", "source_status", "department", "unit"];

const HEADER_ALIASES = new Map(
  Object.entries({
    classification: "classification",
    type: "item_type",
    type2: "classification",
    item_type: "item_type",
    class: "series_code",
    series_code: "series_code",
    series: "series",
    status: "source_status",
    dept: "department",
    department: "department",
    unit: "unit",
    oem: "oem",
    brand: "brand",
    model_number: "model_number",
    modelnumber: "model_number",
    model_part_number: "model_number",
    model: "model_number",
    reconciled_list: "model_number",
    item_no: "part_number",
    item_number: "part_number",
    itemno: "part_number",
    part_number: "part_number",
    part: "part_number",
    part_no: "part_number",
    part_number_alt: "part_number",
    description: "description",
    normalized_description: "description",
    description_normalized: "description",
    oms_description1: "specs",
    oms_description2: "notes",
    color_code: "color_code",
    canopy_color_color: "canopy_color",
    canopy_color: "canopy_color",
    color_description: "canopy_color",
    color: "canopy_color",
    frame_color: "frame_color",
    cost: "cost",
    advaning_price: "cost",
    store_price: "store_price",
    price: "cost",
    oms_price: "retail",
    qty_price1: "retail",
    upc: "upc",
    carrier_type: "carrier_type",
    carrier: "carrier_type",
    shipping_weight: "gross_weight_lb",
    product_weight_lb: "product_weight_lb",
    product_weight_lbs: "product_weight_lb",
    product_weight: "product_weight_lb",
    qty_wt: "product_weight_lb",
    qty_weight: "product_weight_lb",
    gross_weight_lb: "gross_weight_lb",
    gross_weight_lbs: "gross_weight_lb",
    gross_weight: "gross_weight_lb",
    length_in: "carton_1_width",
    width_in: "carton_1_width",
    depth_in: "carton_1_depth",
    height_in: "carton_1_height",
    carton_1_width_inches: "carton_1_width",
    carton_1_width: "carton_1_width",
    carton_1_depth_inches_length: "carton_1_depth",
    carton_1_depth_length: "carton_1_depth",
    carton_1_depth: "carton_1_depth",
    carton_1_height_inches: "carton_1_height",
    carton_1_height: "carton_1_height",
    cubic_feet: "cubic_feet",
    cubic_ft: "cubic_feet",
    pallet_size: "pallet_size",
    pallet_size_in: "pallet_size",
    pallet_lbs: "pallet_weight_lb",
    pallet_weight_lb: "pallet_weight_lb",
    pallet_weight_lbs: "pallet_weight_lb",
    pallet_weight: "pallet_weight_lb",
    total_product_pallet_weight_lb: "total_product_pallet_weight_lb",
    total_product_pallet_weight: "total_product_pallet_weight_lb",
    total_product_plus_pallet_weight: "total_product_pallet_weight_lb",
    total_product_pallet_weight_lbs: "total_product_pallet_weight_lb",
    roduct_pallet_weight_lbs: "total_product_pallet_weight_lb",
    shipping_dims: "shipping_dims",
    shipping_dimensions: "shipping_dims",
    shipping_dimensions_in: "shipping_dims",
    ships_via: "ships_via",
    retail: "retail",
    q3_2025_retail: "q3_2025_retail",
    specs: "specs",
    size: "specs",
    pictures: "pictures",
    notes: "notes",
    notes2: "notes2",
    location: "location",
    inventory: "inventory",
    in_shop: "shop_status",
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

const REFERENCE_SHEETS = [
  { name: "oms_inventory_master", label: "database", matchField: "database_match", onlyField: "database_only" },
  { name: "Sheet10", label: "frontend", matchField: "frontend_match", onlyField: "frontend_only" },
  { name: "legacy", label: "legacy", matchField: "legacy_match", onlyField: "legacy_reference_only" },
];

main();

function main() {
  if (!fs.existsSync(workbookPath)) throw new Error(`Workbook not found: ${workbookPath}`);

  const workbookBytes = fs.readFileSync(workbookPath);
  const workbook = XLSX.read(workbookBytes, { type: "buffer", cellDates: false });
  const sheetName = inventorySheetName(workbook.SheetNames);
  if (!sheetName) throw new Error("Workbook must contain an OMS_inventory/masterlist sheet or one uploadable sheet.");

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "", blankrows: false });
  const existingConfig = readExistingConfig();
  const dataset = createDatasetFromAoa(rows, {
    source_file_name: path.basename(workbookPath),
    source_sheet_name: sheetName,
    generated_at: new Date().toISOString(),
    app_config: existingConfig,
  });
  upgradeDatasetFromWorkbook(dataset, workbook);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "oms_inventory.json"), `${JSON.stringify(dataset, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, "oms_inventory.csv"), toCsv(dataset.fields, dataset.rows));

  console.log(
    `Imported ${dataset.rows.length} oms_inventory rows (${dataset.summary.categories.Awnings || 0} awnings, ${
      dataset.summary.parts_and_accessories
    } parts/accessory records) from ${path.basename(workbookPath)}.`,
  );
}

function inventorySheetName(sheetNames) {
  return (
    sheetNames.find((name) => name.toLowerCase() === "master_lookup") ||
    sheetNames.find((name) => name === "OMS_inventory") ||
    sheetNames.find((name) => name.toLowerCase() === "oms_inventory") ||
    sheetNames.find((name) => name.toLowerCase() === "masterlist") ||
    (sheetNames.length === 1 ? sheetNames[0] : "")
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

  const normalizedHeaders = normalizeHeaders(aoa[0], meta);
  const missingCoreHeaders = ["description", "classification"].filter(
    (field) => !normalizedHeaders.canonicalHeaders.includes(field),
  );
  if (!normalizedHeaders.canonicalHeaders.includes("model_number") && !normalizedHeaders.canonicalHeaders.includes("part_number")) {
    missingCoreHeaders.unshift("model_number/part_number");
  }
  if (missingCoreHeaders.length) {
    throw new Error(`Missing required source headers after normalization: ${missingCoreHeaders.join(", ")}`);
  }

  const context = {};
  const rows = aoa
    .slice(1)
    .map((row, index) => normalizeRecord(row, normalizedHeaders, index + 2, meta, context))
    .filter((record) => record.model_number || record.part_number);

  const dataset = {
    table_name: "oms_inventory",
    metadata: {
      purpose: "Warehouse-style lookup app for Advaning OMS inventory data.",
      source_sheet_name: meta.source_sheet_name,
      source_file_name: meta.source_file_name,
      generated_at: meta.generated_at,
      source_rule:
        "master_lookup is the frontend canonical sheet. Product_Lookup is ignored. oms_inventory_master, Sheet10, and legacy are used as database/reference sources for enrichment and missing-SKU recovery.",
      classification_rule:
        "Awnings are controlled by app_config.awning_classifications. Other warehouse sections filter the same records.",
      relationship_rule:
        "Series/class codes from masterlist create parent-child reference links from series groups to awnings, parts, fabrics, and accessories.",
    },
    app_config: normalizeConfig(meta.app_config),
    required_searchable_fields: REQUIRED_FIELDS,
    fields: OUTPUT_FIELDS,
    source_header_map: normalizedHeaders.sourceHeaderMap,
    missing_source_headers: normalizedHeaders.missingSourceHeaders,
    rows: assignRecordKeys(rows),
    relationships: [],
  };

  applyConfigToRows(dataset);
  return dataset;
}

function upgradeDatasetFromWorkbook(dataset, workbook) {
  if (cleanCell(dataset.metadata.source_sheet_name).toLowerCase() !== "master_lookup") return;

  const references = REFERENCE_SHEETS.map((definition) => ({
    ...definition,
    rows: referenceRowsFromSheet(workbook, definition.name, dataset.metadata),
  }));
  dataset.metadata.reference_sheet_names = references.filter((reference) => reference.rows.length).map((reference) => reference.name);
  dataset.metadata.reference_counts = Object.fromEntries(references.map((reference) => [reference.label, reference.rows.length]));

  enrichRowsFromReferences(dataset.rows, references);

  const presentKeys = new Set(dataset.rows.map(referenceKey).filter(Boolean));
  references.forEach((reference) => {
    reference.rows.forEach((row) => {
      const key = referenceKey(row);
      if (!key || presentKeys.has(key) || !isUsefulReferenceRow(row)) return;
      const missingRow = { ...row };
      missingRow.missing_from_master_lookup = "yes";
      missingRow[reference.onlyField] = "yes";
      missingRow[reference.matchField] = "yes";
      missingRow.reference_sources = reference.label;
      missingRow.last_updated = dataset.metadata.generated_at;
      if (isDiscontinuedReference(missingRow)) missingRow.discontinued_reference = "yes";
      dataset.rows.push(missingRow);
      presentKeys.add(key);
    });
  });

  enrichRowsFromReferences(dataset.rows, references);
  dataset.rows = assignRecordKeys(dataset.rows);
  applyConfigToRows(dataset);
}

function referenceRowsFromSheet(workbook, sheetName, baseMeta) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false });
  if (!aoa.length) return [];
  const meta = {
    source_file_name: baseMeta.source_file_name,
    source_sheet_name: sheetName,
    generated_at: baseMeta.generated_at,
  };
  const headers = normalizeHeaders(aoa[0], meta);
  const context = {};
  return aoa
    .slice(1)
    .map((row, index) => normalizeRecord(row, headers, index + 2, meta, context))
    .filter((row) => referenceKey(row) && isUsefulReferenceRow(row));
}

function enrichRowsFromReferences(rows, references) {
  const indexes = references.map((reference) => ({ ...reference, index: indexRowsByKey(reference.rows) }));
  rows.forEach((row) => {
    indexes.forEach((reference) => {
      const key = referenceKey(row);
      const referenceRow = key ? reference.index.get(key)?.[0] : null;
      if (!referenceRow) return;
      row[reference.matchField] = "yes";
      row.reference_sources = appendToken(row.reference_sources, reference.label);
      if (isDiscontinuedReference(referenceRow) || isDiscontinuedReference(row)) row.discontinued_reference = "yes";
      mergeReferenceFields(row, referenceRow, reference.label);
    });
  });
}

function indexRowsByKey(rows) {
  return rows.reduce((index, row) => {
    const key = referenceKey(row);
    if (!key) return index;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(row);
    return index;
  }, new Map());
}

function referenceKey(row) {
  return normalizeKey(row.model_number || row.part_number);
}

function isUsefulReferenceRow(row) {
  const key = referenceKey(row);
  if (!key) return false;
  if (["model number", "part number", "part #", "reconciled list"].includes(key)) return false;
  if (key.startsWith("column ")) return false;
  return Boolean(cleanCell(row.description || row.classification || row.shipping_dims || row.notes || row.pictures));
}

function mergeReferenceFields(row, referenceRow, label) {
  if (label === "legacy" && isMisalignedLegacyRow(referenceRow)) return;
  const fillFields = [
    "description",
    "classification",
    "series",
    "series_code",
    "item_type",
    "canopy_color",
    "frame_color",
    "color_code",
    "upc",
    "carrier_type",
    "ships_via",
    "shipping_dims",
    "carton_1_width",
    "carton_1_depth",
    "carton_1_height",
    "product_weight_lb",
    "gross_weight_lb",
    "pallet_weight_lb",
    "total_product_pallet_weight_lb",
    "pallet_size",
    "cubic_feet",
    "inventory",
    "cost",
    "store_price",
    "retail",
    "q3_2025_retail",
    "specs",
    "pictures",
    "location",
    "shop_status",
    "oem",
    "brand",
  ];
  fillFields.forEach((field) => {
    if (!hasUsableValue(row[field]) && hasUsableValue(referenceRow[field])) row[field] = referenceRow[field];
  });
  if (!hasUsableValue(row.notes) && hasUsableValue(referenceRow.notes)) {
    row.notes = referenceRow.notes;
  } else if (hasUsableValue(referenceRow.notes) && cleanCell(referenceRow.notes) !== cleanCell(row.notes)) {
    row.notes2 = appendToken(row.notes2, `${label}: ${referenceRow.notes}`, " | ");
  }
}

function isMisalignedLegacyRow(row) {
  if (cleanCell(row.source_sheet_name).toLowerCase() !== "legacy") return false;
  const description = cleanCell(row.description);
  const picture = cleanCell(row.pictures);
  const looksLikeUpc = description.toLowerCase() === "upc" || /^\d{10,14}$/.test(description) || /^\d+(?:\.\d+)?e\+\d+$/i.test(description);
  return looksLikeUpc && !hasDimensionNumbers(row.shipping_dims) && /^\d+(?:\.\d+)?$/.test(picture);
}

function appendToken(value, token, separator = ", ") {
  const existing = cleanCell(value);
  const next = cleanCell(token);
  if (!next) return existing;
  const parts = existing ? existing.split(separator).map(cleanCell).filter(Boolean) : [];
  if (!parts.some((part) => part.toLowerCase() === next.toLowerCase())) parts.push(next);
  return parts.join(separator);
}

function isDiscontinuedReference(row) {
  const status = cleanCell(`${row.source_status} ${row.shop_status} ${row.notes} ${row.notes2}`).toLowerCase();
  if (!status) return false;
  return (
    status.includes("discontinued") ||
    status.includes("obsolete") ||
    status.includes("do not use") ||
    status.includes("do not sell") ||
    status.includes("ⓧ") ||
    status.includes("✗") ||
    status.includes("×") ||
    status === "x"
  );
}

function hasUsableValue(value) {
  const text = cleanCell(value);
  if (!text) return false;
  return !["n/a", "na", "pending", "data pending verification", "needs verification", "tbd"].includes(text.toLowerCase());
}

function hasDimensionNumbers(value) {
  return (cleanCell(value).match(/\d+(?:\.\d+)?/g) || []).length >= 3;
}

function normalizeHeaders(headerRow, meta = {}) {
  const canonicalHeaders = [];
  const sourceHeaderMap = {};
  const counts = new Map();
  for (let index = 0; index < headerRow.length; index += 1) {
    const raw = cleanCell(headerRow[index]) || `Column ${index + 1}`;
    const canonicalBase = canonicalFieldName(raw, meta);
    const count = counts.get(canonicalBase) || 0;
    counts.set(canonicalBase, count + 1);
    const canonical = count ? `${canonicalBase}_${count + 1}` : canonicalBase;
    canonicalHeaders.push(canonical);
    sourceHeaderMap[canonical] = raw;
  }

  const missingSourceHeaders = REQUIRED_FIELDS.filter((field) => field !== "part_number" && !canonicalHeaders.includes(field));
  return { canonicalHeaders, sourceHeaderMap, missingSourceHeaders };
}

function normalizeRecord(row, headers, sourceRowNumber, meta, context = {}) {
  const base = {};
  headers.canonicalHeaders.forEach((header, index) => {
    base[header] = cleanCell(row[index]);
  });
  applyGroupedContext(base, context);

  const record = {};
  OUTPUT_FIELDS.forEach((field) => {
    record[field] = cleanCell(base[field]);
  });

  record.model_number = cleanCell(record.model_number);
  record.source_classification = cleanCell(record.classification);
  record.classification = cleanCell(record.classification);
  record.item_type = cleanCell(record.item_type);
  const sourceSeries = cleanCell(record.series);
  record.series_code = cleanCell(record.series_code || (seriesFromCode(sourceSeries) ? sourceSeries : "") || inferSeriesCode(record.model_number || record.part_number));
  record.series = cleanCell(seriesFromCode(record.series_code) || sourceSeries);
  record.description = cleanCell(record.description || record.specs || record.notes || record.canopy_color);
  if (cleanCell(record.pictures) === "0") record.pictures = "";
  record.part_number = cleanCell(record.part_number || (record.classification.toLowerCase() === "awning" ? "" : record.model_number));
  record.shipping_dims = cleanCell(record.shipping_dims);
  if (!hasDimensionNumbers(record.shipping_dims)) record.shipping_dims = makeShippingDims(record);
  fillCartonDimsFromShippingDims(record);
  record.inventory = cleanCell(record.inventory);
  record.last_updated = meta.generated_at;
  record.source_file_name = meta.source_file_name;
  record.source_sheet_name = meta.source_sheet_name;
  record.source_row_number = sourceRowNumber;
  record.match_key = record.part_number || record.model_number || `row_${sourceRowNumber}`;
  return record;
}

function applyGroupedContext(record, context) {
  const shouldFillFromGroup = !cleanCell(record.model_number) && cleanCell(record.part_number);
  GROUPED_CONTEXT_FIELDS.forEach((field) => {
    if (cleanCell(record[field])) {
      context[field] = cleanCell(record[field]);
    } else if (shouldFillFromGroup && context[field]) {
      record[field] = context[field];
    }
  });
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
  dataset.relationships = buildSeriesRelationships(dataset.rows);
  dataset.relationship_summary = summarizeRelationships(dataset.relationships);
  dataset.summary = summarize(dataset.rows);
}

function buildSeriesRelationships(rows) {
  return rows
    .map((row) => {
      const seriesCode = cleanCell(row.series_code || inferSeriesCode(row.model_number || row.part_number));
      const series = cleanCell(row.series || seriesFromCode(seriesCode));
      if (!seriesCode && !series) return null;
      return {
        parent_type: "series",
        parent_key: `series:${normalizeKey(seriesCode || series)}`,
        parent_label: series || seriesCode,
        child_key: row.record_key,
        child_model_number: cleanCell(row.model_number || row.part_number),
        relationship_type: row.warehouse_category === "Awnings" ? "series_awning" : "series_component",
        series_code: seriesCode,
        series,
        item_type: cleanCell(row.item_type),
        classification: cleanCell(row.classification),
        source: "masterlist_grouping",
        source_row_number: row.source_row_number,
      };
    })
    .filter(Boolean);
}

function summarizeRelationships(relationships) {
  return relationships.reduce(
    (summary, relationship) => {
      summary.total += 1;
      summary.by_parent[relationship.parent_key] = (summary.by_parent[relationship.parent_key] || 0) + 1;
      summary.by_type[relationship.relationship_type] = (summary.by_type[relationship.relationship_type] || 0) + 1;
      return summary;
    },
    { total: 0, by_parent: {}, by_type: {} },
  );
}

function inferSeriesCode(value) {
  const text = cleanCell(value).toUpperCase();
  const match = text.match(/(?:^|[-_ ])(FS|SG|GA|PA|PN|PS|AC|DA|P|L|C|S)(?=\d|[-_ ]|$)/);
  return match ? match[1] : "";
}

function seriesFromCode(code) {
  const value = cleanCell(code).toUpperCase();
  const seriesNames = {
    P: "Prestige Series",
    L: "Luxury Series",
    C: "Classic Series",
    FS: "Free Standing Series",
    SG: "Slim Gray Series",
    GA: "Glass Awning",
    PA: "Polycarbonate Aluminum",
    PN: "Polycarbonate Nylon",
    PS: "Polycarbonate Steel",
    AC: "Awning Cover",
    DA: "Door Awning",
    S: "Slim Series",
  };
  return seriesNames[value] || "";
}

function normalizeConfig(config = {}) {
  config = config || {};
  return {
    awning_classifications: Array.isArray(config.awning_classifications) ? config.awning_classifications : ["Awning"],
    classification_overrides:
      config.classification_overrides && typeof config.classification_overrides === "object" ? config.classification_overrides : {},
  };
}

function canonicalFieldName(rawHeader, meta = {}) {
  const normalized = cleanCell(rawHeader)
    .toLowerCase()
    .replace(/#/g, "number")
    .replace(/\+/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (cleanCell(meta.source_sheet_name).toLowerCase() === "master_lookup" && normalized === "width_in") {
    return "carton_1_depth";
  }
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
    if (field === "model_number" && cleanCell(record.part_number)) return false;
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
