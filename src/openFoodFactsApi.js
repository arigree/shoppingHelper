const BASE = "https://world.openfoodfacts.org";
const defaultHeaders = {
  Accept: "application/json",
  "User-Agent": "SustainableShoppingHelper/1.0 (you@example.com)",
};

// small in-memory cache
const _cache = new Map();
function cacheGet(key) {
  const e = _cache.get(key);
  if (!e) return null;
  if (Date.now() > e.expiry) {
    _cache.delete(key);
    return null;
  }
  return e.value;
}
function cacheSet(key, value, ttl = 1000 * 60 * 5) {
  // default 5 minutes
  _cache.set(key, { value, expiry: Date.now() + ttl });
}

/**
 * Generic search by OpenFoodFacts query params
 * @param {URLSearchParams} params
 */
async function rawSearch(
  params,
  { useCache = true, cacheKey = null, cacheTTL = 300000 } = {}
) {
  if (!params.has("fields")) {
    params.set(
      "fields",
      [
        "product_name",
        "generic_name",
        "code",
        "image_front_small_url",
        "image_front_url",
        "brands",
        "ecoscore_grade",
        "nutriments",
        "categories_tags",
        "packaging",
      ].join(",")
    );
  }

  const url = `${BASE}/cgi/search.pl?${params.toString()}`;

  if (useCache) {
    const key = cacheKey || url;
    const cached = cacheGet(key);
    if (cached) return cached;
  }

  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`OFF API error: ${res.status}`);
  const json = await res.json();

  if (useCache) cacheSet(cacheKey || url, json, cacheTTL);
  return json;
}

/**
 * Get products for a given category
 * @param {string} category
 * @param {number} pageSize
 * @param {Object} opts
 */
export async function getProductsByCategory(
  category,
  pageSize = 50,
  opts = {}
) {
  const { country, useCache = true } = opts;
  const tag = String(category).toLowerCase().replace(/\s+/g, "-");

  const params = new URLSearchParams({
    search_terms: "",
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: String(pageSize),
    tagtype_0: "categories",
    tag_contains_0: "contains",
    tag_0: tag,
  });

  //trying to speed up category search, searching for products in the united states (see home.html)
  if (country && country.length) {
    params.set("tagtype_1", "countries");
    params.set("tag_contains_1", "contains");
    params.set("tag_1", String(country));
  }

  const cacheKey = `cat:${category}:pg:${pageSize}:country:${country || "any"}`;
  const result = await rawSearch(params, { useCache, cacheKey });
  return result.products || [];
}

/**
 * Return N random products for a category.
 * Accepts same opts as getProductsByCategory
 */
export async function getRandomProductsForCategory(
  category,
  count = 6,
  pageSize = 60,
  opts = {}
) {
  const prods = await getProductsByCategory(category, pageSize, opts);
  if (!prods || prods.length === 0) return [];

  const filtered = prods.filter(
    (p) =>
      (p.product_name || p.generic_name) &&
      (p.image_front_small_url || p.image_front_url || p.image_url)
  );
  if (filtered.length <= count) return filtered.slice(0, count);

  // pick random unique
  const picked = new Set();
  const out = [];
  while (out.length < count && picked.size < filtered.length) {
    const idx = Math.floor(Math.random() * filtered.length);
    if (!picked.has(idx)) {
      picked.add(idx);
      out.push(filtered[idx]);
    }
  }
  return out;
}

/**
 * Get a single product by barcode.
 */
export async function getProductByBarcode(
  barcode,
  { useCache = true, cacheTTL = 300000 } = {}
) {
  if (!barcode) return null;
  const clean = String(barcode).trim();
  const url = `${BASE}/api/v0/product/${encodeURIComponent(clean)}.json`;

  if (useCache) {
    const cached = cacheGet(url);
    if (cached) return cached;
  }

  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Product lookup failed: ${res.status}`);
  const data = await res.json();
  if (data && data.status === 1) {
    if (useCache) cacheSet(url, data.product, cacheTTL);
    return data.product;
  }
  return null;
}
