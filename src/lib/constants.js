// src/lib/constants.js

export const DEFAULT_PRODUCTS = [
  { name: "Mother's Day Deal #1 — Floral Fondant Cake", price: 2500 },
  { name: "Mother's Day Deal #2 — Chocolate Ganache Cake", price: 2800 },
  { name: "Birthday Tier Cake", price: 3200 },
  { name: "Wedding Mini Cakes (dozen)", price: 4500 },
  { name: "Custom Design Cake", price: 0 },
];

export const STATUS_OPTIONS = ["New", "Confirmed", "In Progress", "Delivered"];

export const BUSINESS = {
  name: "Cakexplode",
  tagline: "An Explosion of Sweetness",
  instagram: "@cake.xplode",
  instagramUrl: "https://www.instagram.com/cake.xplode/",
  whatsapp: "03300254290",
  whatsappUrl: "https://wa.me/923300254290",
  bankName: "HBL Bank",
  accountTitle: "Fareeha Zahid",
  accountNumber: "53957000131861",
  iban: "PK04HABB0000005000047702",
  raastId: "03362040311",
};

export function genOrderId() {
  return "CX-" + Date.now().toString(36).toUpperCase().slice(-6);
}

export function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}
