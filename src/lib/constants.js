// src/lib/constants.js

export const PRODUCTS = [
  { name: "Mother's Day Deal #1 — Floral Fondant Cake", price: 2500 },
  { name: "Mother's Day Deal #2 — Chocolate Ganache Cake", price: 2800 },
  { name: "Birthday Tier Cake", price: 3200 },
  { name: "Wedding Mini Cakes (dozen)", price: 4500 },
  { name: "Custom Design Cake", price: 0 },
];

export const STATUS_OPTIONS = ["New", "Confirmed", "In Progress", "Delivered"];

export const BUSINESS = {
  name: "Sweet Orders Bakery",
  instagram: "@sweetorders.pk",
  whatsapp: "0300-1234567",
  bankName: "HBL",
  accountTitle: "Sweet Orders Bakery",
  accountNumber: "12345678901234",
  raastId: "sweetorders@hbl",
};

export function genOrderId() {
  return "SO-" + Date.now().toString(36).toUpperCase().slice(-6);
}

export function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}
