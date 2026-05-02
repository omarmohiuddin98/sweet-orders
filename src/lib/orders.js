import {
  collection, addDoc, getDocs, doc,
  updateDoc, setDoc, getDoc, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_PRODUCTS } from "./constants";

const ORDERS_COL = "orders";

export async function createOrder(orderData) {
  const docRef = await addDoc(collection(db, ORDERS_COL), {
    ...orderData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllOrders() {
  const q = query(collection(db, ORDERS_COL), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }));
}

export async function updateOrderStatus(docId, status) {
  await updateDoc(doc(db, ORDERS_COL, docId), { status });
}

export async function getProducts() {
  try {
    const snap = await getDoc(doc(db, "config", "products"));
    if (snap.exists() && snap.data().list) return snap.data().list;
    return DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export async function saveProducts(products) {
  await setDoc(doc(db, "config", "products"), { list: products });
}
