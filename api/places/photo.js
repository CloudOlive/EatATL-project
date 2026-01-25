const { getGoogleApiKey, handleOptions, rateLimit, sendJson, setCors } = require("./_shared");

/**
 * GET /api/places/photo?ref=PHOTO_REFERENCE&maxwidth=800
 * Streams the image bytes from the Legacy Place Photo endpoint.
 *
 * This prevents exposing the Google API key in the browser.
 */
module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") {
    return sendJson(req, res, 405, { error: "method_not_allowed" });
  }
  if (!rateLimit(req, res)) return;

  const ref = (req.query?.ref || "").toString().trim();
  if (!ref) {
    return sendJson(req, res, 400, { error: "missing_ref" });
  }
  if (ref.length > 1000) {
    return sendJson(req, res, 400, { error: "ref_too_long" });
  }

  const maxwidthRaw = (req.query?.maxwidth || "800").toString().trim();
  const maxwidth = Math.max(200, Math.min(1600, Number.parseInt(maxwidthRaw, 10) || 800));

  let apiKey;
  try {
    apiKey = getGoogleApiKey();
  } catch (e) {
    return sendJson(req, res, 500, { error: e.code || "config_error", message: e.message });
  }

  const url =
    "https://maps.googleapis.com/maps/api/place/photo" +
    `?maxwidth=${encodeURIComponent(String(maxwidth))}` +
    `&photo_reference=${encodeURIComponent(ref)}` +
    `&key=${encodeURIComponent(apiKey)}`;

  try {
    // Follow redirects to the final image host (e.g., googleusercontent.com).
    const upstream = await fetch(url, { redirect: "follow" });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return sendJson(req, res, 502, {
        error: "photo_fetch_failed",
        status: upstream.status,
        message: text.slice(0, 300) || "Failed to fetch photo from Google.",
      });
    }

    setCors(req, res);
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);

    // CDN cache for a day to reduce repeated photo fetches.
    // Note: Review Google Maps Platform Terms before increasing this TTL.
    res.setHeader("Cache-Control", "public, s-maxage=86400, max-age=0");

    const arrayBuffer = await upstream.arrayBuffer();
    res.statusCode = 200;
    res.end(Buffer.from(arrayBuffer));
  } catch (e) {
    return sendJson(req, res, 502, {
      error: "upstream_error",
      message: e.message || "Unexpected error fetching Google photo.",
    });
  }
};

