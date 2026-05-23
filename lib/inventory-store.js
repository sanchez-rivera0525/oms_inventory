import fs from "node:fs/promises";
import path from "node:path";
import { gunzip, gzip } from "node:zlib";
import { promisify } from "node:util";
import { Redis } from "@upstash/redis";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

const INVENTORY_KEY = "oms_inventory:dataset:v1";
const root = process.cwd();
const dataDir = path.join(root, "data");
const jsonPath = path.join(dataDir, "oms_inventory.json");
const csvPath = path.join(dataDir, "oms_inventory.csv");

let redisClient = null;

export async function readInventoryDataset() {
  const redis = getRedis();
  if (redis) {
    const stored = await redis.get(INVENTORY_KEY);
    if (stored) return decodeDataset(stored);

    const seed = await readSeedDataset();
    await redis.set(INVENTORY_KEY, await encodeDataset(seed));
    return seed;
  }

  return readSeedDataset();
}

export async function saveInventoryDataset(dataset) {
  const saved = normalizeSaveDataset(dataset);
  const redis = getRedis();

  if (redis) {
    await redis.set(INVENTORY_KEY, await encodeDataset(saved));
    return saved;
  }

  if (isHostedRuntime()) {
    throw new Error("Upstash Redis is not configured, so hosted inventory updates cannot be persisted.");
  }

  await saveLocalDataset(saved);
  return saved;
}

export function normalizeSaveDataset(dataset) {
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

  saved.fields = Array.isArray(saved.fields) ? [...saved.fields] : Object.keys(saved.rows[0] || {});
  if (!saved.fields.includes("record_key")) saved.fields.push("record_key");
  return saved;
}

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!redisClient) redisClient = Redis.fromEnv();
  return redisClient;
}

async function readSeedDataset() {
  return JSON.parse(await fs.readFile(jsonPath, "utf8"));
}

async function saveLocalDataset(dataset) {
  await fs.mkdir(dataDir, { recursive: true });
  await atomicWrite(jsonPath, `${JSON.stringify(dataset, null, 2)}\n`);
  await atomicWrite(csvPath, toCsv(dataset.fields, dataset.rows));
}

async function atomicWrite(filePath, text) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, text);
  await fs.rename(tempPath, filePath);
}

async function encodeDataset(dataset) {
  const zipped = await gzipAsync(Buffer.from(JSON.stringify(dataset), "utf8"));
  return `gzip:${zipped.toString("base64")}`;
}

async function decodeDataset(stored) {
  if (typeof stored === "string" && stored.startsWith("gzip:")) {
    const unzipped = await gunzipAsync(Buffer.from(stored.slice(5), "base64"));
    return JSON.parse(unzipped.toString("utf8"));
  }
  if (typeof stored === "string") return JSON.parse(stored);
  return stored;
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

function isHostedRuntime() {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}
