import {
  getProductsByCategory,
  getRandomProductsForCategory,
} from "/src/openFoodFactsApi.js";
import { addProductToList } from "/src/firestoreHelpers.js";
import { auth } from "/src/firebase.js";
import { onAuthChange } from "/src/authHelpers.js";

const searchInput =
  document.getElementById("homeSearchInput") ||
  document.getElementById("searchInput");
const searchBtn =
  document.getElementById("homeSearchBtn") ||
  document.getElementById("searchBtn");
const categoriesRow =
  document.getElementById("categoriesRow") ||
  document.getElementById("categoriesRowSearch");
const productsGrid =
  document.getElementById("productsGrid") ||
  document.getElementById("productsGridSearch");
const statusEl =
  document.getElementById("homeStatus") ||
  document.getElementById("searchStatus");

if (!productsGrid) {
  console.warn(
    "searchPage.js: productsGrid element not found. Make sure your search page has a #productsGrid element."
  );
}

// categories
const categories = [
  "Fruits",
  "Vegetables",
  "Bakery",
  "Snacks",
  "Beverages",
  "Dairy",
];

let activeCategory = categories[0];

function escapeHtml(str) {
  return String(str || "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

function createChip(name) {
  const btn = document.createElement("button");
  btn.className = "pill";
  btn.textContent = name;
  btn.style.margin = "6px";
  btn.style.background = name === activeCategory ? "var(--signup)" : "#fff";
  btn.style.color = name === activeCategory ? "#fff" : "#333";
  btn.addEventListener("click", () => {
    if (activeCategory === name) return;
    setActiveCategory(name);
    loadCategory(name);
  });
  return btn;
}

function setActiveCategory(name) {
  activeCategory = name;
  Array.from(categoriesRow.children || []).forEach((ch) => {
    ch.style.background = ch.textContent === name ? "var(--signup)" : "#fff";
    ch.style.color = ch.textContent === name ? "#fff" : "#333";
  });
}

function clearProducts() {
  if (productsGrid) productsGrid.innerHTML = "";
}

function renderProductCard(p) {
  if (!productsGrid) return;

  const title = p.product_name || p.generic_name || "No name";
  const img =
    p.image_front_small_url ||
    p.image_front_url ||
    p.image_url ||
    "/public/images/logo.png";
  const ecoscore = (p.ecoscore_grade || "").toUpperCase();

  let dotColor = "#d9d9d9";
  if (ecoscore === "A" || ecoscore === "B") dotColor = "#27C427";
  else if (ecoscore === "C") dotColor = "#FFC300";
  else if (ecoscore === "D" || ecoscore === "E") dotColor = "#FF6B6B";

  const card = document.createElement("div");
  card.className = "product-card";
  card.style.background = "#fff";
  card.style.borderRadius = "12px";
  card.style.padding = "12px";
  card.style.textAlign = "center";
  card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.04)";
  card.style.minHeight = "220px";
  card.style.position = "relative";
  card.style.display = "flex";
  card.style.flexDirection = "column";
  card.style.justifyContent = "space-between";

  const imgWrap = document.createElement("div");
  imgWrap.style.height = "120px";
  imgWrap.style.display = "flex";
  imgWrap.style.alignItems = "center";
  imgWrap.style.justifyContent = "center";
  imgWrap.style.overflow = "hidden";

  const imgEl = document.createElement("img");
  imgEl.src = img;
  imgEl.alt = title;
  imgEl.style.maxHeight = "110px";
  imgEl.style.maxWidth = "100%";
  imgEl.style.objectFit = "contain";
  imgWrap.appendChild(imgEl);

  const titleEl = document.createElement("div");
  titleEl.style.fontWeight = "700";
  titleEl.style.marginTop = "8px";
  titleEl.style.fontSize = "14px";
  titleEl.textContent = title;

  const priceEl = document.createElement("div");
  priceEl.style.color = "var(--muted)";
  priceEl.style.fontSize = "13px";
  priceEl.style.marginTop = "6px";
  priceEl.textContent = "Price";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "8px";
  actions.style.justifyContent = "center";
  actions.style.marginTop = "10px";

  const viewBtn = document.createElement("button");
  viewBtn.className = "btn btn-ghost";
  viewBtn.textContent = "View";
  viewBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (p.code) {
      window.open(
        `https://world.openfoodfacts.org/product/${p.code}`,
        "_blank"
      );
    }
  });

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.textContent = "Add";
  addBtn.addEventListener("click", async (ev) => {
    ev.stopPropagation();
    const user = auth.currentUser;
    if (!user) {
      // Not signed in — redirect to homepage where they can login
      window.location.href = "/";
      return;
    }
    // build product data minimal subset
    const productData = {
      code: p.code,
      product_name: p.product_name || p.generic_name || "",
      brands: p.brands || "",
      image: p.image_front_small_url || p.image_front_url || p.image_url || "",
      ecoscore: p.ecoscore_grade || p.ecoscore_score || null,
      nutriments: p.nutriments || {},
      addedAt: Date.now(),
    };
    try {
      await addProductToList(user.uid, productData);
      // provide quick feedback
      addBtn.textContent = "Added";
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = "Add";
        addBtn.disabled = false;
      }, 1200);
    } catch (err) {
      console.error("Add failed", err);
      alert("Failed to add item: " + (err.message || err));
    }
  });

  actions.appendChild(viewBtn);
  actions.appendChild(addBtn);

  // ecoscore dot
  const dot = document.createElement("div");
  dot.style.width = "12px";
  dot.style.height = "12px";
  dot.style.borderRadius = "50%";
  dot.style.background = dotColor;
  dot.style.position = "absolute";
  dot.style.top = "12px";
  dot.style.right = "12px";

  card.appendChild(imgWrap);
  card.appendChild(titleEl);
  card.appendChild(priceEl);
  card.appendChild(actions);
  card.appendChild(dot);

  productsGrid.appendChild(card);
}

async function loadCategory(catName) {
  if (!productsGrid || !statusEl) return;
  clearProducts();
  statusEl.textContent = `Loading ${catName}...`;
  try {
    const prods = await getRandomProductsForCategory(catName, 8, 100);
    if (!prods || prods.length === 0) {
      statusEl.textContent = "No products found for that category.";
      return;
    }
    statusEl.textContent = "";
    prods.forEach(renderProductCard);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error loading products.";
  }
}

async function performSearch(term) {
  if (!productsGrid || !statusEl) return;
  clearProducts();
  statusEl.textContent = `Searching for "${term}"...`;
  try {
    // Try category-based fetch first
    let results = [];
    try {
      results = await getProductsByCategory(term, 40);
    } catch (e) {
      // ignore and fallback
    }

    if (!results || results.length === 0) {
      const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
      url.searchParams.set("search_terms", term);
      url.searchParams.set("search_simple", "1");
      url.searchParams.set("action", "process");
      url.searchParams.set("json", "1");
      url.searchParams.set("page_size", "40");
      const res = await fetch(url.toString());
      const json = await res.json();
      results = json.products || [];
    }

    const filtered = (results || []).filter(
      (p) =>
        (p.product_name || p.generic_name) &&
        (p.image_front_small_url || p.image_front_url || p.image_url)
    );
    if (!filtered.length) {
      statusEl.textContent = "No results";
      return;
    }
    statusEl.textContent = "";
    filtered.slice(0, 24).forEach(renderProductCard);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Search error";
  }
}

function initChips() {
  if (!categoriesRow) return;
  categoriesRow.innerHTML = "";
  categories.forEach((c) => categoriesRow.appendChild(createChip(c)));
  setActiveCategory(activeCategory);
}

// Attach handlers
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const t = searchInput && searchInput.value ? searchInput.value.trim() : "";
    if (!t) return;
    performSearch(t);
  });
}
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn && searchBtn.click();
  });
}

initChips();
loadCategory(activeCategory);

onAuthChange((user) => {
  if (!user) {
    window.location.href = "/";
  } else {
  }
});
