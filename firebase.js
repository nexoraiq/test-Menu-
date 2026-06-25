// ============================================================
//  firebase.js  —  مطعم الأصالة · Firebase Firestore Layer
//  All CRUD operations for the products collection
// ============================================================

import { initializeApp }                        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
}                                               from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ──────────────────────────────────────────────
//  Firebase Configuration
// ──────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyAaS8ay9SbnNT73Zy6C-C7hBQXBB-cJgHI",
  authDomain:        "test-mneo.firebaseapp.com",
  projectId:         "test-mneo",
  storageBucket:     "test-mneo.firebasestorage.app",
  messagingSenderId: "28218311069",
  appId:             "1:28218311069:web:6e7539b144119697ceaf74",
};

// ──────────────────────────────────────────────
//  Initialize
// ──────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/** Firestore collection reference */
const PRODUCTS_COL = "products";
const productsRef  = collection(db, PRODUCTS_COL);

// ──────────────────────────────────────────────
//  Helper: normalise a Firestore doc → JS object
// ──────────────────────────────────────────────
function docToProduct(docSnap) {
  const d = docSnap.data();
  return {
    id:         docSnap.id,
    name:       d.name        ?? "",
    desc:       d.description ?? "",
    price:      Number(d.price)  || 0,
    img:        d.image       ?? "",
    categoryId: d.category    ?? "",
    badge:      d.badge       ?? "",
    createdAt:  d.createdAt   ?? null,
  };
}

// ──────────────────────────────────────────────
//  getProducts()
//  Fetches all products once, ordered by name.
//  Returns: Promise<Array<product>>
// ──────────────────────────────────────────────
export async function getProducts() {
  try {
    const q        = query(productsRef, orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToProduct);
  } catch (err) {
    console.error("[Firebase] getProducts error:", err);
    throw err;
  }
}

// ──────────────────────────────────────────────
//  subscribeProducts(callback)
//  Real-time listener — fires whenever products
//  collection changes.
//  Returns: unsubscribe function
// ──────────────────────────────────────────────
export function subscribeProducts(callback) {
  const q = query(productsRef, orderBy("name"));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map(docToProduct);
      callback(null, list);
    },
    (err) => {
      console.error("[Firebase] onSnapshot error:", err);
      callback(err, []);
    }
  );
}

// ──────────────────────────────────────────────
//  addProduct(data)
//  Adds a new product document to Firestore.
//  data: { name, description, price, image, category, badge }
//  Returns: Promise<{ id: string }>
// ──────────────────────────────────────────────
export async function addProduct(data) {
  try {
    const payload = {
      name:        data.name        ?? "",
      description: data.description ?? data.desc ?? "",
      price:       Number(data.price) || 0,
      image:       data.image       ?? data.img  ?? "",
      category:    data.category    ?? data.categoryId ?? "",
      badge:       data.badge       ?? "",
      createdAt:   serverTimestamp(),
    };
    const docRef = await addDoc(productsRef, payload);
    console.log("[Firebase] Product added:", docRef.id);
    return { id: docRef.id };
  } catch (err) {
    console.error("[Firebase] addProduct error:", err);
    throw err;
  }
}

// ──────────────────────────────────────────────
//  updateProduct(id, data)
//  Updates an existing product document.
//  data: partial { name, description, price, image, category, badge }
//  Returns: Promise<void>
// ──────────────────────────────────────────────
export async function updateProduct(id, data) {
  try {
    const docRef = doc(db, PRODUCTS_COL, id);
    const payload = {};
    if (data.name        !== undefined) payload.name        = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.desc        !== undefined) payload.description = data.desc;
    if (data.price       !== undefined) payload.price       = Number(data.price) || 0;
    if (data.image       !== undefined) payload.image       = data.image;
    if (data.img         !== undefined) payload.image       = data.img;
    if (data.category    !== undefined) payload.category    = data.category;
    if (data.categoryId  !== undefined) payload.category    = data.categoryId;
    if (data.badge       !== undefined) payload.badge       = data.badge;
    payload.updatedAt = serverTimestamp();
    await updateDoc(docRef, payload);
    console.log("[Firebase] Product updated:", id);
  } catch (err) {
    console.error("[Firebase] updateProduct error:", err);
    throw err;
  }
}

// ──────────────────────────────────────────────
//  deleteProduct(id)
//  Permanently removes a product document.
//  Returns: Promise<void>
// ──────────────────────────────────────────────
export async function deleteProduct(id) {
  try {
    await deleteDoc(doc(db, PRODUCTS_COL, id));
    console.log("[Firebase] Product deleted:", id);
  } catch (err) {
    console.error("[Firebase] deleteProduct error:", err);
    throw err;
  }
}

// ──────────────────────────────────────────────
//  Export db for any advanced usage
// ──────────────────────────────────────────────
export { db };
