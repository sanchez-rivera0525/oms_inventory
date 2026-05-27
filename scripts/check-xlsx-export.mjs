import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";

import { buildInventoryXlsxArrayBuffer, INVENTORY_SHEET_NAME, METADATA_SHEET_NAME } from "../src/xlsx-export.js";

const require = createRequire(import.meta.url);
const XLSX = require("../vendor/xlsx.full.min.cjs");

const auditFields = ["reviewed_by", "reviewed_at", "edited_by", "edited_at", "data_edit_source"];
const sourcePath = new URL("../data/oms_inventory.json", import.meta.url);
const dataset = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const workbookBytes = buildInventoryXlsxArrayBuffer(XLSX, dataset);

assert(workbookBytes.byteLength > 1000, "XLSX export should produce workbook bytes");

const workbook = XLSX.read(workbookBytes, { type: "array" });
assert.deepEqual(workbook.SheetNames.slice(0, 2), [INVENTORY_SHEET_NAME, METADATA_SHEET_NAME]);

const inventorySheet = workbook.Sheets[INVENTORY_SHEET_NAME];
const rows = XLSX.utils.sheet_to_json(inventorySheet, { header: 1, defval: "" });
const header = rows[0] || [];

assert.equal(rows.length, dataset.rows.length + 1, "inventory worksheet should include every data row plus header");
auditFields.forEach((field) => assert(header.includes(field), `XLSX header missing ${field}`));
assert(header.includes("record_key"), "XLSX header missing record_key");
assert(header.includes("model_number"), "XLSX header missing model_number");

const sourceIndex = header.indexOf("data_edit_source");
assert(rows.slice(1).every((row) => row[sourceIndex]), "XLSX rows should include data_edit_source");

const metadataRows = XLSX.utils.sheet_to_json(workbook.Sheets[METADATA_SHEET_NAME], { header: 1, defval: "" });
const metadataLookup = Object.fromEntries(metadataRows.slice(1).map(([key, value]) => [key, value]));
assert.equal(Number(metadataLookup.row_count), dataset.rows.length, "metadata row_count should match dataset rows");
assert.equal(metadataLookup.table_name, "oms_inventory", "metadata should identify oms_inventory table");

console.log(`XLSX export check passed: ${dataset.rows.length} rows, ${header.length} fields.`);
