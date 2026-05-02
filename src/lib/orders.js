// src/lib/orders.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "orders";

export async function createOrder(orderData) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...orderData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllOrders() {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }));
}

export async function updateOrderStatus(docId, status) {
  const ref = doc(db, COLLECTION, docId);
  await updateDoc(ref, { status });
}
