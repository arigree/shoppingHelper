const BASE = 'https://world.openfoodfacts.org';

const defaultHeaders = {
  'Accept': 'application/json',

  'User-Agent': 'SustainableShoppingHelper/1.0 (you@example.com)'
};

/**
 * Search products by term.
 * @param {string} q
 * @param {number} pageSize
 */
export async function searchProducts(q, pageSize = 20) {
  const params = new URLSearchParams({
    search_terms: q,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(pageSize)
  });
  const url = `${BASE}/cgi/search.pl?${params.toString()}`;
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  // returns data.products (array)
  return data.products || [];
}

/**
 * Get product by barcode
 * @param {string} barcode
 */
export async function getProductByBarcode(barcode) {
  const url = `${BASE}/api/v0/product/${barcode}.json`;
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Lookup failed: ${res.status}`);
  const data = await res.json();
  return data.status === 1 ? data.product : null;
}