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
 * GET /api/places/details?placeId=ChIJ...
 * Legacy Places API: Place Details (Web Service)
 */
module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") {
    return sendJson(req, res, 405, { error: "method_not_allowed" });
  }
  if (!rateLimit(req, res)) return;

  const placeId = (req.query?.placeId || "").toString().trim();
  if (!placeId) {
    return sendJson(req, res, 400, { error: "missing_placeId" });
  }
  if (placeId.length > 200) {
    return sendJson(req, res, 400, { error: "placeId_too_long" });
  }

  let apiKey;
  try {
    apiKey = getGoogleApiKey();
  } catch (e) {
    return sendJson(req, res, 500, { error: e.code || "config_error", message: e.message });
  }

  const cacheKey = `details:${placeId}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return sendJson(req, res, 200, { cached: true, ...cached });
  }

  const fields = [
    "name",
    "formatted_address",
    "rating",
    "user_ratings_total",
    "photos",
    "url",
  ].join(",");

  const url =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=${encodeURIComponent(fields)}` +
    `&key=${encodeURIComponent(apiKey)}`;

  try {
    const { json } = await fetchJson(url);
    const result = json.result || {};

    const photos = Array.isArray(result.photos)
      ? result.photos.map((p) => ({
          photoReference: p.photo_reference,
          width: p.width,
          height: p.height,
          htmlAttributions: Array.isArray(p.html_attributions) ? p.html_attributions : [],
        }))
      : [];

    const payload = {
      placeId,
      status: json.status,
      place: {
        name: result.name || null,
        formattedAddress: result.formatted_address || null,
        rating: typeof result.rating === "number" ? result.rating : null,
        userRatingsTotal:
          typeof result.user_ratings_total === "number" ? result.user_ratings_total : null,
        googleMapsUrl: result.url || null,
        photos,
      },
    };

    // Keep a short cache to control cost/latency.
    setCache(cacheKey, payload, 6 * 60 * 60 * 1000); // 6 hours
    return sendJson(req, res, 200, payload);
  } catch (e) {
    return sendJson(req, res, 502, {
      error: e.code || "upstream_error",
      message: e.message || "Failed to reach Google Places API.",
    });
  }
};

