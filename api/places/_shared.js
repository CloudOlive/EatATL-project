/**
 * Shared helpers for Vercel serverless functions.
 * - Keeps Google API key on the server (never expose to browser)
 * - Adds simple CORS + lightweight rate limiting
 * - Adds small in-memory caching to reduce cost
 */

const CACHE = new Map(); // key -> { value, expiresAt }
const RATE = new Map(); // ip -> { count, resetAt }

const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_MAX_PER_WINDOW = 60; // per IP per function instance

function now() {
  return Date.now();
}

function getClientIp(req) {
  // Vercel/Proxies set x-forwarded-for as "client, proxy1, proxy2"
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function setCors(req, res) {
  const origin = req.headers.origin;
  // For simplicity during setup, reflect origin if present, otherwise allow all.
  // In production, you should restrict this to your domain(s).
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    setCors(req, res);
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

function sendJson(req, res, statusCode, body) {
  setCors(req, res);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function getGoogleApiKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    const err = new Error("Missing GOOGLE_MAPS_API_KEY environment variable.");
    err.code = "MISSING_GOOGLE_MAPS_API_KEY";
    throw err;
  }
  return key;
}

function rateLimit(req, res) {
  const ip = getClientIp(req);
  const t = now();
  const entry = RATE.get(ip);

  if (!entry || entry.resetAt <= t) {
    RATE.set(ip, { count: 1, resetAt: t + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_MAX_PER_WINDOW) {
    sendJson(req, res, 429, {
      error: "rate_limited",
      message: "Too many requests. Please slow down and try again shortly.",
    });
    return false;
  }

  entry.count += 1;
  return true;
}

function getCache(cacheKey) {
  const entry = CACHE.get(cacheKey);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    CACHE.delete(cacheKey);
    return null;
  }
  return entry.value;
}

function setCache(cacheKey, value, ttlMs = DEFAULT_CACHE_TTL_MS) {
  CACHE.set(cacheKey, { value, expiresAt: now() + ttlMs });
}

async function fetchJson(url) {
  const resp = await fetch(url, { redirect: "follow" });
  const text = await resp.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    const err = new Error("Non-JSON response from Google Places API.");
    err.code = "BAD_UPSTREAM_RESPONSE";
    err.status = resp.status;
    err.body = text.slice(0, 500);
    throw err;
  }

  return { status: resp.status, ok: resp.ok, json };
}

module.exports = {
  DEFAULT_CACHE_TTL_MS,
  fetchJson,
  getCache,
  getGoogleApiKey,
  handleOptions,
  rateLimit,
  sendJson,
  setCache,
  setCors,
};

