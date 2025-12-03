import { db } from './firebase';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";

/**
 * Save a product to a user's shopping list
 * @param {string} uid - user id
 * @param {object} productData - product object to store
 */
export async function addProductToList(uid, productData) {
  const col = collection(db, 'users', uid, 'shoppingList');
  const docRef = await addDoc(col, {
    ...productData,
    addedAt: Date.now()
  });
  return docRef.id;
}

/**
 * Update an item (notes, quantity, etc.)
 */
export async function updateListItem(uid, itemId, updates) {
  const ref = doc(db, 'users', uid, 'shoppingList', itemId);
  await updateDoc(ref, updates);
}

/**
 * Delete an item
 */
export async function deleteListItem(uid, itemId) {
  const ref = doc(db, 'users', uid, 'shoppingList', itemId);
  await deleteDoc(ref);
}

/**
 * Get all shopping list items for the user
 */
export async function getUserList(uid) {
  const col = collection(db, 'users', uid, 'shoppingList');
  const snapshot = await getDocs(col);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
