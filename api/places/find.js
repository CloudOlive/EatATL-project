const {
  fetchJson,
  getCache,
  getGoogleApiKey,
  handleOptions,
  rateLimit,
  sendJson,
  setCache,
} = require("./_shared");

/**
 * GET /api/places/find?query=Restaurant%20Name%20Atlanta%20GA
 * Legacy Places API: Find Place From Text (Web Service)
 */
module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") {
    return sendJson(req, res, 405, { error: "method_not_allowed" });
  }
  if (!rateLimit(req, res)) return;

  const query = (req.query?.query || "").toString().trim();
  if (!query) {
    return sendJson(req, res, 400, { error: "missing_query" });
  }
  if (query.length > 200) {
    return sendJson(req, res, 400, { error: "query_too_long" });
  }

  let apiKey;
  try {
    apiKey = getGoogleApiKey();
  } catch (e) {
    return sendJson(req, res, 500, { error: e.code || "config_error", message: e.message });
  }

  const cacheKey = `find:${query.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return sendJson(req, res, 200, { cached: true, ...cached });
  }

  const url =
    "https://maps.googleapis.com/maps/api/place/findplacefromtext/json" +
    `?input=${encodeURIComponent(query)}` +
    "&inputtype=textquery" +
    "&fields=place_id,name,formatted_address" +
    `&key=${encodeURIComponent(apiKey)}`;

  try {
    const { json } = await fetchJson(url);

    const candidates = Array.isArray(json.candidates) ? json.candidates : [];
    const top = candidates[0] || null;

    const payload = {
      query,
      status: json.status,
      place: top
        ? {
            placeId: top.place_id,
            name: top.name,
            formattedAddress: top.formatted_address,
          }
        : null,
    };

    // Short cache to avoid repeated lookups during browsing.
    setCache(cacheKey, payload, 6 * 60 * 60 * 1000); // 6 hours
    return sendJson(req, res, 200, payload);
  } catch (e) {
    return sendJson(req, res, 502, {
      error: e.code || "upstream_error",
      message: e.message || "Failed to reach Google Places API.",
    });
  }
};

