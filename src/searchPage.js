import { searchProducts, getProductByBarcode } from './openFoodFactsApi.js';
import { addProductToList, getUserList, deleteListItem } from './firestoreHelpers.js';
import { auth } from './firebase.js'; // assumes auth is set up and user is signed in

const qInput = document.getElementById('q');
const results = document.getElementById('results');
const myListDiv = document.getElementById('myList');
const searchBtn = document.getElementById('searchBtn');

async function renderList() {
  const user = auth.currentUser;
  if (!user) {
    myListDiv.innerHTML = '<em>Sign in to save items</em>';
    return;
  }
  const items = await getUserList(user.uid);
  myListDiv.innerHTML = items.map(it => `
    <div style="border:1px solid #ddd; padding:8px; margin:6px;">
      <strong>${it.product_name || it.name}</strong>
      <div>Notes: ${it.notes || ''}</div>
      <button data-id="${it.id}" class="delBtn">Delete</button>
    </div>
  `).join('');
  myListDiv.querySelectorAll('.delBtn').forEach(btn=>{
    btn.addEventListener('click', async e=>{
      const id = e.target.dataset.id;
      await deleteListItem(user.uid, id);
      renderList();
    });
  });
}

searchBtn.addEventListener('click', async () => {
  const q = qInput.value.trim();
  if (!q) return;
  results.innerHTML = 'Searching...';
  try {
    const prods = await searchProducts(q, 12);
    results.innerHTML = prods.map(p => {
      const name = p.product_name || p.generic_name || 'No name';
      const img = p.image_front_small_url || p.image_thumb_url || '';
      const eco = p.ecoscore_grade ? p.ecoscore_grade.toUpperCase() : (p.ecoscore_score ?? '');
      return `
        <div style="border:1px solid #eee; padding:8px; display:flex; gap:10px; margin:6px;">
          <img src="${img}" width="64" height="64" alt="" />
          <div style="flex:1;">
            <div><strong>${name}</strong> <small>${eco ? 'Eco: '+eco : ''}</small></div>
            <div style="font-size:0.9em;">${p.brands || ''}</div>
            <button data-code="${p.code}" class="addBtn">Add</button>
          </div>
        </div>
      `;
    }).join('');

    // attach add listeners
    document.querySelectorAll('.addBtn').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const code = e.target.dataset.code;
        const product = await getProductByBarcode(code);
        const user = auth.currentUser;
        if (!user) {
          alert('Sign in to save items');
          return;
        }
        const productData = {
          code,
          product_name: product.product_name,
          brands: product.brands,
          image: product.image_front_small_url || product.image_front_url,
          ecoscore: product.ecoscore_grade || product.ecoscore_score || null,
          nutriments: product.nutriments || {},
          notes: ''
        };
        await addProductToList(user.uid, productData);
        renderList();
      });
    });

  } catch (err) {
    results.innerHTML = 'Error: ' + err.message;
  }
});

auth.onAuthStateChanged(() => {
  renderList();
});
