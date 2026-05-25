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
      <div className="app-frame">
        <aside className="topbar app-sidebar">
          <a className="brand" href="/search" aria-label="OMS inventory console">
            <span className="brand-mark">OMS</span>
            <span>
              Inventory
              <small>shipping console</small>
            </span>
          </a>

          <nav className="tabs" aria-label="Inventory workflows">
            <span className="nav-section-label">Main Menu</span>
            <a href="/search" data-view-link="search">
              <span className="nav-icon">⌕</span>
              SKU Lookup
            </a>
            <a href="/compare" data-view-link="compare">
              <span className="nav-icon">⇄</span>
              Load Compare
            </a>
            <a href="/edit" data-view-link="edit">
              <span className="nav-icon">✎</span>
              SKU Edit
            </a>
            <a href="/audit" data-view-link="reflect">
              <span className="nav-icon">⚠</span>
              Validation Queue
            </a>
            <span className="nav-section-label">Resources</span>
            <a className="utility-link" href="/import" data-view-link="import">
              <span className="nav-icon">⇧</span>
              Load Sheet
            </a>
          </nav>

          <div className="sidebar-footer">
            <div id="networkLinks" className="network-links" aria-label="Open on phone" />
            <div className="account-area">
              {isClerkConfigured() ? <UserButton afterSignOutUrl="/sign-in" /> : <span>Local dev</span>}
            </div>
          </div>
        </aside>

        <section className="workspace">
          <header className="workspace-topbar">
            <div>
              <h1>OMS Operations</h1>
              <p>Awning logistics lookup, shipping validation, and support memory.</p>
            </div>
            <label className="global-search">
              <span className="search-icon" aria-hidden="true">
                Find
              </span>
              <input
                id="searchInput"
                type="search"
                placeholder="SKU, model, ship dims, carrier, freight notes..."
                autoComplete="off"
              />
            </label>
          </header>

          <main id="pageShell" className="page-shell">
            <section className="console-main">
              <div id="quickStats" className="quick-stats" />

              <section id="searchView" className="view-panel" data-view="search">
                <div className="panel-heading">
                  <div>
                    <h1>SKU Lookup</h1>
                    <p id="searchSubtitle">Warehouse lookup</p>
                  </div>
                  <div id="searchPills" className="pill-row" />
                </div>
                <div id="searchContent" />
              </section>

              <section id="compareView" className="view-panel" data-view="compare">
                <div className="panel-heading">
                  <div>
                    <h1>Load Compare</h1>
                    <p id="compareSubtitle">Side-by-side shipping checks</p>
                  </div>
                  <button id="clearCompare" className="secondary-action" type="button" data-clear-compare>
                    Clear load
                  </button>
                </div>
                <div id="compareContent" />
              </section>

              <section id="editView" className="view-panel" data-view="edit">
                <div className="panel-heading">
                  <div>
                    <h1>SKU Edit</h1>
                    <p id="editSubtitle">Controlled field update</p>
                  </div>
                </div>
                <div id="editContent" />
              </section>

              <section id="reflectView" className="view-panel" data-view="reflect">
                <div className="panel-heading">
                  <div>
                    <h1>Validation Queue</h1>
                    <p id="reflectSubtitle">Shipping blockers and freight exceptions</p>
                  </div>
                  <button id="refreshReflect" className="secondary-action" type="button" data-view-action="reflect">
                    Recheck
                  </button>
                </div>
                <div id="reflectContent" />
              </section>

              <section id="importView" className="view-panel" data-view="import">
                <div className="panel-heading">
                  <div>
                    <h1>Load Sheet</h1>
                    <p id="importSubtitle">Replace working SKU file</p>
                  </div>
                </div>
                <label id="dropZone" className="upload-zone">
                  <input id="fileInput" type="file" accept=".xlsx,.xls,.csv,.json" />
                  <strong>Drop revised OMS file</strong>
                  <span>.xlsx / .xls / .csv / .json</span>
                </label>
                <div id="importSummary" className="import-summary" />
              </section>
            </section>

            <aside id="detailPanel" className="detail-panel">
              <div className="panel-title-row">
                <div>
                  <h2>Selected SKU</h2>
                  <p id="selectedSubtitle">No SKU selected</p>
                </div>
                <div id="saveStatus" className="save-status" role="status" />
              </div>
              <div id="selectedContent" />
              <div id="compareTray" className="compare-tray" />
            </aside>
          </main>
        </section>
      </div>

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
