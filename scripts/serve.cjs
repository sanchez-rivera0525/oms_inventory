#!/usr/bin/env node

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const port = Number(process.argv[2] || 4176);
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const jsonPath = path.join(dataDir, "oms_inventory.json");
const csvPath = path.join(dataDir, "oms_inventory.csv");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);

    if (request.method === "GET" && url.pathname === "/api/inventory") {
      return sendFile(response, jsonPath, "application/json; charset=utf-8");
    }

    if (request.method === "POST" && (url.pathname === "/api/import" || url.pathname === "/api/config")) {
      const body = await readJsonBody(request);
      const dataset = normalizeSaveDataset(body.dataset);
      saveDataset(dataset);
      return sendJson(response, 200, {
        ok: true,
        saved_at: dataset.metadata.generated_at,
        dataset,
        import_summary: body.import_summary || null,
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return sendText(response, 405, "Method not allowed");
    }

    return serveStatic(url, response);
  } catch (error) {
    return sendJson(response, 500, { ok: false, error: error.message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`OMS_inventory running at http://127.0.0.1:${port}`);
});

function serveStatic(url, response) {
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  let filePath = path.resolve(root, `.${requestedPath}`);

  if (!filePath.startsWith(root)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    filePath = path.join(root, "index.html");
  }

  sendFile(response, filePath, types[path.extname(filePath)] || "application/octet-stream");
}

function sendFile(response, filePath, contentType) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(response, 404, "Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    response.end(data);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(`${JSON.stringify(payload)}\n`);
}

function sendText(response, status, text) {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(text);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 30 * 1024 * 1024) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(new Error(`Invalid JSON request body: ${error.message}`));
      }
    });
    request.on("error", reject);
  });
}

function normalizeSaveDataset(dataset) {
  if (!dataset || dataset.table_name !== "oms_inventory" || !Array.isArray(dataset.rows)) {
    throw new Error("Saved payload must contain an oms_inventory dataset.");
  }
  const saved = {
    ...dataset,
    metadata: {
      ...(dataset.metadata || {}),
      source_sheet_name: dataset.metadata?.source_sheet_name || "OMS_inventory",
      generated_at: new Date().toISOString(),
    },
    app_config: {
      awning_classifications: Array.isArray(dataset.app_config?.awning_classifications)
        ? dataset.app_config.awning_classifications
        : ["Awning"],
      classification_overrides:
        dataset.app_config?.classification_overrides && typeof dataset.app_config.classification_overrides === "object"
          ? dataset.app_config.classification_overrides
          : {},
    },
  };
  saved.fields = Array.isArray(saved.fields) ? saved.fields : Object.keys(saved.rows[0] || {});
  if (!saved.fields.includes("record_key")) saved.fields.push("record_key");
  return saved;
}

function saveDataset(dataset) {
  fs.mkdirSync(dataDir, { recursive: true });
  atomicWrite(jsonPath, `${JSON.stringify(dataset, null, 2)}\n`);
  atomicWrite(csvPath, toCsv(dataset.fields, dataset.rows));
}

function atomicWrite(filePath, text) {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, text);
  fs.renameSync(tempPath, filePath);
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
