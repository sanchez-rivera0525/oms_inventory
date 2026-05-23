const API_DATA_URL = "/api/inventory";
const API_IMPORT_URL = "/api/import";
const API_CONFIG_URL = "/api/config";
const API_NETWORK_URL = "/api/network";

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

const FIELD_LABELS = {
  model_number: "model_number",
  part_number: "part_number",
  description: "description",
  classification: "classification",
  series: "series",
  canopy_color: "canopy_color",
  frame_color: "frame_color",
  carrier_type: "carrier_type",
  shipping_dims: "shipping_dims",
  carton_1_width: "carton_1_width",
  carton_1_depth: "carton_1_depth",
  carton_1_height: "carton_1_height",
  product_weight_lb: "product_weight_lb",
  pallet_weight_lb: "pallet_weight_lb",
  total_product_pallet_weight_lb: "total_product_pallet_weight_lb",
  location: "location",
  inventory: "inventory",
  ships_via: "ships_via",
  stock_status: "stock_status",
  missing_fields: "missing_fields",
  last_updated: "last_updated",
  source_file_name: "source_file_name",
  specs: "specs",
  pictures: "pictures",
  notes: "notes",
};

const LOOKUP_GROUPS = [
  {
    title: "Product Identity",
    fields: ["model_number", "part_number", "description", "classification", "series", "canopy_color", "frame_color"],
  },
  { title: "Inventory", fields: ["inventory", "location", "stock_status"] },
  { title: "Shipping", fields: ["carrier_type", "ships_via", "shipping_dims"] },
  { title: "Carton Dimensions", fields: ["carton_1_width", "carton_1_depth", "carton_1_height"] },
  { title: "Weight", fields: ["product_weight_lb", "pallet_weight_lb", "total_product_pallet_weight_lb"] },
  { title: "Links / Notes", fields: ["specs", "pictures", "notes"] },
  { title: "System / Review", fields: ["missing_fields", "last_updated", "source_file_name"] },
];

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

const els = {
  pageShell: document.querySelector("#pageShell"),
  networkLinks: document.querySelector("#networkLinks"),
  searchInput: document.querySelector("#searchInput"),
  viewPanels: [...document.querySelectorAll("[data-view]")],
  viewLinks: [...document.querySelectorAll("[data-view-link]")],
  awningsSubtitle: document.querySelector("#awningsSubtitle"),
  awningsContent: document.querySelector("#awningsContent"),
  configureAwnings: document.querySelector("#configureAwnings"),
  partsClassFilter: document.querySelector("#partsClassFilter"),
  partsContent: document.querySelector("#partsContent"),
  shippingGroup: document.querySelector("#shippingGroup"),
  shippingContent: document.querySelector("#shippingContent"),
  fileInput: document.querySelector("#fileInput"),
  dropZone: document.querySelector("#dropZone"),
  importSummary: document.querySelector("#importSummary"),
  selectedPanel: document.querySelector("#selectedPanel"),
  selectedSubtitle: document.querySelector("#selectedSubtitle"),
  selectedContent: document.querySelector("#selectedContent"),
  saveStatus: document.querySelector("#saveStatus"),
  awningDialog: document.querySelector("#awningDialog"),
  awningClassList: document.querySelector("#awningClassList"),
  saveAwningConfig: document.querySelector("#saveAwningConfig"),
};

const state = {
  dataset: null,
  query: "",
  view: "awnings",
  selectedKey: "",
  partsClass: "all",
  shippingGroup: "location",
  importSummary: null,
};

init();

async function init() {
  bindEvents();
  state.view = viewFromPath(window.location.pathname);
  fetchNetworkLinks();
  try {
    const dataset = await fetchInventory();
    loadDataset(dataset);
  } catch (error) {
    showFatalError(error.message);
  }
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  els.viewLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setView(link.dataset.viewLink, true);
    });
  });

  window.addEventListener("popstate", () => {
    setView(viewFromPath(window.location.pathname), false);
  });

  els.partsClassFilter.addEventListener("change", (event) => {
    state.partsClass = event.target.value;
    render();
  });

  els.shippingGroup.addEventListener("change", (event) => {
    state.shippingGroup = event.target.value;
    renderShipping();
  });

  document.addEventListener("click", (event) => {
    const selectable = event.target.closest("[data-select-key]");
    if (!selectable) return;
    state.selectedKey = selectable.dataset.selectKey;
    render();
  });

  els.configureAwnings.addEventListener("click", () => {
    renderAwningDialog();
    if (typeof els.awningDialog.showModal === "function") {
      els.awningDialog.showModal();
    } else {
      els.awningDialog.setAttribute("open", "");
    }
  });

  els.saveAwningConfig.addEventListener("click", async () => {
    const checked = [...els.awningClassList.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
    state.dataset.app_config.awning_classifications = checked;
    applyConfigToRows(state.dataset);
    render();
    closeDialog();
    await saveCurrentDataset(API_CONFIG_URL, "Awning classes saved.");
  });

  els.selectedContent.addEventListener("change", async (event) => {
    if (!event.target.matches("#selectedClassification")) return;
    await updateSelectedClassification(event.target.value);
  });

  els.fileInput.addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    await importFile(file);
    event.target.value = "";
  });

  ["dragenter", "dragover"].forEach((type) => {
    els.dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      els.dropZone.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach((type) => {
    els.dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      els.dropZone.classList.remove("dragging");
    });
  });

  els.dropZone.addEventListener("drop", async (event) => {
    const [file] = event.dataTransfer?.files || [];
    if (file) await importFile(file);
  });
}

async function fetchInventory() {
  const response = await fetch(API_DATA_URL, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Unable to load OMS inventory data.");
  return payload;
}

async function fetchNetworkLinks() {
  if (!els.networkLinks) return;
  try {
    const response = await fetch(API_NETWORK_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Network links unavailable");
    const payload = await response.json();
    const links = payload.urls || [];
    const phoneLink = links.find((item) => item.kind === "web") || links.find((item) => item.kind === "lan") || links[0];
    if (!phoneLink) return;
    els.networkLinks.innerHTML = `
      <span>Phone</span>
      <a href="${escapeAttr(phoneLink.url)}" target="_blank" rel="noreferrer">${escapeHtml(phoneLink.url)}</a>
    `;
  } catch (_error) {
    els.networkLinks.innerHTML = `<span>Phone</span><span>Run on same Wi-Fi</span>`;
  }
}

function loadDataset(dataset) {
  state.dataset = normalizeDataset(dataset);
  state.selectedKey = state.dataset.rows[0]?.record_key || "";
  populateClassFilters();
  render();
}

function normalizeDataset(dataset) {
  let normalized;
  if (dataset?.table_name === "oms_inventory" && Array.isArray(dataset.rows)) {
    normalized = {
      ...dataset,
      table_name: "oms_inventory",
      fields: mergeUnique([...(dataset.fields || []), ...OUTPUT_FIELDS]),
      required_searchable_fields: dataset.required_searchable_fields || REQUIRED_FIELDS,
      app_config: normalizeConfig(dataset.app_config),
      rows: dataset.rows.map((row, index) => normalizeRecordObject(row, index + 2, dataset.metadata || {})),
    };
  } else if (Array.isArray(dataset)) {
    const meta = { source_file_name: "Uploaded JSON", source_sheet_name: "oms_inventory", generated_at: new Date().toISOString() };
    normalized = makeDataset(dataset.map((row, index) => normalizeRecordObject(row, index + 2, meta)), meta);
  } else {
    throw new Error("Inventory JSON must contain an oms_inventory dataset or an array of records.");
  }

  normalized.rows = assignRecordKeys(normalized.rows);
  applyConfigToRows(normalized);
  return normalized;
}

function normalizeConfig(config = {}) {
  config = config || {};
  return {
    awning_classifications: Array.isArray(config.awning_classifications) ? config.awning_classifications : ["Awning"],
    classification_overrides:
      config.classification_overrides && typeof config.classification_overrides === "object" ? config.classification_overrides : {},
  };
}

function makeDataset(rows, meta, sourceHeaderMap = {}, missingSourceHeaders = [], config = null) {
  const dataset = {
    table_name: "oms_inventory",
    metadata: {
      purpose: "Warehouse-style lookup app for Advaning OMS inventory data.",
      source_sheet_name: meta.source_sheet_name || "OMS_inventory",
      source_file_name: meta.source_file_name || "Uploaded file",
      generated_at: meta.generated_at || new Date().toISOString(),
      source_rule: "One normalized oms_inventory table; UI sections are filters over the same records.",
      classification_rule: "Awnings are controlled by app_config.awning_classifications. All other sections filter the same rows.",
    },
    app_config: normalizeConfig(config),
    required_searchable_fields: REQUIRED_FIELDS,
    fields: OUTPUT_FIELDS,
    source_header_map: sourceHeaderMap,
    missing_source_headers: missingSourceHeaders,
    rows: assignRecordKeys(rows),
  };
  applyConfigToRows(dataset);
  return dataset;
}

function normalizeRecordObject(input, sourceRowNumber, meta = {}) {
  const record = {};
  OUTPUT_FIELDS.forEach((field) => {
    record[field] = Array.isArray(input[field]) ? input[field] : cleanCell(input[field]);
  });

  record.model_number = cleanCell(record.model_number);
  record.source_classification = cleanCell(record.source_classification || record.classification);
  record.classification = cleanCell(record.classification || record.source_classification);
  record.description = cleanCell(record.description || record.canopy_color);
  record.part_number = cleanCell(record.part_number || (record.classification.toLowerCase() === "awning" ? "" : record.model_number));
  record.shipping_dims = cleanCell(record.shipping_dims || makeShippingDims(record));
  fillCartonDimsFromShippingDims(record);
  record.last_updated = cleanCell(record.last_updated || meta.generated_at || new Date().toISOString());
  record.source_file_name = cleanCell(record.source_file_name || meta.source_file_name || "Unknown source");
  record.source_sheet_name = cleanCell(record.source_sheet_name || meta.source_sheet_name || "OMS_inventory");
  record.source_row_number = Number(record.source_row_number || sourceRowNumber || 0);
  record.manual_classification = Boolean(input.manual_classification);
  record.match_key = cleanCell(record.part_number || record.model_number || `row_${record.source_row_number}`);
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
    row.match_key = base;
    row.record_key = counts.get(normalized) > 1 ? `${base}__row_${row.source_row_number || occurrence}` : base;
    return row;
  });
}

function applyConfigToRows(dataset) {
  dataset.app_config = normalizeConfig(dataset.app_config);
  dataset.rows.forEach((row) => {
    const override = dataset.app_config.classification_overrides[row.record_key];
    row.classification = cleanCell(override || row.source_classification || row.classification);
    row.manual_classification = Boolean(override);
    refreshRowDerived(row, dataset.app_config);
  });
  dataset.summary = summarizeRows(dataset.rows);
  dataset.fields = mergeUnique([...(dataset.fields || []), ...OUTPUT_FIELDS]);
}

function refreshRowDerived(row, config) {
  row.stock_status = stockStatus(row.inventory);
  row.warehouse_category = warehouseCategory(row.classification, config);
  row.missing_fields = requiredMissingFields(row);
  row.review_needed = row.missing_fields.length > 0 || row.warehouse_category === "Unknown / Review Needed";
  row.review_notes = reviewNotes(row);
}

function populateClassFilters() {
  const classes = getClassificationOptions();
  els.partsClassFilter.innerHTML = [
    `<option value="all">All non-awning classes</option>`,
    ...classes.map((classification) => `<option value="${escapeAttr(classification)}">${escapeHtml(classification)}</option>`),
  ].join("");
}

function setView(view, push) {
  state.view = view;
  if (push) history.pushState({}, "", routeForView(view));
  render();
}

function render() {
  if (!state.dataset) return;
  document.body.dataset.currentView = state.view;
  els.pageShell.dataset.currentView = state.view;
  els.searchInput.value = state.query;
  els.viewPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.view === state.view));
  els.viewLinks.forEach((link) => link.classList.toggle("active", link.dataset.viewLink === state.view));

  renderAwnings();
  renderParts();
  renderShipping();
  renderImportSummary();
  renderSelected();
}

function renderAwnings() {
  const awningClasses = state.dataset.app_config.awning_classifications || [];
  els.awningsSubtitle.textContent = `Items in classifications marked as awnings. ${state.dataset.summary.total_records.toLocaleString()} total records loaded.`;

  if (!awningClasses.length) {
    els.awningsContent.innerHTML = `
      <div class="empty-state">
        No awning classifications configured. Click <strong>Configure awning classes</strong> above to pick which Class codes are awnings.
      </div>
    `;
    return;
  }

  const rows = sortRows(filteredRows(state.dataset.rows.filter((row) => row.warehouse_category === "Awnings")));
  if (state.view === "awnings") syncSelection(rows);
  els.awningsContent.innerHTML = `${renderSummaryStrip(rows)}${renderInventoryTable(rows, "No awning items found.")}`;
}

function renderParts() {
  const rows = sortRows(
    filteredRows(
      state.dataset.rows.filter((row) => row.warehouse_category !== "Awnings" && (state.partsClass === "all" || row.classification === state.partsClass)),
    ),
  );
  if (state.view === "parts") syncSelection(rows);
  els.partsContent.innerHTML = `${renderSummaryStrip(rows)}${renderInventoryTable(rows, "No items found.")}`;
}

function renderShipping() {
  const rows = filteredRows(state.dataset.rows).sort((a, b) => {
    const group = state.shippingGroup;
    return (
      cleanCell(a[group]).localeCompare(cleanCell(b[group])) ||
      cleanCell(a.location).localeCompare(cleanCell(b.location)) ||
      cleanCell(a.model_number || a.part_number).localeCompare(cleanCell(b.model_number || b.part_number))
    );
  });
  if (state.view === "shipping") syncSelection(rows);
  els.shippingContent.innerHTML = renderShippingTable(rows);
}

function renderSummaryStrip(rows) {
  const summary = summarizeRows(rows);
  const values = [
    ["Records", summary.total_records],
    ["Stock Units", summary.stock_units],
    ["In Stock", rows.filter((row) => row.stock_status === "In Stock").length],
    ["Review", summary.needing_review],
  ];
  return `
    <div class="summary-strip">
      ${values
        .map(
          ([label, value]) => `
            <div class="summary-tile">
              <span>${escapeHtml(label)}</span>
              <strong>${Number(value).toLocaleString()}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderInventoryTable(rows, emptyText) {
  if (!rows.length) return `<div class="empty-state">${escapeHtml(emptyText)}</div>`;
  return `
    <div class="table-wrap">
      <div class="table-note">${rows.length.toLocaleString()} matching records. Select a row to view details.</div>
      <table>
        <thead>
          <tr>
            <th>Model / Part</th>
            <th>Description</th>
            <th>Class</th>
            <th>Series</th>
            <th>Color</th>
            <th>Dims</th>
            <th>Links</th>
            <th>Qty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr class="${row.record_key === state.selectedKey ? "selected" : ""}" data-select-key="${escapeAttr(row.record_key)}">
                  <td class="model-cell">${escapeHtml(row.model_number || row.part_number || "Missing model")}</td>
                  <td>${escapeHtml(row.description || "-")}</td>
                  <td><span class="badge ${row.review_needed ? "review" : ""}">${escapeHtml(row.classification || "Review")}</span></td>
                  <td>${escapeHtml(row.series || "-")}</td>
                  <td>${escapeHtml(compactJoin([row.canopy_color, row.frame_color], " / ") || "-")}</td>
                  <td>${escapeHtml(row.shipping_dims || "-")}</td>
                  <td>${renderLinkBadges(row)}</td>
                  <td>${escapeHtml(row.inventory || "0")}</td>
                  <td><span class="status ${statusClass(row.stock_status)}">${escapeHtml(row.stock_status)}</span></td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderShippingTable(rows) {
  if (!rows.length) return `<div class="empty-state">No shipping records found.</div>`;
  let currentGroup = "";
  const groupField = state.shippingGroup;
  const rowHtml = rows
    .map((row) => {
      const groupValue = cleanCell(row[groupField]) || "Unassigned";
      const groupHeader =
        groupValue !== currentGroup
          ? ((currentGroup = groupValue),
            `<tr class="group-row"><td colspan="9">${escapeHtml(labelForField(groupField))}: ${escapeHtml(groupValue)}</td></tr>`)
          : "";
      return `
        ${groupHeader}
        <tr class="${row.record_key === state.selectedKey ? "selected" : ""}" data-select-key="${escapeAttr(row.record_key)}">
          <td>${escapeHtml(row.location || "-")}</td>
          <td class="model-cell">${escapeHtml(row.model_number || row.part_number || "-")}</td>
          <td>${escapeHtml(row.description || "-")}</td>
          <td>${escapeHtml(row.carrier_type || "-")}</td>
          <td>${escapeHtml(row.ships_via || "-")}</td>
          <td>${escapeHtml(row.shipping_dims || "-")}</td>
          <td>${escapeHtml(row.product_weight_lb || "-")}</td>
          <td>${renderLinkBadges(row)}</td>
          <td>${escapeHtml(row.inventory || "0")}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="table-wrap">
      <div class="table-note">${rows.length.toLocaleString()} matching records. Grouped by ${escapeHtml(labelForField(groupField))}.</div>
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Model</th>
            <th>Description</th>
            <th>Carrier</th>
            <th>Ships Via</th>
            <th>Dims</th>
            <th>Wt (lb)</th>
            <th>Links</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>${rowHtml}</tbody>
      </table>
    </div>
  `;
}

function renderSelected() {
  const row = selectedRow();
  if (!row) {
    els.selectedSubtitle.textContent = "Choose an inventory item.";
    els.selectedContent.innerHTML = `<div class="empty-state">No selected item.</div>`;
    return;
  }

  els.selectedSubtitle.textContent = `${row.model_number || row.part_number} / ${row.warehouse_category}`;
  els.selectedContent.innerHTML = `
    <div class="lookup-groups">
      ${renderClassificationEditor(row)}
      ${LOOKUP_GROUPS.map((group) => renderFieldGroup(group.title, group.fields, row)).join("")}
    </div>
  `;
}

function renderClassificationEditor(row) {
  const options = getClassificationOptions(row.classification);
  return `
    <section class="lookup-group">
      <h3>Classification Control</h3>
      <div class="field-row">
        <div class="field-name">classification_dropdown</div>
        <div class="field-value classification-editor">
          <select id="selectedClassification" aria-label="Selected item classification">
            ${options
              .map(
                (classification) => `
                  <option value="${escapeAttr(classification)}" ${classification === row.classification ? "selected" : ""}>
                    ${escapeHtml(classification || "Blank / Review Needed")}
                  </option>
                `,
              )
              .join("")}
          </select>
          <span class="muted">${row.manual_classification ? "Manual classification saved." : "Using source file classification."}</span>
        </div>
      </div>
    </section>
  `;
}

function renderFieldGroup(title, fields, row) {
  return `
    <section class="lookup-group">
      <h3>${escapeHtml(title)}</h3>
      ${fields
        .map(
          (field) => `
            <div class="field-row">
              <div class="field-name">${escapeHtml(FIELD_LABELS[field] || field)}</div>
              <div class="field-value">${formatFieldValue(row[field])}</div>
            </div>
          `,
        )
        .join("")}
    </section>
  `;
}

function renderImportSummary() {
  if (!state.importSummary) {
    els.importSummary.innerHTML = `<div class="empty-state">No import run yet.</div>`;
    return;
  }
  if (state.importSummary.error) {
    els.importSummary.innerHTML = `<div class="review-list">${escapeHtml(state.importSummary.error)}</div>`;
    return;
  }

  const summary = state.importSummary;
  const cards = [
    ["Added", summary.records_added],
    ["Updated", summary.records_updated],
    ["Unchanged", summary.records_unchanged],
    ["Removed", summary.records_removed],
    ["Review", summary.records_needing_review],
    ["Missing fields", summary.missing_required_fields_total],
  ];
  const reviewLines = [
    summary.saved ? `Saved ${summary.source_file_name} to the OMS inventory store.` : "",
    summary.confirmation_item ? `Confirmed ${summary.confirmation_item.model_number}: ${summary.confirmation_item.description}` : "",
    ...(summary.missing_required_headers || []).map((field) => `Missing header: ${field}`),
    ...(summary.duplicate_keys || []).slice(0, 40).map((key) => `Duplicate key retained for review: ${key}`),
    ...(summary.review_items || []).slice(0, 80),
  ].filter(Boolean);

  els.importSummary.innerHTML = `
    <div class="import-grid">
      ${cards
        .map(
          ([label, value]) => `
            <div class="import-card">
              <span>${escapeHtml(label)}</span>
              <strong>${Number(value || 0).toLocaleString()}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
    ${reviewLines.length ? `<div class="review-list">${reviewLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>` : ""}
  `;
}

function renderAwningDialog() {
  const configured = new Set(state.dataset.app_config.awning_classifications || []);
  els.awningClassList.innerHTML = getClassificationOptions()
    .map(
      (classification) => `
        <label class="class-option">
          <input type="checkbox" value="${escapeAttr(classification)}" ${configured.has(classification) ? "checked" : ""} />
          <span>${escapeHtml(classification || "Blank / Review Needed")}</span>
        </label>
      `,
    )
    .join("");
}

async function updateSelectedClassification(classification) {
  const row = selectedRow();
  if (!row) return;
  const overrides = state.dataset.app_config.classification_overrides;
  if (classification === row.source_classification) {
    delete overrides[row.record_key];
  } else {
    overrides[row.record_key] = classification;
  }
  applyConfigToRows(state.dataset);
  render();
  await saveCurrentDataset(API_CONFIG_URL, "Classification saved.");
}

async function importFile(file) {
  setSaveStatus(`Importing ${file.name}...`);
  try {
    const incomingRaw = await datasetFromFile(file);
    const next = normalizeDataset({
      ...incomingRaw,
      app_config: state.dataset?.app_config || normalizeConfig(),
    });
    const summary = summarizeReplacementImport(state.dataset, next);
    state.dataset = next;
    state.selectedKey = next.rows.find((row) => row.model_number === "EAF1310-A445H3")?.record_key || next.rows[0]?.record_key || "";
    state.importSummary = summary;
    populateClassFilters();
    render();
    await saveCurrentDataset(API_IMPORT_URL, "Import saved.", summary);
    state.importSummary = { ...summary, saved: true };
    renderImportSummary();
  } catch (error) {
    state.importSummary = { error: error.message };
    setSaveStatus("Import failed.");
    renderImportSummary();
  }
}

async function saveCurrentDataset(url, successMessage, importSummary = null) {
  try {
    setSaveStatus("Saving...");
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset: state.dataset, import_summary: importSummary }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Save failed.");
    if (payload.dataset) {
      const selected = state.selectedKey;
      state.dataset = normalizeDataset(payload.dataset);
      state.selectedKey = state.dataset.rows.some((row) => row.record_key === selected) ? selected : state.dataset.rows[0]?.record_key || "";
      populateClassFilters();
      render();
    }
    setSaveStatus(successMessage);
  } catch (error) {
    setSaveStatus(error.message);
  }
}

async function datasetFromFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (extension === "json") return normalizeDataset(JSON.parse(await file.text()));
  if (extension === "csv") return makeDatasetFromAoa(parseCsv(await file.text()), file.name, "OMS_inventory");
  if (!window.XLSX) throw new Error("Spreadsheet parser did not load.");

  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName = workbook.SheetNames.includes("OMS_inventory")
    ? "OMS_inventory"
    : workbook.SheetNames.includes("oms_inventory")
      ? "oms_inventory"
      : "";
  if (!sheetName) throw new Error("Workbook must include one OMS_inventory sheet.");
  const aoa = window.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "", blankrows: false });
  return makeDatasetFromAoa(aoa, file.name, sheetName);
}

function makeDatasetFromAoa(aoa, sourceFileName, sourceSheetName) {
  if (!aoa.length) throw new Error("Uploaded OMS inventory file is empty.");
  const headers = normalizeHeaders(aoa[0]);
  const missingCore = ["model_number", "description", "classification"].filter((field) => !headers.canonicalHeaders.includes(field));
  if (missingCore.length) throw new Error(`Missing required source headers: ${missingCore.join(", ")}`);

  const meta = {
    source_file_name: sourceFileName,
    source_sheet_name: sourceSheetName,
    generated_at: new Date().toISOString(),
  };
  const rows = aoa
    .slice(1)
    .map((row, index) => {
      const record = {};
      headers.canonicalHeaders.forEach((field, column) => {
        record[field] = cleanCell(row[column]);
      });
      return normalizeRecordObject(record, index + 2, meta);
    })
    .filter((record) => record.model_number || record.part_number);

  return makeDataset(rows, meta, headers.sourceHeaderMap, headers.missingSourceHeaders);
}

function normalizeHeaders(headerRow) {
  const canonicalHeaders = [];
  const sourceHeaderMap = {};
  const seen = new Map();
  headerRow.forEach((rawHeader, index) => {
    const raw = cleanCell(rawHeader) || `Column ${index + 1}`;
    const base = canonicalFieldName(raw);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    const canonical = count ? `${base}_${count + 1}` : base;
    canonicalHeaders.push(canonical);
    sourceHeaderMap[canonical] = raw;
  });
  const missingSourceHeaders = REQUIRED_FIELDS.filter((field) => field !== "part_number" && !canonicalHeaders.includes(field));
  return { canonicalHeaders, sourceHeaderMap, missingSourceHeaders };
}

function summarizeReplacementImport(currentDataset, incomingDataset) {
  const currentBuckets = new Map();
  (currentDataset?.rows || []).forEach((row) => {
    const key = normalizeKey(row.match_key || row.part_number || row.model_number);
    if (!currentBuckets.has(key)) currentBuckets.set(key, []);
    currentBuckets.get(key).push(row);
  });

  const incomingKeyCounts = new Map();
  incomingDataset.rows.forEach((row) => {
    const key = normalizeKey(row.match_key || row.part_number || row.model_number);
    incomingKeyCounts.set(key, (incomingKeyCounts.get(key) || 0) + 1);
  });

  let recordsAdded = 0;
  let recordsUpdated = 0;
  let recordsUnchanged = 0;
  let recordsNeedingReview = 0;
  let missingRequiredFieldsTotal = 0;
  const reviewItems = [];

  incomingDataset.rows.forEach((row) => {
    const key = normalizeKey(row.match_key || row.part_number || row.model_number);
    const bucket = currentBuckets.get(key) || [];
    const existing = bucket.shift();
    if (!existing) recordsAdded += 1;
    else if (hasRecordChanges(existing, row)) recordsUpdated += 1;
    else recordsUnchanged += 1;

    if (row.review_needed) recordsNeedingReview += 1;
    if (row.missing_fields?.length) {
      missingRequiredFieldsTotal += row.missing_fields.length;
      reviewItems.push(`${row.match_key}: missing ${row.missing_fields.join(", ")}.`);
    }
  });

  const recordsRemoved = [...currentBuckets.values()].reduce((total, rows) => total + rows.length, 0);
  const duplicateKeys = [...incomingKeyCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key, count]) => `${key} (${count})`);
  const confirmation = incomingDataset.rows.find((row) => row.model_number === "EAF1310-A445H3");

  return {
    records_added: recordsAdded,
    records_updated: recordsUpdated,
    records_unchanged: recordsUnchanged,
    records_removed: recordsRemoved,
    records_needing_review: recordsNeedingReview,
    missing_required_fields_total: missingRequiredFieldsTotal,
    missing_required_headers: incomingDataset.missing_source_headers || [],
    duplicate_keys: duplicateKeys,
    review_items: reviewItems,
    source_file_name: incomingDataset.metadata.source_file_name,
    confirmation_item: confirmation
      ? {
          model_number: confirmation.model_number,
          description: compactJoin([confirmation.description, confirmation.canopy_color], " / "),
        }
      : null,
  };
}

function filteredRows(rows) {
  const query = normalizeSearch(state.query);
  const fields = state.dataset.required_searchable_fields || REQUIRED_FIELDS;
  if (!query) return [...rows];
  return rows.filter((row) => fields.some((field) => normalizeSearch(row[field]).includes(query)));
}

function sortRows(rows) {
  const query = normalizeSearch(state.query);
  const fields = state.dataset.required_searchable_fields || REQUIRED_FIELDS;
  return [...rows].sort((a, b) => {
    return (
      scoreRow(b, query, fields) - scoreRow(a, query, fields) ||
      cleanCell(a.model_number || a.part_number).localeCompare(cleanCell(b.model_number || b.part_number))
    );
  });
}

function syncSelection(rows) {
  if (!rows.length) {
    state.selectedKey = "";
    return;
  }
  if (!rows.some((row) => row.record_key === state.selectedKey)) state.selectedKey = rows[0].record_key;
}

function scoreRow(row, query, fields) {
  if (!query) return numeric(row.inventory);
  let score = 0;
  fields.forEach((field) => {
    const value = normalizeSearch(row[field]);
    if (value === query) score += 120;
    else if (value.startsWith(query)) score += 70;
    else if (value.includes(query)) score += 28;
  });
  return score;
}

function selectedRow() {
  return state.dataset?.rows.find((row) => row.record_key === state.selectedKey) || null;
}

function getClassificationOptions(extra = "") {
  return mergeUnique([
    ...state.dataset.rows.map((row) => cleanCell(row.classification || row.source_classification)).filter(Boolean),
    ...Object.values(CATEGORY_CLASSIFICATIONS).flat(),
    "Awning",
    "Accessory",
    "Part",
    "Unknown / Review Needed",
    cleanCell(extra),
  ])
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function hasRecordChanges(existing, incoming) {
  return REQUIRED_FIELDS.some((field) => cleanComparable(existing[field]) !== cleanComparable(incoming[field]));
}

function summarizeRows(rows) {
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
    (row.missing_fields || []).forEach((field) => {
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

function warehouseCategory(classification, config) {
  const raw = cleanCell(classification);
  const value = raw.toLowerCase();
  const awningClasses = new Set((config?.awning_classifications || ["Awning"]).map((item) => cleanCell(item).toLowerCase()));
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
  const count = numeric(text);
  if (count > 0) return "In Stock";
  if (count === 0) return "Out of Stock";
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
  if (record.missing_fields?.length) notes.push(`Missing: ${record.missing_fields.join(", ")}`);
  if (record.warehouse_category === "Unknown / Review Needed") notes.push("Classification needs review.");
  return notes.join(" ");
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function viewFromPath(pathname) {
  if (pathname.includes("parts")) return "parts";
  if (pathname.includes("shipping")) return "shipping";
  if (pathname.includes("import")) return "import";
  return "awnings";
}

function routeForView(view) {
  return view === "awnings" ? "/awnings" : `/${view}`;
}

function closeDialog() {
  if (typeof els.awningDialog.close === "function") els.awningDialog.close();
  else els.awningDialog.removeAttribute("open");
}

function setSaveStatus(text) {
  els.saveStatus.textContent = text;
  if (text) {
    window.clearTimeout(setSaveStatus.timer);
    setSaveStatus.timer = window.setTimeout(() => {
      if (els.saveStatus.textContent === text) els.saveStatus.textContent = "";
    }, 4500);
  }
}

function showFatalError(message) {
  els.awningsContent.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
  els.selectedContent.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function statusClass(status) {
  if (status === "In Stock") return "in";
  if (status === "Out of Stock") return "out";
  return "review";
}

function labelForField(field) {
  return FIELD_LABELS[field] || field;
}

function renderLinkBadges(row) {
  const links = linkFields(row);
  if (!links.length) return "-";
  return links
    .map(
      (link) =>
        `<a class="link-badge" href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`,
    )
    .join("");
}

function linkFields(row) {
  return [
    ...extractLinks(row.specs, "Specs"),
    ...extractLinks(row.pictures, "Pictures"),
    ...extractLinks(row.notes, "Notes"),
  ];
}

function extractLinks(value, label) {
  const text = cleanCell(value);
  if (!text) return [];
  const matches = text.match(/https?:\/\/[^\s,;]+/gi) || [];
  return matches.map((url, index) => ({ label: matches.length > 1 ? `${label} ${index + 1}` : label, url }));
}

function formatFieldValue(value) {
  if (Array.isArray(value)) return value.length ? escapeHtml(value.join(", ")) : "-";
  const text = cleanCell(value);
  if (!text) return "-";
  const links = extractLinks(text, "Open");
  if (links.length) {
    const linked = links.reduce((html, link) => {
      return html.replace(
        escapeHtml(link.url),
        `<a href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.url)}</a>`,
      );
    }, escapeHtml(text));
    return linked;
  }
  return escapeHtml(text);
}

function compactJoin(values, separator) {
  return values.map(cleanCell).filter(Boolean).join(separator);
}

function mergeUnique(values) {
  const seen = new Set();
  const output = [];
  values.forEach((value) => {
    const text = cleanCell(value);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) return;
    seen.add(key);
    output.push(text);
  });
  return output;
}

function cleanCell(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function cleanComparable(value) {
  return cleanCell(value).toLowerCase();
}

function normalizeSearch(value) {
  return cleanCell(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeKey(value) {
  return cleanCell(value).toLowerCase();
}

function numeric(value) {
  const parsed = Number(cleanCell(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
