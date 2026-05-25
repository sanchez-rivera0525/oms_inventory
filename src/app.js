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
  "item_type",
  "series_code",
  "source_status",
  "department",
  "unit",
  "oem",
  "brand",
  "cost",
  "gross_weight_lb",
  "cubic_feet",
  "pallet_size",
  "retail",
  "q3_2025_retail",
  "specs",
  "pictures",
  "notes",
  "notes2",
];

const OUTPUT_FIELDS = [...REQUIRED_FIELDS, ...EXTRA_FIELDS];

const SEARCH_FIELDS = [
  "model_number",
  "description",
  "classification",
  "canopy_color",
  "frame_color",
  "series",
  "carrier_type",
  "notes",
];

const SKU_SEARCH_FIELDS = ["model_number", "part_number"];
const DESCRIPTION_SEARCH_FIELDS = ["description"];
const OPS_SEARCH_FIELDS = [
  "classification",
  "item_type",
  "canopy_color",
  "frame_color",
  "series",
  "series_code",
  "carrier_type",
  "notes",
  "notes2",
  "warehouse_category",
];

const KEY_DATA_FIELDS = ["carrier_type", "shipping_dims", "product_weight_lb", "inventory"];
const GROUPED_CONTEXT_FIELDS = ["classification", "item_type", "series", "series_code", "source_status", "department", "unit"];
const RELATION_STOP_WORDS = new Set([
  "and",
  "for",
  "with",
  "the",
  "from",
  "this",
  "that",
  "awning",
  "product",
  "dims",
  "inch",
  "inches",
  "wide",
  "color",
]);

const QUICK_FILTER_LABELS = {
  all: "All SKUs",
  awnings: "Awning SKUs",
  parts: "Parts / Accessories",
  key_gaps: "Cannot Ship",
  missing_dims: "Missing Shipping Dims",
  pending_carrier: "Pending Carrier",
  oversized: "Freight Review",
  duplicates: "Duplicate SKUs",
  demo_ready: "Ready to Ship",
};

const BLANK_DISPLAY = "—";
const PLACEHOLDER_VALUES = new Set(["data pending verification", "pending verification", "needs verification", "n/a", "na", "tbd"]);

const EDITABLE_FIELDS = [
  { field: "carton_1_width", label: "Width", type: "number", group: "Ship Dims" },
  { field: "carton_1_depth", label: "Depth", type: "number", group: "Ship Dims" },
  { field: "carton_1_height", label: "Height", type: "number", group: "Ship Dims" },
  { field: "shipping_dims", label: "Shipping dims", type: "text", group: "Ship Dims" },
  { field: "product_weight_lb", label: "Product weight", type: "number", group: "Ship Weight" },
  { field: "gross_weight_lb", label: "Gross weight", type: "number", group: "Ship Weight" },
  { field: "pallet_weight_lb", label: "Pallet weight", type: "number", group: "Ship Weight" },
  { field: "total_product_pallet_weight_lb", label: "Total pallet weight", type: "number", group: "Ship Weight" },
  { field: "carrier_type", label: "Carrier", type: "text", group: "Shipping" },
  { field: "ships_via", label: "Ships via", type: "text", group: "Shipping" },
  { field: "location", label: "Location", type: "text", group: "Shipping" },
  { field: "inventory", label: "On hand", type: "number", group: "Shipping" },
  { field: "cost", label: "Cost", type: "text", group: "Costing" },
  { field: "pictures", label: "Image link", type: "url", group: "Ops Notes" },
  { field: "notes", label: "Notes", type: "textarea", group: "Ops Notes" },
];

const COMPARE_SECTIONS = [
  {
    title: "Product Lookup",
    label: "Product Lookup Table:",
    fields: [
      { id: "model_number", label: "model_number" },
      { id: "inventory", label: "inventory", type: "number" },
      { id: "cost", label: "cost", type: "currency" },
      { id: "pictures", label: "pictures", type: "link" },
    ],
  },
  {
    title: "Product Weight",
    fields: [
      { id: "product_weight_lb", label: "product_weight_lbs", type: "number" },
      { id: "gross_weight_lb", label: "gross_weight", type: "number" },
      { id: "pallet_size", label: "pallet_size" },
      { id: "pallet_weight_lb", label: "pallet_weight", type: "number" },
      { id: "total_product_pallet_weight_lb", label: "total_product_plus_pallet_weight", type: "number" },
    ],
  },
  {
    title: "Description",
    fields: [
      { id: "model_number", label: "model_number" },
      { id: "series", label: "series" },
      { id: "description", label: "description" },
      { id: "classification", label: "classification" },
      { id: "canopy_color", label: "canopy_color / color" },
      { id: "frame_color", label: "frame_color" },
    ],
  },
  {
    title: "Shipping",
    fields: [
      { id: "carrier_type", label: "carrier_type", verify: true },
      { id: "ships_via", label: "ships_via", verify: true },
      { id: "carton_1_width", label: "width_in", type: "number" },
      { id: "carton_1_depth", label: "depth_in", type: "number" },
      { id: "carton_1_height", label: "height_in", type: "number" },
      { id: "cubic_feet", label: "cubic_ft", type: "number" },
      { id: "shipping_dims", label: "shipping_dims", type: "dimensions", verify: true },
      { id: "notes", label: "notes", verify: true },
    ],
  },
  {
    title: "Load Totals",
    fields: [
      { id: "item_cost", label: "item_cost", type: "computedCurrency" },
      { id: "normalized_load_weight", label: "ship_weight_used", type: "computedWeight" },
      { id: "stock_status", label: "stock_status" },
      { id: "key_data_gaps", label: "ship_blockers", type: "keyGaps" },
    ],
  },
];

const COMPARE_FIELDS = COMPARE_SECTIONS.flatMap((section) => section.fields);

const FIELD_LABELS = {
  model_number: "Model",
  part_number: "Part",
  description: "Description",
  classification: "Class",
  warehouse_category: "Category",
  series: "Series",
  canopy_color: "Canopy",
  frame_color: "Frame",
  carrier_type: "Carrier",
  ships_via: "Ships via",
  shipping_dims: "Dims",
  carton_1_width: "W",
  carton_1_depth: "D",
  carton_1_height: "H",
  product_weight_lb: "Product lb",
  gross_weight_lb: "Gross lb",
  pallet_weight_lb: "Pallet lb",
  total_product_pallet_weight_lb: "Total pallet lb",
  location: "Location",
  inventory: "Qty",
  stock_status: "Status",
  item_type: "Type",
  series_code: "Series code",
  source_status: "Source status",
  department: "Dept",
  unit: "Unit",
  cost: "Cost",
  pictures: "Image link",
  notes: "Notes",
  notes2: "Notes 2",
};

const HEADER_ALIASES = new Map(
  Object.entries({
    classification: "classification",
    type: "item_type",
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
    model: "model_number",
    item_no: "part_number",
    item_number: "part_number",
    itemno: "part_number",
    part_number: "part_number",
    part: "part_number",
    part_no: "part_number",
    part_number_alt: "part_number",
    description: "description",
    normalized_description: "description",
    oms_description1: "specs",
    oms_description2: "notes",
    canopy_color_color: "canopy_color",
    canopy_color: "canopy_color",
    color: "canopy_color",
    frame_color: "frame_color",
    cost: "cost",
    advaning_price: "cost",
    oms_price: "retail",
    qty_price1: "retail",
    carrier_type: "carrier_type",
    carrier: "carrier_type",
    product_weight_lb: "product_weight_lb",
    product_weight_lbs: "product_weight_lb",
    qty_wt: "product_weight_lb",
    qty_weight: "product_weight_lb",
    gross_weight_lb: "gross_weight_lb",
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
    shipping_dims: "shipping_dims",
    shipping_dimensions: "shipping_dims",
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
  quickStats: document.querySelector("#quickStats"),
  searchSubtitle: document.querySelector("#searchSubtitle"),
  searchPills: document.querySelector("#searchPills"),
  searchContent: document.querySelector("#searchContent"),
  compareSubtitle: document.querySelector("#compareSubtitle"),
  compareContent: document.querySelector("#compareContent"),
  editSubtitle: document.querySelector("#editSubtitle"),
  editContent: document.querySelector("#editContent"),
  reflectSubtitle: document.querySelector("#reflectSubtitle"),
  reflectContent: document.querySelector("#reflectContent"),
  fileInput: document.querySelector("#fileInput"),
  dropZone: document.querySelector("#dropZone"),
  importSummary: document.querySelector("#importSummary"),
  detailPanel: document.querySelector("#detailPanel"),
  selectedSubtitle: document.querySelector("#selectedSubtitle"),
  selectedContent: document.querySelector("#selectedContent"),
  compareTray: document.querySelector("#compareTray"),
  saveStatus: document.querySelector("#saveStatus"),
};

const state = {
  dataset: null,
  query: "",
  view: "search",
  quickFilter: "all",
  selectedKey: "",
  compareKeys: [],
  editDraft: null,
  editDirty: false,
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
    if (searchNeedle(state.query).normalized) state.quickFilter = "all";
    if (!["search", "compare", "reflect"].includes(state.view)) setView("search", true);
    render();
  });

  els.viewLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setView(link.dataset.viewLink, true);
    });
  });

  window.addEventListener("popstate", () => setView(viewFromPath(window.location.pathname), false));

  document.addEventListener("click", async (event) => {
    const compareToggle = event.target.closest("[data-compare-key]");
    if (compareToggle) {
      event.preventDefault();
      event.stopPropagation();
      toggleCompare(compareToggle.dataset.compareKey);
      return;
    }

    const compareRemove = event.target.closest("[data-remove-compare-key]");
    if (compareRemove) {
      event.preventDefault();
      removeCompare(compareRemove.dataset.removeCompareKey);
      return;
    }

    const clearCompare = event.target.closest("[data-clear-compare]");
    if (clearCompare) {
      event.preventDefault();
      state.compareKeys = [];
      render();
      return;
    }

    const quickFilter = event.target.closest("[data-quick-filter]");
    if (quickFilter) {
      event.preventDefault();
      setQuickFilter(quickFilter.dataset.quickFilter);
      return;
    }

    const copySummary = event.target.closest("[data-copy-summary]");
    if (copySummary) {
      event.preventDefault();
      await copySelectedSummary();
      return;
    }

    const saveEdit = event.target.closest("[data-save-edit]");
    if (saveEdit) {
      event.preventDefault();
      await saveSelectedEdit();
      return;
    }

    const resetEdit = event.target.closest("[data-reset-edit]");
    if (resetEdit) {
      event.preventDefault();
      resetEditDraft();
      return;
    }

    const viewAction = event.target.closest("[data-view-action]");
    if (viewAction) {
      event.preventDefault();
      setView(viewAction.dataset.viewAction, true);
      return;
    }

    const selectable = event.target.closest("[data-select-key]");
    if (selectable) {
      state.selectedKey = selectable.dataset.selectKey;
      state.editDraft = null;
      state.editDirty = false;
      render();
    }
  });

  els.selectedContent.addEventListener("input", (event) => {
    if (event.target.matches("[data-edit-field]")) updateDraftField(event.target.dataset.editField, event.target.value);
  });

  els.selectedContent.addEventListener("change", (event) => {
    if (event.target.matches("[data-edit-field]")) updateDraftField(event.target.dataset.editField, event.target.value);
  });

  els.editContent.addEventListener("input", (event) => {
    if (event.target.matches("[data-edit-field]")) updateDraftField(event.target.dataset.editField, event.target.value);
  });

  els.editContent.addEventListener("change", (event) => {
    if (event.target.matches("[data-edit-field]")) updateDraftField(event.target.dataset.editField, event.target.value);
  });

  if (els.fileInput) {
    els.fileInput.addEventListener("change", async (event) => {
      const [file] = event.target.files || [];
      if (!file) return;
      await importFile(file);
      event.target.value = "";
    });
  }

  if (els.dropZone) {
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
    els.networkLinks.innerHTML = `<span>Phone</span><span>same Wi-Fi</span>`;
  }
}

function loadDataset(dataset) {
  state.dataset = normalizeDataset(dataset);
  state.selectedKey = state.dataset.rows[0]?.record_key || "";
  state.compareKeys = state.compareKeys.filter((key) => rowByKey(key));
  render();
}

function render() {
  if (!state.dataset) return;

  document.body.dataset.currentView = state.view;
  document.body.dataset.editDirty = state.editDirty ? "true" : "false";
  els.viewPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.view === state.view));
  els.viewLinks.forEach((link) => link.classList.toggle("active", link.dataset.viewLink === state.view));

  renderQuickStats();
  renderSearch();
  renderCompare();
  renderEdit();
  renderOpsQueue();
  renderImportSummary();
  renderSelectedPanel();
  renderCompareTray();
}

function renderQuickStats() {
  const summary = state.dataset.summary;
  const insights = buildInsights();
  els.quickStats.innerHTML = `
    ${renderStatFilter("all", "All SKUs", summary.total_records)}
    ${renderStatFilter("missing_dims", "Missing Shipping Dims", insights.missingDims.length, insights.missingDims.length)}
    ${renderStatFilter("pending_carrier", "Pending Carrier", insights.pendingCarrier.length, insights.pendingCarrier.length)}
    ${renderStatFilter("key_gaps", "Cannot Ship", insights.cannotShip.length, insights.cannotShip.length)}
    ${renderStatFilter("oversized", "Freight Review", insights.oversized.length, insights.oversized.length)}
    ${renderStatFilter("duplicates", "Duplicate SKUs", insights.duplicates.length, insights.duplicates.length)}
  `;
}

function renderStatFilter(filter, label, value, warn = false) {
  return `
    <button class="stat-cell ${warn ? "warn" : ""} ${state.quickFilter === filter ? "active" : ""}" type="button" data-quick-filter="${escapeAttr(filter)}">
      <span>${escapeHtml(label)}</span>
      <strong>${formatNumber(value)}</strong>
    </button>
  `;
}

function renderSearch() {
  const rows = filteredRows();
  const visible = rows.slice(0, 180);
  const queryLabel = state.query ? ` for "${escapeHtml(state.query)}"` : "";
  const filterLabel = state.quickFilter === "all" ? "" : ` · ${QUICK_FILTER_LABELS[state.quickFilter]}`;
  els.searchSubtitle.textContent = `${formatNumber(rows.length)} SKU lines${state.query ? "" : " in working set"}${filterLabel}.`;
  els.searchPills.innerHTML = renderSearchPills(rows);
  els.searchContent.innerHTML = `
    <div class="table-toolbar">
      <div>
        <strong>${formatNumber(rows.length)}</strong>
        <span>SKU lines${queryLabel}</span>
      </div>
      <div class="toolbar-actions">
        <button class="secondary-action ${state.quickFilter === "key_gaps" ? "active" : ""}" type="button" data-quick-filter="key_gaps">Cannot Ship</button>
        <button class="secondary-action ${state.quickFilter === "oversized" ? "active" : ""}" type="button" data-quick-filter="oversized">Freight Review</button>
        ${state.quickFilter !== "all" ? `<button class="secondary-action" type="button" data-quick-filter="all">Clear Filter</button>` : ""}
        <button class="secondary-action" type="button" data-view-action="compare">Load Compare ${state.compareKeys.length}/3</button>
        <button class="secondary-action" type="button" data-view-action="reflect">Validation Queue</button>
      </div>
    </div>
    ${renderOpsBrief(rows)}
    <div class="results-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Chk</th>
            <th>SKU</th>
            <th>Description</th>
            <th>Carrier</th>
            <th>Weight</th>
            <th>Qty</th>
            <th>Shipping Flags</th>
          </tr>
        </thead>
        <tbody>
          ${visible.map(renderResultRow).join("")}
        </tbody>
      </table>
    </div>
    ${rows.length > visible.length ? `<div class="table-foot">Showing first ${visible.length} SKU lines. Refine lookup for tighter picks.</div>` : ""}
  `;
}

function renderOpsBrief(rows) {
  const cannotShipCount = rows.filter(cannotShip).length;
  const missingDimsCount = rows.filter(isMissingShippingDims).length;
  const pendingCarrierCount = rows.filter(isPendingCarrier).length;
  const freightReviewCount = rows.filter(isOversized).length;
  const duplicateSkuCount = rows.filter((row) => duplicateCountFor(row) > 1).length;
  return `
    <section class="ops-brief" aria-label="Warehouse validation counts">
      ${renderOpsBriefMetric("key_gaps", "Cannot Ship", cannotShipCount, "hold before pick", "danger")}
      ${renderOpsBriefMetric("missing_dims", "Missing Shipping Dims", missingDimsCount, "measure carton", "warn")}
      ${renderOpsBriefMetric("pending_carrier", "Pending Carrier", pendingCarrierCount, "assign lane", "purple")}
      ${renderOpsBriefMetric("oversized", "Freight Review", freightReviewCount, "pallet / LTL check", "freight")}
      ${renderOpsBriefMetric("duplicates", "Duplicate SKUs", duplicateSkuCount, "verify line", "purple")}
    </section>
  `;
}

function renderOpsBriefMetric(filter, label, value, detail, tone) {
  return `
    <button class="ops-brief-cell ${escapeAttr(tone)} ${state.quickFilter === filter ? "active" : ""}" type="button" data-quick-filter="${escapeAttr(filter)}">
      <span>${escapeHtml(label)}</span>
      <strong>${formatNumber(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </button>
  `;
}

function renderSearchPills(rows) {
  const carriers = new Set(rows.map((row) => displayText(row.carrier_type)).filter(Boolean));
  const cannotShipCount = rows.filter(cannotShip).length;
  const freightReviewCount = rows.filter(isOversized).length;
  const carrierCheckCount = rows.filter((row) => hasInvalidCarrierAssignment(row) || hasConflictingShippingData(row)).length;
  return `
    ${state.quickFilter !== "all" ? `<span class="soft-pill active">${escapeHtml(QUICK_FILTER_LABELS[state.quickFilter])}</span>` : ""}
    <span class="soft-pill">${formatNumber(cannotShipCount)} cannot ship</span>
    <span class="soft-pill">${formatNumber(freightReviewCount)} freight review</span>
    <span class="soft-pill">${formatNumber(carrierCheckCount)} carrier check</span>
    <span class="soft-pill">${carriers.size} carrier lanes</span>
  `;
}

function renderResultRow(row) {
  const selected = row.record_key === state.selectedKey;
  const compared = state.compareKeys.includes(row.record_key);
  return `
    <tr class="${selected ? "selected" : ""}" data-select-key="${escapeAttr(row.record_key)}">
      <td>
        <button class="icon-toggle ${compared ? "active" : ""}" type="button" title="${compared ? "Remove from load compare" : "Stage for load compare"}" data-compare-key="${escapeAttr(row.record_key)}">
          ${compared ? "✓" : "+"}
        </button>
      </td>
      <td>
        <strong>${formatFieldValue(displayText(row.model_number) || displayText(row.part_number))}</strong>
        <small>${escapeHtml(displayText(row.part_number && row.part_number !== row.model_number ? row.part_number : row.warehouse_category))}</small>
      </td>
      <td class="description-cell">
        <strong>${formatFieldValue(row.description)}</strong>
        <small>${formatFieldValue(row.notes)}</small>
      </td>
      <td>${formatFieldValue(row.carrier_type)}</td>
      <td>${formatFieldValue(row.product_weight_lb)}</td>
      <td>${formatFieldValue(row.inventory)}</td>
      <td class="flag-cell">${renderShippingBadges(row)}</td>
    </tr>
  `;
}

function renderShippingBadges(row) {
  const flags = shippingFlags(row);
  if (!flags.length) return `<span class="ops-badge ok">Ship Check OK</span>`;
  return flags.map((flag) => `<span class="ops-badge ${escapeAttr(flag.level)}">${escapeHtml(flag.label)}</span>`).join("");
}

function renderFreightCell(row) {
  if (hasInvalidCarrierAssignment(row)) return `<span class="ops-badge danger">Invalid Carrier</span>`;
  if (hasConflictingShippingData(row)) return `<span class="ops-badge warn">Method Conflict</span>`;
  if (isOversized(row)) return `<span class="ops-badge warn">Freight Review</span>`;
  return `<span class="ops-badge muted">Parcel</span>`;
}

function renderCompare() {
  renderCompareBoard();
  return;

  const rows = compareRows();
  const mismatches = compareMismatchFields(rows);
  els.compareSubtitle.textContent = `${rows.length} of 3 selected${rows.length > 1 ? ` · ${mismatches.size} mismatched fields` : ""}.`;
  if (!rows.length) {
    els.compareContent.innerHTML = emptyState("No compare items", "Select rows from Search.");
    return;
  }

  els.compareContent.innerHTML = `
    <div class="compare-grid" style="--compare-count: ${rows.length}">
      <div class="compare-labels">
        <div class="compare-head">Field</div>
        ${COMPARE_FIELDS.map(({ label }) => `<div>${escapeHtml(label)}</div>`).join("")}
      </div>
      ${rows.map((row) => renderCompareColumn(row, mismatches)).join("")}
    </div>
  `;
}

function renderCompareColumn(row, mismatches) {
  return `
    <div class="compare-column">
      <div class="compare-head">
        <button class="icon-button" type="button" title="Remove" data-remove-compare-key="${escapeAttr(row.record_key)}">×</button>
        <strong>${formatFieldValue(displayText(row.model_number) || displayText(row.part_number))}</strong>
        <small>${escapeHtml(displayText(row.description) || displayText(row.classification))}</small>
      </div>
      ${COMPARE_FIELDS.map((field) => `<div class="${mismatches.has(field.id) ? "compare-diff" : ""}">${formatCompareValue(row, field)}</div>`).join("")}
    </div>
  `;
}

function renderCompareBoard() {
  const rows = compareRows();
  const mismatches = compareMismatchFields(rows);
  const summary = compareSummary(rows);
  els.compareSubtitle.textContent = `${rows.length} of 3 selected${rows.length > 1 ? ` Â· ${mismatches.size} mismatched fields` : ""}.`;
  if (!rows.length) {
    els.compareContent.innerHTML = emptyState("No compare items", "Select rows from Search.");
    return;
  }

  els.compareContent.innerHTML = `
    <div class="compare-board">
      <div class="compare-summary-metrics">
        <div>
          <span>total_cost</span>
          <strong>${formatCurrency(summary.totalCost)}</strong>
        </div>
        <div>
          <span>aggregate_load_weight</span>
          <strong>${formatWeightNumber(summary.aggregateLoadWeight)}</strong>
        </div>
        <div>
          <span>selected_items</span>
          <strong>${rows.length}/3</strong>
        </div>
      </div>
      <div class="compare-section-stack">
        ${COMPARE_SECTIONS.map((section) => renderCompareSection(section, rows, mismatches)).join("")}
      </div>
    </div>
  `;
}

function renderCompareSection(section, rows, mismatches) {
  const slots = compareSlots(rows);
  return `
    <section class="compare-section">
      <div class="compare-section-title">
        <h2>${escapeHtml(section.title)}</h2>
      </div>
      <div class="compare-section-grid">
        <div class="compare-section-label">${escapeHtml(section.label || section.title)}</div>
        ${slots.map((row, index) => renderCompareLookupHeader(row, index)).join("")}
        ${section.fields.map((field) => renderCompareFieldRow(field, slots, mismatches)).join("")}
      </div>
    </section>
  `;
}

function compareSlots(rows) {
  return [rows[0] || null, rows[1] || null, rows[2] || null];
}

function renderCompareLookupHeader(row, index) {
  return `
    <div class="compare-lookup-head">
      <span>lookup_item_${index + 1}</span>
      <strong>${row ? formatFieldValue(displayText(row.model_number) || displayText(row.part_number)) : blankValue()}</strong>
      ${row ? `<button class="icon-button" type="button" title="Remove" data-remove-compare-key="${escapeAttr(row.record_key)}">Ã—</button>` : ""}
    </div>
  `;
}

function renderCompareFieldRow(field, slots, mismatches) {
  return `
    <div class="compare-row-label">${escapeHtml(field.label)}</div>
    ${slots
      .map((row) => `<div class="compare-cell ${mismatches.has(field.id) ? "compare-diff" : ""}">${row ? formatCompareValue(row, field) : blankValue()}</div>`)
      .join("")}
  `;
}

function renderEdit() {
  const row = selectedRow();
  els.editSubtitle.textContent = row ? `${displayText(row.model_number) || displayText(row.part_number) || "Inventory item"} selected.` : "No selected item.";
  if (!row) {
    els.editContent.innerHTML = emptyState("No item selected", "Pick a row from Search.");
    return;
  }

  els.editContent.innerHTML = `
    <div class="edit-workspace">
      ${renderEditForm(row, "main")}
      <div class="audit-panel">
        <h3>Signals</h3>
        ${renderItemSignals(row)}
      </div>
    </div>
  `;
}

function renderReflect() {
  const insights = buildInsights();
  els.reflectSubtitle.textContent = `${formatNumber(insights.cannotShip.length)} cannot ship, ${formatNumber(insights.oversized.length)} freight review, ${formatNumber(insights.duplicates.length)} duplicate SKU groups.`;
  els.reflectContent.innerHTML = `
    <div class="insight-grid">
      ${renderInsightList("Missing Shipping Dims", insights.missingDims, (row) => `${itemLink(row)}<span>${escapeHtml(displayText(row.carrier_type) || "Pending Carrier")} / Qty ${escapeHtml(summaryText(row.inventory))}</span>`)}
      ${renderInsightList("Missing Weight", insights.missingWeight, (row) => `${itemLink(row)}<span>${escapeHtml(dimsLabel(row))}</span>`)}
      ${renderInsightList("Pending Carrier", insights.pendingCarrier, (row) => `${itemLink(row)}<span>${escapeHtml(dimsLabel(row))} / ${escapeHtml(weightLabel(row))}</span>`)}
      ${renderDuplicateList(insights.duplicates)}
      ${renderInsightList("Freight Review", insights.oversized, (row) => `${itemLink(row)}<span>${escapeHtml(dimsLabel(row))} / ${escapeHtml(weightLabel(row))}</span>`)}
      ${renderInsightList("Weight / Dims Outlier", insights.unusual, (item) => `${itemLink(item.row)}<span>${escapeHtml(item.reason)}</span>`)}
    </div>
  `;
}

function renderOpsQueue() {
  const queue = buildInsights();
  els.reflectSubtitle.textContent = `${formatNumber(queue.cannotShip.length)} cannot ship, ${formatNumber(queue.oversized.length)} freight review, ${formatNumber(queue.duplicates.length)} duplicate SKU groups.`;
  els.reflectContent.innerHTML = `
    ${renderOpsBrief(state.dataset.rows)}
    <div class="insight-grid ops-queue">
      ${renderInsightList("Missing Shipping Dims", queue.missingDims, (row) => `${itemLink(row)}<span>${escapeHtml(displayText(row.carrier_type) || "Pending Carrier")} / Qty ${escapeHtml(summaryText(row.inventory))}</span>`)}
      ${renderInsightList("Missing Weight", queue.missingWeight, (row) => `${itemLink(row)}<span>${escapeHtml(dimsLabel(row))}</span>`)}
      ${renderInsightList("Pending Carrier", queue.pendingCarrier, (row) => `${itemLink(row)}<span>${escapeHtml(dimsLabel(row))} / ${escapeHtml(weightLabel(row))}</span>`)}
      ${renderDuplicateList(queue.duplicates)}
      ${renderInsightList("Freight Review", queue.oversized, (row) => `${itemLink(row)}<span>${escapeHtml(dimsLabel(row))} / ${escapeHtml(weightLabel(row))}</span>`)}
      ${renderInsightList("Conflicting Ship Method", queue.conflictingShipping, (row) => `${itemLink(row)}<span>${escapeHtml(displayText(row.carrier_type) || "Pending")} / ${escapeHtml(displayText(row.ships_via) || "Pending")}</span>`)}
      ${renderInsightList("Invalid Carrier Assignment", queue.invalidCarrier, (row) => `${itemLink(row)}<span>${escapeHtml(dimsLabel(row))} / ${escapeHtml(weightLabel(row))}</span>`)}
    </div>
  `;
}

function renderInsightList(title, items, renderItem) {
  return `
    <section class="insight-panel">
      <div class="insight-title">
        <h2>${escapeHtml(title)}</h2>
        <span>${formatNumber(items.length)}</span>
      </div>
      <div class="insight-list">
        ${items.length ? items.slice(0, 8).map((item) => `<div class="insight-row">${renderItem(item)}</div>`).join("") : `<div class="empty-line">Clear</div>`}
      </div>
    </section>
  `;
}

function renderDuplicateList(duplicates) {
  return `
    <section class="insight-panel">
      <div class="insight-title">
        <h2>Duplicate SKUs</h2>
        <span>${formatNumber(duplicates.length)}</span>
      </div>
      <div class="insight-list">
        ${
          duplicates.length
            ? duplicates
                .slice(0, 8)
                .map(
                  (group) => `
                    <div class="insight-row">
                      <button type="button" class="link-button" data-select-key="${escapeAttr(group.rows[0].record_key)}">${escapeHtml(group.label)}</button>
                      <span>${group.rows.length} inventory lines</span>
                    </div>
                  `,
                )
                .join("")
            : `<div class="empty-line">Clear</div>`
        }
      </div>
    </section>
  `;
}

function renderCarrierDistribution(carriers) {
  const max = Math.max(...carriers.map((item) => item.count), 1);
  return `
    <section class="insight-panel">
      <div class="insight-title">
        <h2>Carrier Lanes</h2>
        <span>${formatNumber(carriers.length)}</span>
      </div>
      <div class="bar-list">
        ${carriers
          .slice(0, 7)
          .map(
            (item) => `
              <div class="bar-row">
                <span>${escapeHtml(item.label)}</span>
                <div class="bar-track"><i style="width: ${Math.max(4, Math.round((item.count / max) * 100))}%"></i></div>
                <strong>${formatNumber(item.count)}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderImportSummary() {
  if (!els.importSummary) return;
  if (!state.importSummary) {
    els.importSummary.innerHTML = emptyState("No import run", "Current data is loaded.");
    return;
  }
  if (state.importSummary.error) {
    els.importSummary.innerHTML = `<div class="alert-line">${escapeHtml(state.importSummary.error)}</div>`;
    return;
  }
  const summary = state.importSummary;
  els.importSummary.innerHTML = `
    <div class="import-grid">
      <div><span>Source</span><strong>${escapeHtml(summary.source_file_name || "-")}</strong></div>
      <div><span>Added</span><strong>${formatNumber(summary.records_added || 0)}</strong></div>
      <div><span>Updated</span><strong>${formatNumber(summary.records_updated || 0)}</strong></div>
      <div><span>Removed</span><strong>${formatNumber(summary.records_removed || 0)}</strong></div>
      <div><span>Validation</span><strong>${formatNumber(summary.records_needing_review || 0)}</strong></div>
      <div><span>Saved</span><strong>${summary.saved ? "Yes" : "Pending"}</strong></div>
    </div>
  `;
}

function renderSelectedPanel() {
  const row = selectedRow();
  if (!row) {
    els.selectedSubtitle.textContent = "No SKU selected";
    els.selectedContent.innerHTML = emptyState("No SKU selected", "Pick a line from SKU Lookup.");
    return;
  }

  els.selectedSubtitle.textContent = `${displayText(row.model_number) || displayText(row.part_number)} · ${displayText(row.warehouse_category) || displayText(row.classification) || "Inventory"}`;
  els.selectedContent.innerHTML = `
    <div class="item-hero">
      <div>
        <strong>${formatFieldValue(displayText(row.model_number) || displayText(row.part_number))}</strong>
        <span>${formatFieldValue(row.description)}</span>
      </div>
      <div class="item-actions">
        <button class="secondary-action" type="button" data-copy-summary>Copy Ship Note</button>
        <button class="secondary-action" type="button" data-compare-key="${escapeAttr(row.record_key)}">
          ${state.compareKeys.includes(row.record_key) ? "Staged" : "Stage Compare"}
        </button>
      </div>
    </div>
    <div class="item-facts">
      <div><span>On hand</span><strong>${formatFieldValue(row.inventory)}</strong></div>
      <div><span>Carrier</span><strong>${formatFieldValue(row.carrier_type)}</strong></div>
      <div><span>Ship dims</span><strong>${formatDimensionValue(row)}</strong></div>
      <div><span>Ship weight</span><strong>${formatFieldValue(row.product_weight_lb)}</strong></div>
    </div>
    ${renderShippingCall(row)}
    ${renderSkuPictures(row)}
    ${renderRelationshipLeads(row)}
    ${renderOperationalMemory(row)}
    ${renderItemSignals(row)}
    ${renderEditForm(row, "side")}
  `;
}

function renderShippingCall(row) {
  const decision = shippingDecision(row);
  const loadWeight = loadWeightSource(row);
  return `
    <section class="ops-card shipping-call ${escapeAttr(decision.level)}">
      <div class="ops-card-title">
        <h3>Shipping Call</h3>
        <span class="status-chip ${escapeAttr(decision.statusClass)}">${escapeHtml(decision.label)}</span>
      </div>
      <div class="ops-detail-grid">
        <div><span>Lane</span><strong>${escapeHtml(carrierLane(row))}</strong></div>
        <div><span>Load weight</span><strong>${escapeHtml(loadWeight.label)}</strong></div>
        <div><span>Packaging</span><strong>${formatFieldValue(row.ships_via || row.carrier_type)}</strong></div>
        <div><span>Next check</span><strong>${escapeHtml(decision.nextCheck)}</strong></div>
      </div>
    </section>
  `;
}

function shippingDecision(row) {
  const blockers = shippingFlags(row).filter((flag) => flag.level === "danger");
  if (blockers.length) {
    return {
      label: "Hold",
      level: "danger",
      statusClass: "out",
      nextCheck: blockers[0].label,
    };
  }
  if (hasConflictingShippingData(row) || hasInvalidCarrierAssignment(row)) {
    return {
      label: "Carrier Check",
      level: "warn",
      statusClass: "review",
      nextCheck: "Resolve lane conflict",
    };
  }
  if (isOversized(row)) {
    return {
      label: "Freight Review",
      level: "freight",
      statusClass: "review",
      nextCheck: "Confirm pallet / LTL",
    };
  }
  return {
    label: "Ship Check OK",
    level: "ok",
    statusClass: "in",
    nextCheck: "Pick / quote ready",
  };
}

function carrierLane(row) {
  if (isPendingCarrier(row)) return "Pending Carrier";
  if (isOversized(row)) return displayText(row.carrier_type) || "Freight Review";
  return displayText(row.carrier_type) || displayText(row.ships_via) || "Parcel";
}

function loadWeightSource(row) {
  const sources = [
    { field: "total_product_plus_pallet_weight", label: "total+pallet" },
    { field: "total_product_pallet_weight_lb", label: "total+pallet" },
    { field: "gross_weight_lb", label: "gross" },
    { field: "product_weight_lb", label: "product" },
  ];
  for (const source of sources) {
    const value = numericOrNull(row[source.field]);
    if (value !== null) return { value, label: `${formatWeightNumber(value)} lb (${source.label})` };
  }
  return { value: null, label: "Pending" };
}

function renderSkuPictures(row) {
  const pictures = pictureItems(row);
  if (!pictures.length) return "";
  return `
    <section class="sku-pictures">
      <div class="mini-section-title">Pictures</div>
      <div class="picture-strip">
        ${pictures
          .slice(0, 4)
          .map((item) =>
            item.kind === "image"
              ? `<a class="picture-thumb" href="${escapeAttr(item.url)}" target="_blank" rel="noreferrer"><img src="${escapeAttr(item.imageUrl || item.url)}" alt="${escapeAttr(item.label)}" loading="lazy" /></a>`
              : `<a class="picture-ref" href="${escapeAttr(item.url || "#")}" ${item.url ? 'target="_blank" rel="noreferrer"' : ""}><span>${escapeHtml(item.label)}</span></a>`,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderItemSignals(row) {
  const signals = itemSignals(row);

  return `
    <div class="signal-stack">
      ${
        signals.length
          ? signals.map((signal) => `<span class="signal-chip">${escapeHtml(signal)}</span>`).join("")
          : `<span class="signal-chip ok">No active signals</span>`
      }
    </div>
  `;
}

function itemSignals(row) {
  const flags = shippingFlags(row).map((flag) => flag.label);
  const unusual = unusualReason(row, buildStats());
  return unusual ? [...flags, unusual] : flags;
}

function renderRelationshipLeads(row) {
  const groups = relationshipGroups(row);
  return `
    <section class="ops-card relation-card">
      <div class="ops-card-title">
        <h3>Fit / Replacement Leads</h3>
        <span>${formatNumber(groups.reduce((total, group) => total + group.rows.length, 0))}</span>
      </div>
      ${
        groups.length
          ? groups
              .map(
                (group) => `
                  <div class="relation-group">
                    <div class="relation-label">
                      <strong>${escapeHtml(group.label)}</strong>
                      <span>${escapeHtml(group.detail)}</span>
                    </div>
                    <div class="relation-list">
                      ${group.rows.map(renderRelationRow).join("")}
                    </div>
                  </div>
                `,
              )
              .join("")
          : `<div class="empty-line">No close SKU leads in this working file.</div>`
      }
    </section>
  `;
}

function relationshipGroups(row) {
  const groups = [];
  const relatedRows = state.dataset.rows.filter((candidate) => candidate.record_key !== row.record_key);
  const duplicateRows = relatedRows.filter((candidate) => normalizeKey(candidate.model_number) === normalizeKey(row.model_number));
  if (duplicateRows.length) groups.push(relationGroup("Duplicate Lines", "same SKU", duplicateRows));

  const series = normalizeKey(displayText(row.series));
  const seriesCode = normalizeKey(displayText(row.series_code));
  if (series || seriesCode) {
    groups.push(
      relationGroup(
        "Same Series",
        [displayText(row.series), displayText(row.series_code)].filter(Boolean).join(" / "),
        relatedRows.filter(
          (candidate) =>
            !duplicateRows.includes(candidate) &&
            ((series && normalizeKey(displayText(candidate.series)) === series) ||
              (seriesCode && normalizeKey(displayText(candidate.series_code)) === seriesCode)),
        ),
      ),
    );
  }

  const fabricKeys = new Set([normalizeKey(displayText(row.canopy_color)), normalizeKey(displayText(row.frame_color))].filter(Boolean));
  if (fabricKeys.size) {
    groups.push(
      relationGroup(
        "Color / Fabric Match",
        [displayText(row.canopy_color), displayText(row.frame_color)].filter(Boolean).join(" / "),
        relatedRows.filter((candidate) =>
          [normalizeKey(displayText(candidate.canopy_color)), normalizeKey(displayText(candidate.frame_color))].some((key) => key && fabricKeys.has(key)),
        ),
      ),
    );
  }

  const descriptionRows = similarDescriptionRows(row, relatedRows);
  if (descriptionRows.length) groups.push(relationGroup("Similar Description", "shared lookup terms", descriptionRows));

  const lane = normalizeSearch(displayText(row.carrier_type));
  if (lane) {
    groups.push(
      relationGroup(
        "Same Ship Lane",
        displayText(row.carrier_type),
        relatedRows.filter((candidate) => normalizeSearch(displayText(candidate.carrier_type)) === lane && isOversized(candidate) === isOversized(row)),
      ),
    );
  }

  return groups.filter((group) => group.rows.length).slice(0, 4);
}

function relationGroup(label, detail, rows) {
  return {
    label,
    detail: detail || "working file match",
    rows: [...rows].sort(defaultSort).slice(0, 5),
  };
}

function similarDescriptionRows(row, rows) {
  const tokens = descriptionTokens(row);
  if (!tokens.size) return [];
  return rows
    .map((candidate) => {
      const candidateTokens = descriptionTokens(candidate);
      let score = 0;
      tokens.forEach((token) => {
        if (candidateTokens.has(token)) score += 1;
      });
      return { row: candidate, score };
    })
    .filter((item) => item.score >= 2)
    .sort((a, b) => b.score - a.score || defaultSort(a.row, b.row))
    .map((item) => item.row)
    .slice(0, 5);
}

function descriptionTokens(row) {
  return new Set(
    normalizeSearch(`${displayText(row.description)} ${displayText(row.classification)} ${displayText(row.notes)}`)
      .split(" ")
      .filter((token) => token.length >= 4 && !RELATION_STOP_WORDS.has(token) && !/^\d+$/.test(token)),
  );
}

function renderRelationRow(row) {
  return `
    <button class="relation-row" type="button" data-select-key="${escapeAttr(row.record_key)}">
      <strong>${escapeHtml(displayText(row.model_number) || displayText(row.part_number) || BLANK_DISPLAY)}</strong>
      <span>${escapeHtml(displayText(row.description) || displayText(row.classification) || "Inventory line")}</span>
      <small>${escapeHtml(displayText(row.carrier_type) || "Pending Carrier")} / Qty ${escapeHtml(summaryText(row.inventory))}</small>
    </button>
  `;
}

function renderOperationalMemory(row) {
  const notes = displayText(row.notes);
  const notes2 = displayText(row.notes2);
  const reviewNotes = displayText(row.review_notes);
  const source = [displayText(row.source_sheet_name), displayText(row.source_row_number) ? `row ${displayText(row.source_row_number)}` : ""]
    .filter(Boolean)
    .join(" / ");
  return `
    <section class="ops-card memory-card">
      <div class="ops-card-title">
        <h3>Operational Memory</h3>
        <span>${escapeHtml(formatDate(row.last_updated))}</span>
      </div>
      <div class="memory-lines">
        <div><span>Ops notes</span><strong>${notes ? escapeHtml(notes) : "No notes on file."}</strong></div>
        ${notes2 ? `<div><span>Reference notes</span><strong>${escapeHtml(notes2)}</strong></div>` : ""}
        ${reviewNotes ? `<div><span>Validation note</span><strong>${escapeHtml(reviewNotes)}</strong></div>` : ""}
        <div><span>Source</span><strong>${escapeHtml(source || "Working file")}</strong></div>
      </div>
    </section>
  `;
}

function renderEditForm(row, variant) {
  const groups = groupEditableFields();
  return `
    <form class="edit-form ${variant === "side" ? "compact" : ""}">
      <div class="edit-identity">
        <div>
          <span>Model</span>
          <strong>${formatFieldValue(row.model_number)}</strong>
        </div>
        <div>
          <span>Class</span>
          <strong>${formatFieldValue(row.classification)}</strong>
        </div>
      </div>
      ${Object.entries(groups)
        .map(
          ([group, fields]) => `
            <fieldset>
              <legend>${escapeHtml(group)}</legend>
              <div class="field-grid">
                ${fields.map((config) => renderEditField(row, config)).join("")}
              </div>
            </fieldset>
          `,
        )
        .join("")}
      <div class="form-actions">
        <button class="secondary-action" type="button" data-reset-edit>Discard</button>
        <button class="primary-action" type="button" data-save-edit>Save SKU</button>
      </div>
    </form>
  `;
}

function renderEditField(row, config) {
  const rawValue = draftValue(row, config.field);
  const value = editFieldValue(rawValue);
  const placeholder = isPendingVerificationValue(rawValue) && config.type !== "number" ? "Pending" : "";
  if (config.type === "textarea") {
    return `
      <label class="field wide">
        <span>${escapeHtml(config.label)}</span>
        <textarea data-edit-field="${escapeAttr(config.field)}" rows="4" placeholder="${escapeAttr(placeholder)}">${escapeHtml(value)}</textarea>
      </label>
    `;
  }
  return `
    <label class="field">
      <span>${escapeHtml(config.label)}</span>
      <input data-edit-field="${escapeAttr(config.field)}" type="${escapeAttr(config.type)}" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}" />
    </label>
  `;
}

function renderCompareTray() {
  const rows = compareRows();
  els.compareTray.innerHTML = `
    <div class="tray-head">
      <strong>Load Compare ${rows.length}/3</strong>
      <button class="link-button" type="button" data-view-action="compare">Board</button>
    </div>
    <div class="tray-items">
      ${
        rows.length
          ? rows
              .map(
                (row) => `
                  <div class="tray-item">
                    <button type="button" data-select-key="${escapeAttr(row.record_key)}">${escapeHtml(displayText(row.model_number) || displayText(row.part_number) || "-")}</button>
                    <button class="icon-button" type="button" title="Remove" data-remove-compare-key="${escapeAttr(row.record_key)}">×</button>
                  </div>
                `,
              )
              .join("")
          : `<div class="empty-line">No staged SKUs</div>`
      }
    </div>
  `;
}

function filteredRows() {
  const query = searchNeedle(state.query);
  const baseRows = query.normalized ? state.dataset.rows : state.dataset.rows.filter(rowMatchesQuickFilter);
  if (!query.normalized) {
    return baseRows.sort(defaultSort);
  }

  return baseRows
    .map((row) => ({ row, score: scoreRow(row, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || defaultSort(a.row, b.row) || numeric(a.row.source_row_number) - numeric(b.row.source_row_number))
    .map((item) => item.row);
}

function rowMatchesQuickFilter(row) {
  if (state.quickFilter === "all") return true;
  if (state.quickFilter === "awnings") return row.warehouse_category === "Awnings";
  if (state.quickFilter === "parts") return row.warehouse_category !== "Awnings";
  if (state.quickFilter === "key_gaps") return cannotShip(row);
  if (state.quickFilter === "missing_dims") return isMissingShippingDims(row);
  if (state.quickFilter === "pending_carrier") return isPendingCarrier(row);
  if (state.quickFilter === "oversized") return isOversized(row);
  if (state.quickFilter === "duplicates") return duplicateCountFor(row) > 1;
  if (state.quickFilter === "demo_ready") return isDemoReady(row);
  return true;
}

function scoreRow(row, query) {
  let score = 0;
  SKU_SEARCH_FIELDS.forEach((field) => {
    score = Math.max(score, scoreField(row[field], query, { exact: 900, starts: 700, contains: 580 }));
  });
  DESCRIPTION_SEARCH_FIELDS.forEach((field) => {
    score = Math.max(score, scoreField(row[field], query, { exact: 520, starts: 470, contains: 390 }));
  });
  OPS_SEARCH_FIELDS.forEach((field) => {
    score = Math.max(score, scoreField(row[field], query, { exact: 360, starts: 320, contains: 240 }));
  });
  return score;
}

function scoreField(value, query, weights) {
  const haystack = searchHaystack(value);
  if (!haystack.normalized) return 0;
  if (haystack.normalized === query.normalized || haystack.compact === query.compact) return weights.exact;
  if (haystack.normalized.startsWith(query.normalized) || haystack.compact.startsWith(query.compact)) return weights.starts;
  if (haystack.normalized.includes(query.normalized) || haystack.compact.includes(query.compact)) return weights.contains;
  return 0;
}

function defaultSort(a, b) {
  return (
    Number(Boolean(b.review_needed)) - Number(Boolean(a.review_needed)) ||
    numeric(b.inventory) - numeric(a.inventory) ||
    cleanCell(a.model_number || a.part_number).localeCompare(cleanCell(b.model_number || b.part_number))
  );
}

function setView(view, pushState) {
  state.view = viewFromName(view);
  if (pushState) window.history.pushState({}, "", routeForView(state.view));
  render();
}

function setQuickFilter(filter) {
  const nextFilter = QUICK_FILTER_LABELS[filter] ? filter : "all";
  state.quickFilter = state.quickFilter === nextFilter && nextFilter !== "all" ? "all" : nextFilter;
  state.view = "search";
  window.history.pushState({}, "", "/search");
  render();
}

function viewFromName(view) {
  if (view === "audit") return "reflect";
  return ["search", "compare", "edit", "reflect", "import"].includes(view) ? view : "search";
}

function viewFromPath(pathname) {
  if (pathname.includes("compare")) return "compare";
  if (pathname.includes("edit")) return "edit";
  if (pathname.includes("audit")) return "reflect";
  if (pathname.includes("reflect")) return "reflect";
  if (pathname.includes("import")) return "import";
  return "search";
}

function routeForView(view) {
  if (view === "reflect") return "/audit";
  return view === "search" ? "/search" : `/${view}`;
}

function selectedRow() {
  return rowByKey(state.selectedKey);
}

function rowByKey(key) {
  return state.dataset?.rows.find((row) => row.record_key === key) || null;
}

function compareRows() {
  return state.compareKeys.map(rowByKey).filter(Boolean);
}

function compareMismatchFields(rows) {
  if (rows.length < 2) return new Set();
  return new Set(
    COMPARE_FIELDS.filter((field) => {
      const values = rows.map((row) => cleanComparable(compareComparableValue(row, field)));
      return values.some(Boolean) && new Set(values).size > 1;
    }).map((field) => field.id),
  );
}

function compareComparableValue(row, field) {
  if (field.type === "computedCurrency") return selectedItemCost(row) ?? "";
  if (field.type === "computedWeight") return normalizedLoadWeight(row) ?? "";
  if (field.type === "keyGaps") return missingKeyFields(row).join("|");
  if (field.type === "dimensions") return dimensionValue(row);
  return displayText(compareFieldValue(row, field));
}

function compareSummary(rows) {
  return rows.reduce(
    (summary, row) => {
      summary.totalCost += selectedItemCost(row) ?? 0;
      summary.aggregateLoadWeight += normalizedLoadWeight(row) ?? 0;
      return summary;
    },
    { totalCost: 0, aggregateLoadWeight: 0 },
  );
}

function toggleCompare(key) {
  state.selectedKey = key;
  state.editDraft = null;
  state.editDirty = false;
  if (state.compareKeys.includes(key)) {
    removeCompare(key);
    return;
  }
  if (state.compareKeys.length >= 3) {
    setSaveStatus("Compare limit is 3 items.");
    return;
  }
  state.compareKeys.push(key);
  render();
}

function removeCompare(key) {
  state.compareKeys = state.compareKeys.filter((item) => item !== key);
  render();
}

async function copySelectedSummary() {
  const row = selectedRow();
  if (!row) return;
  const summary = itemSummaryText(row);
  try {
    await navigator.clipboard.writeText(summary);
    setSaveStatus("Ship note copied.");
  } catch (_error) {
    copyTextFallback(summary);
    setSaveStatus("Ship note copied.");
  }
}

function copyTextFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function itemSummaryText(row) {
  const signals = itemSignals(row);
  return [
    `SKU: ${displayText(row.model_number) || displayText(row.part_number) || "Pending"}`,
    `Description: ${summaryText(row.description)}`,
    `On hand: ${summaryText(row.inventory)}`,
    `Carrier: ${summaryText(row.carrier_type)}`,
    `Ship dims: ${summaryText(dimensionValue(row))}`,
    `Ship weight: ${summaryText(row.product_weight_lb)}`,
    `Ops flags: ${signals.length ? signals.join("; ") : "Ship Check OK"}`,
  ].join("\n");
}

function updateDraftField(field, value) {
  const row = selectedRow();
  if (!row) return;
  if (!state.editDraft || state.editDraft.recordKey !== row.record_key) {
    state.editDraft = {
      recordKey: row.record_key,
      values: Object.fromEntries(EDITABLE_FIELDS.map((config) => [config.field, cleanCell(row[config.field])])),
    };
  }
  state.editDraft.values[field] = value;
  state.editDirty = true;
  setSaveStatus("Unsaved changes", true);
}

function draftValue(row, field) {
  if (state.editDraft?.recordKey === row.record_key && Object.hasOwn(state.editDraft.values, field)) {
    return state.editDraft.values[field];
  }
  return cleanCell(row[field]);
}

async function saveSelectedEdit() {
  const row = selectedRow();
  if (!row) return;
  if (!state.editDraft || state.editDraft.recordKey !== row.record_key || !state.editDirty) {
    setSaveStatus("No changes.");
    return;
  }

  EDITABLE_FIELDS.forEach(({ field }) => {
    row[field] = cleanCell(state.editDraft.values[field]);
  });
  row.shipping_dims = cleanCell(row.shipping_dims || makeShippingDims(row));
  row.last_updated = new Date().toISOString();
  refreshRowDerived(row, state.dataset.app_config);
  state.dataset.summary = summarizeRows(state.dataset.rows);
  state.editDraft = null;
  state.editDirty = false;
  render();
  await saveCurrentDataset(API_CONFIG_URL, "Item saved.");
}

function resetEditDraft() {
  state.editDraft = null;
  state.editDirty = false;
  setSaveStatus("Changes reset.");
  render();
}

async function saveCurrentDataset(url, successMessage, importSummary = null) {
  try {
    setSaveStatus("Saving...", true);
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
      state.selectedKey = rowByKey(selected) ? selected : state.dataset.rows[0]?.record_key || "";
      state.compareKeys = state.compareKeys.filter((key) => rowByKey(key));
    }
    setSaveStatus(successMessage);
    render();
  } catch (error) {
    setSaveStatus(error.message);
  }
}

async function importFile(file) {
  setSaveStatus(`Importing ${file.name}...`, true);
  try {
    const incomingRaw = await datasetFromFile(file);
    const next = normalizeDataset({
      ...incomingRaw,
      app_config: state.dataset?.app_config || normalizeConfig(),
    });
    const summary = summarizeReplacementImport(state.dataset, next);
    state.dataset = next;
    state.selectedKey = next.rows[0]?.record_key || "";
    state.compareKeys = [];
    state.editDraft = null;
    state.editDirty = false;
    state.importSummary = summary;
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

async function datasetFromFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (extension === "json") return normalizeDataset(JSON.parse(await file.text()));
  if (extension === "csv") return makeDatasetFromAoa(parseCsv(await file.text()), file.name, "OMS_inventory");
  if (!window.XLSX) throw new Error("Spreadsheet parser did not load.");

  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName = inventorySheetName(workbook.SheetNames);
  if (!sheetName) throw new Error("Workbook must include an OMS_inventory/masterlist sheet or a single uploadable sheet.");
  const aoa = window.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "", blankrows: false });
  return makeDatasetFromAoa(aoa, file.name, sheetName);
}

function inventorySheetName(sheetNames) {
  return (
    sheetNames.find((name) => name === "OMS_inventory") ||
    sheetNames.find((name) => name.toLowerCase() === "oms_inventory") ||
    sheetNames.find((name) => name.toLowerCase() === "masterlist") ||
    (sheetNames.length === 1 ? sheetNames[0] : "")
  );
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
      source_rule: "One normalized oms_inventory table; upload may come from OMS_inventory or masterlist. Reference-only columns are retained only when operationally useful.",
      classification_rule: "Awnings are controlled by app_config.awning_classifications. All other sections filter the same rows.",
      relationship_rule: "Series/class codes from masterlist create parent-child reference links from series groups to awnings, parts, fabrics, and accessories.",
    },
    app_config: normalizeConfig(config),
    required_searchable_fields: REQUIRED_FIELDS,
    fields: OUTPUT_FIELDS,
    source_header_map: sourceHeaderMap,
    missing_source_headers: missingSourceHeaders,
    rows: assignRecordKeys(rows),
    relationships: [],
  };
  applyConfigToRows(dataset);
  return dataset;
}

function makeDatasetFromAoa(aoa, sourceFileName, sourceSheetName) {
  if (!aoa.length) throw new Error("Uploaded OMS inventory file is empty.");
  const headers = normalizeHeaders(aoa[0]);
  const missingCore = ["description", "classification"].filter((field) => !headers.canonicalHeaders.includes(field));
  if (!headers.canonicalHeaders.includes("model_number") && !headers.canonicalHeaders.includes("part_number")) missingCore.unshift("model_number/part_number");
  if (missingCore.length) throw new Error(`Missing required source headers: ${missingCore.join(", ")}`);

  const meta = {
    source_file_name: sourceFileName,
    source_sheet_name: sourceSheetName,
    generated_at: new Date().toISOString(),
  };
  const context = {};
  const rows = aoa
    .slice(1)
    .map((row, index) => {
      const record = {};
      headers.canonicalHeaders.forEach((field, column) => {
        record[field] = cleanCell(row[column]);
      });
      applyGroupedContext(record, context);
      return normalizeRecordObject(record, index + 2, meta);
    })
    .filter((record) => record.model_number || record.part_number);

  return makeDataset(rows, meta, headers.sourceHeaderMap, headers.missingSourceHeaders);
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

function normalizeRecordObject(input, sourceRowNumber, meta = {}) {
  const record = {};
  OUTPUT_FIELDS.forEach((field) => {
    record[field] = Array.isArray(input[field]) ? input[field] : cleanCell(input[field]);
  });

  record.model_number = cleanCell(record.model_number);
  record.source_classification = cleanCell(record.source_classification || record.classification);
  record.classification = cleanCell(record.classification || record.source_classification);
  record.item_type = cleanCell(record.item_type);
  record.series_code = cleanCell(record.series_code || inferSeriesCode(record.model_number || record.part_number));
  record.series = cleanCell(record.series || seriesFromCode(record.series_code));
  record.description = cleanCell(record.description || record.specs || record.notes || record.canopy_color);
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
  dataset.relationships = buildSeriesRelationships(dataset.rows);
  dataset.relationship_summary = summarizeRelationships(dataset.relationships);
  dataset.summary = summarizeRows(dataset.rows);
  dataset.fields = mergeUnique([...(dataset.fields || []), ...OUTPUT_FIELDS]);
}

function buildSeriesRelationships(rows) {
  return rows
    .map((row) => {
      const seriesCode = cleanCell(row.series_code || inferSeriesCode(row.model_number || row.part_number));
      const series = cleanCell(row.series || seriesFromCode(seriesCode));
      if (!seriesCode && !series) return null;
      const parentKey = `series:${normalizeKey(seriesCode || series)}`;
      return {
        parent_type: "series",
        parent_key: parentKey,
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

function refreshRowDerived(row, config) {
  row.stock_status = stockStatus(row.inventory);
  row.warehouse_category = warehouseCategory(row.classification, config);
  row.missing_fields = requiredMissingFields(row);
  row.review_needed = row.missing_fields.length > 0 || row.warehouse_category === "Unknown / Review Needed";
  row.review_notes = reviewNotes(row);
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
  };
}

function buildInsights() {
  const rows = state.dataset.rows;
  const stats = buildStats();
  const recent = [...rows]
    .filter((row) => cleanCell(row.last_updated))
    .sort((a, b) => Date.parse(b.last_updated) - Date.parse(a.last_updated))
    .slice(0, 20);
  const missing = rows.filter((row) => missingKeyFields(row).length).sort((a, b) => missingKeyFields(b).length - missingKeyFields(a).length);
  const missingDims = rows.filter(isMissingShippingDims);
  const missingWeight = rows.filter(isMissingShipWeight);
  const pendingCarrier = rows.filter(isPendingCarrier);
  const cannotShipRows = rows.filter(cannotShip);
  const duplicates = duplicateGroups();
  const carriers = carrierCounts(rows);
  const oversized = rows.filter(isOversized).sort((a, b) => largestDimension(b) - largestDimension(a));
  const conflictingShipping = rows.filter(hasConflictingShippingData);
  const invalidCarrier = rows.filter(hasInvalidCarrierAssignment);
  const unusual = rows
    .map((row) => ({ row, reason: unusualReason(row, stats) }))
    .filter((item) => item.reason)
    .sort((a, b) => numeric(b.row.product_weight_lb || b.row.gross_weight_lb) - numeric(a.row.product_weight_lb || a.row.gross_weight_lb));

  return {
    recent,
    missing,
    missingDims,
    missingWeight,
    pendingCarrier,
    cannotShip: cannotShipRows,
    duplicates,
    carriers,
    oversized,
    conflictingShipping,
    invalidCarrier,
    unusual,
  };
}

function buildStats() {
  const weights = state.dataset.rows.map((row) => numeric(row.product_weight_lb || row.gross_weight_lb)).filter((value) => value > 0);
  const dimensions = state.dataset.rows.map(largestDimension).filter((value) => value > 0);
  return {
    medianWeight: median(weights) || 1,
    medianDimension: median(dimensions) || 1,
  };
}

function duplicateGroups() {
  const groups = new Map();
  state.dataset.rows.forEach((row) => {
    const key = normalizeKey(row.model_number);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return [...groups.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([label, rows]) => ({ label, rows }))
    .sort((a, b) => b.rows.length - a.rows.length || a.label.localeCompare(b.label));
}

function carrierCounts(rows) {
  const counts = new Map();
  rows.forEach((row) => {
    const carrier = displayText(row.carrier_type) || "Pending";
    counts.set(carrier, (counts.get(carrier) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function duplicateCountFor(row) {
  const key = normalizeKey(row.model_number);
  if (!key) return 0;
  return state.dataset.rows.filter((item) => normalizeKey(item.model_number) === key).length;
}

function missingKeyFields(row) {
  return KEY_DATA_FIELDS.filter((field) => (field === "shipping_dims" ? !dimensionValue(row) : !hasUsableValue(row[field])));
}

function isMissingShippingDims(row) {
  return !dimensionValue(row);
}

function isMissingShipWeight(row) {
  return ![row.total_product_plus_pallet_weight, row.total_product_pallet_weight_lb, row.gross_weight_lb, row.product_weight_lb].some(hasUsableValue);
}

function isPendingCarrier(row) {
  return !hasUsableValue(row.carrier_type);
}

function cannotShip(row) {
  return isMissingShippingDims(row) || isMissingShipWeight(row) || isPendingCarrier(row) || !hasUsableValue(row.inventory);
}

function shippingFlags(row) {
  const flags = [];
  if (isMissingShippingDims(row)) flags.push({ label: "Missing Dims", level: "danger" });
  if (isMissingShipWeight(row)) flags.push({ label: "Missing Weight", level: "danger" });
  if (isPendingCarrier(row)) flags.push({ label: "Pending Carrier", level: "danger" });
  if (!hasUsableValue(row.inventory)) flags.push({ label: "Qty Check", level: "danger" });
  if (duplicateCountFor(row) > 1) flags.push({ label: "Duplicate SKU", level: "warn" });
  if (hasConflictingShippingData(row)) flags.push({ label: "Method Conflict", level: "warn" });
  if (hasInvalidCarrierAssignment(row)) flags.push({ label: "Invalid Carrier", level: "danger" });
  if (isOversized(row)) flags.push({ label: "Freight Review", level: "warn" });
  return flags;
}

function isDemoReady(row) {
  return (
    (hasUsableValue(row.model_number) || hasUsableValue(row.part_number)) &&
    hasUsableValue(row.description) &&
    hasUsableValue(row.carrier_type) &&
    Boolean(dimensionValue(row)) &&
    (hasUsableValue(row.product_weight_lb) || hasUsableValue(row.gross_weight_lb))
  );
}

function isOversized(row) {
  const carrier = normalizeSearch(`${row.carrier_type} ${row.ships_via}`);
  const maxDim = largestDimension(row);
  const weight = numeric(row.product_weight_lb || row.gross_weight_lb || row.total_product_pallet_weight_lb);
  return carrier.includes("ltl") || carrier.includes("truck") || maxDim >= 96 || weight >= 100;
}

function hasConflictingShippingData(row) {
  const carrier = normalizeSearch(row.carrier_type);
  const shipsVia = normalizeSearch(row.ships_via);
  if (!carrier || !shipsVia) return false;
  const carrierSaysFreight = carrier.includes("ltl") || carrier.includes("truck") || carrier.includes("freight");
  const shipsViaSaysParcel = shipsVia.includes("usps") || shipsVia.includes("padded") || shipsVia.includes("first class") || shipsVia.includes("small parcel");
  const carrierSaysParcel = carrier.includes("ups") || carrier.includes("usps") || carrier.includes("fedex");
  const shipsViaSaysFreight = shipsVia.includes("ltl") || shipsVia.includes("truck") || shipsVia.includes("freight");
  return (carrierSaysFreight && shipsViaSaysParcel) || (carrierSaysParcel && shipsViaSaysFreight);
}

function hasInvalidCarrierAssignment(row) {
  const route = normalizeSearch(`${row.carrier_type} ${row.ships_via}`);
  if (!route || isPendingCarrier(row)) return false;
  const maxDim = largestDimension(row);
  const weight = numeric(row.total_product_pallet_weight_lb || row.gross_weight_lb || row.product_weight_lb);
  const freightSized = maxDim >= 96 || weight >= 100;
  const freightAssigned = route.includes("ltl") || route.includes("truck") || route.includes("freight");
  return freightSized && !freightAssigned;
}

function unusualReason(row, stats) {
  const weight = numeric(row.product_weight_lb || row.gross_weight_lb);
  const maxDim = largestDimension(row);
  if (weight && weight >= Math.max(120, stats.medianWeight * 2.25)) return `${formatNumber(weight)} lb high`;
  if (weight && weight <= Math.max(2, stats.medianWeight * 0.2)) return `${formatNumber(weight)} lb low`;
  if (maxDim && maxDim >= Math.max(120, stats.medianDimension * 2.1)) return `${formatNumber(maxDim)} in long`;
  return "";
}

function largestDimension(row) {
  return Math.max(numeric(row.carton_1_width), numeric(row.carton_1_depth), numeric(row.carton_1_height), ...dimensionsFromText(row.shipping_dims));
}

function dimensionsFromText(value) {
  if (!hasUsableValue(value)) return [];
  return (cleanCell(value).match(/\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[midpoint] : (sorted[midpoint - 1] + sorted[midpoint]) / 2;
}

function groupEditableFields() {
  return EDITABLE_FIELDS.reduce((groups, config) => {
    if (!groups[config.group]) groups[config.group] = [];
    groups[config.group].push(config);
    return groups;
  }, {});
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
  if (!hasUsableValue(text)) return "Review Needed";
  const count = numeric(text);
  if (count > 0) return "In Stock";
  if (count === 0) return "Out of Stock";
  return "Review Needed";
}

function requiredMissingFields(record) {
  return REQUIRED_FIELDS.filter((field) => {
    if (field === "model_number" && hasUsableValue(record.part_number)) return false;
    if (field === "part_number" && record.warehouse_category === "Awnings") return false;
    if (field === "shipping_dims") return !dimensionValue(record);
    return !hasUsableValue(record[field]);
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
  const width = displayText(record.carton_1_width);
  const depth = displayText(record.carton_1_depth);
  const height = displayText(record.carton_1_height);
  return width && depth && height ? `${width} x ${depth} x ${height}` : "";
}

function fillCartonDimsFromShippingDims(record) {
  if (hasUsableValue(record.carton_1_width) && hasUsableValue(record.carton_1_depth) && hasUsableValue(record.carton_1_height)) return;
  const dims = cleanCell(record.shipping_dims)
    .replace(/["']/g, "")
    .match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  if (!dims) return;
  if (!hasUsableValue(record.carton_1_width)) record.carton_1_width = dims[1];
  if (!hasUsableValue(record.carton_1_depth)) record.carton_1_depth = dims[2];
  if (!hasUsableValue(record.carton_1_height)) record.carton_1_height = dims[3];
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

function hasRecordChanges(existing, incoming) {
  return REQUIRED_FIELDS.some((field) => cleanComparable(existing[field]) !== cleanComparable(incoming[field]));
}

function itemLink(row) {
  return `<button type="button" class="link-button" data-select-key="${escapeAttr(row.record_key)}">${escapeHtml(displayText(row.model_number) || displayText(row.part_number) || BLANK_DISPLAY)}</button>`;
}

function labelForField(field) {
  return FIELD_LABELS[field] || field;
}

function emptyState(title, detail) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div>`;
}

function dimsLabel(row) {
  return dimensionValue(row) || BLANK_DISPLAY;
}

function weightLabel(row) {
  return displayText(row.product_weight_lb) || displayText(row.gross_weight_lb) || displayText(row.total_product_pallet_weight_lb) || BLANK_DISPLAY;
}

function statusClass(status) {
  if (status === "In Stock") return "in";
  if (status === "Out of Stock") return "out";
  return "review";
}

function formatCompareValue(row, field) {
  if (field.type === "dimensions") return formatDimensionValue(row, field);
  if (field.type === "currency") return formatCurrency(selectedItemCost(row), true);
  if (field.type === "computedCurrency") return formatCurrency(selectedItemCost(row), true);
  if (field.type === "computedWeight") return formatWeightNumber(normalizedLoadWeight(row), true);
  if (field.type === "number") return formatNumberValue(compareFieldValue(row, field));
  if (field.type === "keyGaps") {
    const gaps = missingKeyFields(row).map(labelForField);
    return gaps.length ? escapeHtml(gaps.join(", ")) : `<span class="status-chip in">Clear</span>`;
  }
  const rawValue = compareFieldValue(row, field);
  if (field.verify && isPendingVerificationValue(rawValue)) return pendingBadge();
  return formatFieldValue(rawValue);
}

function compareFieldValue(row, field) {
  if (field.type === "dimensions") return dimensionValue(row);
  if (field.id === "item_cost") return row.cost;
  if (field.id === "normalized_load_weight") return normalizedLoadWeight(row);
  if (field.id === "key_data_gaps") return missingKeyFields(row).join(", ");
  return row[field.id];
}

function formatDimensionValue(row, field = {}) {
  const text = dimensionValue(row);
  if (text) return escapeHtml(text);
  return field.verify && isPendingVerificationValue(row.shipping_dims) ? pendingBadge() : blankValue();
}

function dimensionValue(row) {
  return displayText(row.shipping_dims) || makeShippingDims(row);
}

function formatFieldValue(value) {
  if (Array.isArray(value)) return value.length ? escapeHtml(value.map(displayText).filter(Boolean).join(", ")) || blankValue() : blankValue();
  const text = cleanCell(value);
  if (!text) return blankValue();
  if (isPlaceholderValue(text)) return blankValue();
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

function pendingBadge(label = "Pending") {
  return `<span class="status-chip review pending-badge">${escapeHtml(label)}</span>`;
}

function blankValue() {
  return `<span class="blank-value">${BLANK_DISPLAY}</span>`;
}

function displayText(value) {
  const text = cleanCell(value);
  return text && !isPlaceholderValue(text) ? text : "";
}

function editFieldValue(value) {
  return isPlaceholderValue(value) ? "" : cleanCell(value);
}

function summaryText(value) {
  return displayText(value) || BLANK_DISPLAY;
}

function extractLinks(value, label) {
  const text = cleanCell(value);
  if (!text) return [];
  const matches = text.match(/https?:\/\/[^\s,;]+/gi) || [];
  return matches.map((url, index) => ({ label: matches.length > 1 ? `${label} ${index + 1}` : label, url }));
}

function pictureItems(row) {
  const text = displayText(row.pictures);
  if (!text || text.toLowerCase() === "discontinued") return [];
  const links = extractLinks(text, "Picture").map((link) => ({
    kind: isImageUrl(link.url) ? "image" : "link",
    label: link.label,
    url: link.url,
    imageUrl: imageSourceUrl(link.url),
  }));
  const refs = (text.match(/[A-Za-z0-9_.-]+\.(?:jpg|jpeg|png|webp|gif)/gi) || [])
    .filter((ref) => !links.some((link) => link.url.includes(ref)))
    .map((ref) => ({ kind: "ref", label: ref, url: "" }));
  return [...links, ...refs];
}

function isImageUrl(url) {
  try {
    const parsed = new URL(url);
    return /\.(?:jpg|jpeg|png|webp|gif)$/i.test(parsed.pathname);
  } catch (_error) {
    return /\.(?:jpg|jpeg|png|webp|gif)$/i.test(cleanCell(url).split(/[?#]/)[0]);
  }
}

function imageSourceUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("dropbox.com")) {
      parsed.searchParams.delete("dl");
      parsed.searchParams.set("raw", "1");
      return parsed.toString();
    }
  } catch (_error) {
    return url;
  }
  return url;
}

function selectedItemCost(row) {
  return numericOrNull(row.cost);
}

function normalizedLoadWeight(row) {
  return firstNumericValue([
    row.total_product_plus_pallet_weight,
    row.total_product_pallet_weight_lb,
    row.gross_weight_lb,
    row.product_weight_lb,
  ]);
}

function firstNumericValue(values) {
  for (const value of values) {
    const parsed = numericOrNull(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function numericOrNull(value) {
  const text = displayText(value);
  if (!text) return null;
  const parsed = Number(text.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumberValue(value) {
  const parsed = numericOrNull(value);
  return parsed === null ? blankValue() : escapeHtml(formatWeightNumber(parsed));
}

function formatCurrency(value, blankWhenMissing = false) {
  const parsed = typeof value === "number" ? value : numericOrNull(value);
  if (parsed === null) return blankWhenMissing ? blankValue() : "$0.00";
  return escapeHtml(
    parsed.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
}

function formatWeightNumber(value, blankWhenMissing = false) {
  const parsed = typeof value === "number" ? value : numericOrNull(value);
  if (parsed === null) return blankWhenMissing ? blankValue() : "0";
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDate(value) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "-";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(time));
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : "0";
}

function setSaveStatus(text, persistent = false) {
  els.saveStatus.textContent = text;
  window.clearTimeout(setSaveStatus.timer);
  if (text && !persistent) {
    setSaveStatus.timer = window.setTimeout(() => {
      if (els.saveStatus.textContent === text) els.saveStatus.textContent = "";
    }, 4500);
  }
}

function showFatalError(message) {
  els.searchContent.innerHTML = emptyState("Unable to load inventory", message);
  els.selectedContent.innerHTML = emptyState("Inventory unavailable", message);
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

function isPlaceholderValue(value) {
  const text = cleanCell(value).toLowerCase();
  return Boolean(text && (PLACEHOLDER_VALUES.has(text) || text.includes("data pending") || text.includes("pending verification")));
}

function isPendingVerificationValue(value) {
  const text = cleanCell(value).toLowerCase();
  return Boolean(text && (text.includes("data pending") || text.includes("pending verification") || text === "needs verification"));
}

function hasUsableValue(value) {
  return Boolean(displayText(value));
}

function cleanComparable(value) {
  return cleanCell(value).toLowerCase();
}

function normalizeSearch(value) {
  return cleanCell(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function compactSearch(value) {
  return cleanCell(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function searchNeedle(value) {
  return {
    normalized: normalizeSearch(value),
    compact: compactSearch(value),
  };
}

function searchHaystack(value) {
  return {
    normalized: normalizeSearch(value),
    compact: compactSearch(value),
  };
}

function normalizeKey(value) {
  return cleanCell(value).toLowerCase();
}

function numeric(value) {
  if (!hasUsableValue(value)) return 0;
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
