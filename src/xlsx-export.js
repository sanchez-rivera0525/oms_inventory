const INVENTORY_SHEET_NAME = "oms_inventory";
const METADATA_SHEET_NAME = "Export Metadata";
const XLSX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const NUMERIC_FIELDS = new Set([
  "carton_1_width",
  "carton_1_depth",
  "carton_1_height",
  "product_weight_lb",
  "pallet_weight_lb",
  "total_product_pallet_weight_lb",
  "gross_weight_lb",
  "cubic_feet",
  "inventory",
  "cost",
  "store_price",
  "retail",
  "q3_2025_retail",
  "source_row_number",
]);

export function buildInventoryXlsxArrayBuffer(XLSX, snapshot) {
  assertXlsxRuntime(XLSX);
  const fields = normalizeFields(snapshot);
  const rows = Array.isArray(snapshot?.rows) ? snapshot.rows : [];
  const inventoryRows = [fields, ...rows.map((row) => fields.map((field) => cellValue(field, row?.[field])))];
  const metadataRows = metadataWorksheetRows(snapshot, fields, rows);

  const workbook = XLSX.utils.book_new();
  const inventorySheet = XLSX.utils.aoa_to_sheet(inventoryRows);
  inventorySheet["!autofilter"] = { ref: rangeRef(fields.length, rows.length + 1) };
  inventorySheet["!cols"] = fields.map((field, index) => ({ wch: columnWidth(field, inventoryRows, index) }));

  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataRows);
  metadataSheet["!cols"] = [{ wch: 28 }, { wch: 80 }];

  XLSX.utils.book_append_sheet(workbook, inventorySheet, INVENTORY_SHEET_NAME);
  XLSX.utils.book_append_sheet(workbook, metadataSheet, METADATA_SHEET_NAME);

  workbook.Props = {
    Title: "OMS Inventory Export",
    Subject: "Audited OMS inventory data",
    Author: "OMS Inventory Console",
    CreatedDate: new Date(),
  };

  return XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  });
}

export function buildInventoryXlsxBlob(XLSX, snapshot) {
  return new Blob([buildInventoryXlsxArrayBuffer(XLSX, snapshot)], { type: XLSX_MIME_TYPE });
}

export function inventoryXlsxFileName(date = new Date()) {
  return `oms_inventory_export_${fileTimestamp(date)}.xlsx`;
}

export { INVENTORY_SHEET_NAME, METADATA_SHEET_NAME, XLSX_MIME_TYPE };

function assertXlsxRuntime(XLSX) {
  if (!XLSX?.utils?.aoa_to_sheet || !XLSX?.utils?.book_new || !XLSX?.utils?.book_append_sheet || !XLSX?.write) {
    throw new Error("XLSX exporter did not load.");
  }
}

function normalizeFields(snapshot) {
  const fields = Array.isArray(snapshot?.fields) ? snapshot.fields : [];
  return [...new Set(fields.map((field) => String(field || "").trim()).filter(Boolean))];
}

function metadataWorksheetRows(snapshot, fields, rows) {
  const metadata = snapshot?.metadata || {};
  return [
    ["Property", "Value"],
    ["exported_at", metadata.exported_at || new Date().toISOString()],
    ["export_source", metadata.export_source || "in_app"],
    ["row_count", rows.length],
    ["field_count", fields.length],
    ["table_name", snapshot?.table_name || "oms_inventory"],
    ["source_file_name", metadata.source_file_name || ""],
    ["source_sheet_name", metadata.source_sheet_name || ""],
    ["generated_at", metadata.generated_at || ""],
  ];
}

function cellValue(field, value) {
  if (Array.isArray(value)) return value.map((item) => cleanCell(item)).filter(Boolean).join("; ");
  const text = cleanCell(value);
  if (!text) return "";
  if (!NUMERIC_FIELDS.has(field)) return text;
  const numeric = Number(text.replace(/[$,\s]/g, ""));
  return Number.isFinite(numeric) ? numeric : text;
}

function cleanCell(value) {
  return String(value ?? "").trim();
}

function columnWidth(field, rows, index) {
  const sample = rows.slice(0, 250);
  const max = sample.reduce((width, row) => Math.max(width, cleanCell(row[index]).length), cleanCell(field).length);
  return Math.max(10, Math.min(44, max + 2));
}

function rangeRef(columnCount, rowCount) {
  const lastColumn = columnName(Math.max(1, columnCount));
  return `A1:${lastColumn}${Math.max(1, rowCount)}`;
}

function columnName(index) {
  let value = index;
  let name = "";
  while (value > 0) {
    const mod = (value - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    value = Math.floor((value - mod) / 26);
  }
  return name;
}

function fileTimestamp(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
