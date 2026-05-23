import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import InventoryBoot from "../InventoryBoot";
import { getInventoryAuthState, isClerkConfigured } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const authState = await getInventoryAuthState();
  if (!authState.ok && authState.status === 401) redirect("/sign-in");
  if (!authState.ok) return <AccessProblem message={authState.error} />;

  return (
    <>
      <header className="topbar">
        <a className="brand" href="/awnings" aria-label="OMS inventory console">
          <span className="brand-mark">OMS</span>
          <span>Inventory Console</span>
        </a>

        <label className="global-search">
          <span className="search-icon" aria-hidden="true">
            Find
          </span>
          <input
            id="searchInput"
            type="search"
            placeholder="Model, part, color, carrier, dimensions..."
            autoComplete="off"
          />
        </label>

        <nav className="tabs" aria-label="Inventory sections">
          <a href="/awnings" data-view-link="awnings">
            Awnings
          </a>
          <a href="/parts" data-view-link="parts">
            Parts &amp; Accessories
          </a>
          <a href="/shipping" data-view-link="shipping">
            Shipping
          </a>
          <a href="/import" data-view-link="import">
            Import
          </a>
        </nav>

        <div id="networkLinks" className="network-links" aria-label="Open on phone" />
        <div className="account-area">{isClerkConfigured() ? <UserButton afterSignOutUrl="/sign-in" /> : <span>Local dev</span>}</div>
      </header>

      <main id="pageShell" className="page-shell">
        <section className="workspace">
          <section id="awningsView" className="view-panel" data-view="awnings">
            <div className="section-heading">
              <div>
                <h1>Awnings</h1>
                <p id="awningsSubtitle">Items in classifications marked as awnings.</p>
              </div>
              <button id="configureAwnings" className="secondary-action" type="button">
                Configure awning classes
              </button>
            </div>
            <div id="awningsContent" />
          </section>

          <section id="partsView" className="view-panel" data-view="parts">
            <div className="section-heading">
              <div>
                <h1>Parts &amp; Accessories</h1>
                <p>All non-awning inventory items from the same normalized OMS inventory table.</p>
              </div>
              <label className="inline-select">
                <span>Class</span>
                <select id="partsClassFilter" />
              </label>
            </div>
            <div id="partsContent" />
          </section>

          <section id="shippingView" className="view-panel" data-view="shipping">
            <div className="section-heading">
              <div>
                <h1>Shipping &amp; Warehouse</h1>
                <p>Grouped by warehouse location, carrier, and shipping details.</p>
              </div>
              <label className="inline-select">
                <span>Group</span>
                <select id="shippingGroup" defaultValue="location">
                  <option value="location">Location</option>
                  <option value="carrier_type">Carrier</option>
                  <option value="ships_via">Ships via</option>
                  <option value="shipping_dims">Dimensions</option>
                </select>
              </label>
            </div>
            <div id="shippingContent" />
          </section>

          <section id="importView" className="view-panel" data-view="import">
            <div className="section-heading">
              <div>
                <h1>Inventory Update / Import</h1>
                <p>
                  Upload an OMS inventory file (.xlsx, .xls, .csv). The uploaded OMS_inventory sheet replaces the current
                  inventory file.
                </p>
              </div>
            </div>
            <label id="dropZone" className="upload-zone">
              <input id="fileInput" type="file" accept=".xlsx,.xls,.csv,.json" />
              <strong>Drop or click to choose file</strong>
              <span>.xlsx / .xls / .csv</span>
            </label>
            <div id="importSummary" className="import-summary" />
          </section>
        </section>

        <aside id="selectedPanel" className="selected-panel">
          <div className="panel-title-row">
            <div>
              <h2>Selected Item Lookup</h2>
              <p id="selectedSubtitle">Choose an inventory item.</p>
            </div>
            <div id="saveStatus" className="save-status" role="status" />
          </div>
          <div id="selectedContent" />
        </aside>
      </main>

      <dialog id="awningDialog" className="modal">
        <form method="dialog">
          <div className="modal-heading">
            <div>
              <h2>Configure Awning Classes</h2>
              <p>Pick which classification values should appear under Awnings.</p>
            </div>
            <button className="icon-button" value="cancel" aria-label="Close" type="submit">
              x
            </button>
          </div>
          <div id="awningClassList" className="class-list" />
          <div className="modal-actions">
            <button id="cancelAwningConfig" className="secondary-action" value="cancel" type="submit">
              Cancel
            </button>
            <button id="saveAwningConfig" className="primary-action" value="default" type="button">
              Save classes
            </button>
          </div>
        </form>
      </dialog>

      <InventoryBoot />
    </>
  );
}

function AccessProblem({ message }) {
  return (
    <main className="auth-screen">
      <section className="auth-card">
        <span className="brand-mark">OMS</span>
        <h1>Inventory access is not ready</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
