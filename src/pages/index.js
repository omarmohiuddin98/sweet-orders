import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Nav from "@/components/Nav";
import Receipt from "@/components/Receipt";
import { BUSINESS, DEFAULT_PRODUCTS, genOrderId } from "@/lib/constants";
import { createOrder, getProducts } from "@/lib/orders";

// ── The form state lives OUTSIDE the component tree so re-renders
//    never unmount/remount the inputs (this fixes the "kicked out" bug)
const INITIAL = {
  name: "", phone: "", address: "",
  productIndex: 0,
  deliveryDate: "", deliveryTime: "",
  payment: "Advance", deliveryCharges: false, notes: "",
};

export default function OrderPage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {});
  }, []);

  // Stable setter — never recreated, so inputs don't re-mount
  const set = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);

  const selectedProduct = products[form.productIndex] || products[0] || { name: "", price: 0 };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.deliveryDate) e.deliveryDate = "Required";
    if (!form.deliveryTime) e.deliveryTime = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        product: selectedProduct.name,
        price: Number(selectedProduct.price),
        deliveryDate: form.deliveryDate,
        deliveryTime: form.deliveryTime,
        payment: form.payment,
        deliveryCharges: form.deliveryCharges,
        notes: form.notes,
        orderId: genOrderId(),
        status: "New",
        createdAt: new Date().toISOString(),
      };
      await createOrder(order);
      setReceipt(order);
      setForm(INITIAL);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Nav />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 56px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "40px 0 28px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Image src="/logo.png" alt="Cakexplode" width={96} height={96}
              style={{ borderRadius: "50%", objectFit: "cover", border: "4px solid #f5e6e6", boxShadow: "0 8px 24px rgba(201,123,123,.2)" }} />
          </div>
          <h1 style={{ fontSize: 34, color: "var(--brown)", marginBottom: 6 }}>Cakexplode</h1>
          <p style={{ color: "#c97b7b", fontSize: 12, letterSpacing: "0.12em", fontWeight: 600, marginBottom: 10 }}>
            AN EXPLOSION OF SWEETNESS
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
            Handcrafted cakes delivered to your door.<br />
            Fill in your details and we'll confirm shortly.
          </p>
        </div>

        <div className="card" style={{ borderRadius: 20, boxShadow: "0 8px 40px rgba(140,80,50,.08)" }}>
          <h2 style={{ fontSize: 20, color: "var(--brown)", marginBottom: 22 }}>Place Your Order</h2>

          {/* Name + Phone */}
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name"
                style={errors.name ? { borderColor: "#c0392b" } : {}}
              />
              {errors.name && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
            </div>
            <div className="form-group">
              <label>Phone / WhatsApp</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="03XX-XXXXXXX"
                style={errors.phone ? { borderColor: "#c0392b" } : {}}
              />
              {errors.phone && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label>Delivery Address</label>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Street, Block, City"
              style={errors.address ? { borderColor: "#c0392b" } : {}}
            />
            {errors.address && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{errors.address}</p>}
          </div>

          {/* Product */}
          <div className="form-group">
            <label>Select Product</label>
            <select
              value={form.productIndex}
              onChange={(e) => set("productIndex", Number(e.target.value))}
            >
              {products.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Price — read only */}
          <div className="form-group">
            <label>Price (Rs.)</label>
            <div style={{
              padding: "10px 14px",
              border: "1.5px solid var(--border)",
              borderRadius: 10,
              background: "#fdf8f5",
              fontSize: 14,
              fontWeight: 600,
              color: selectedProduct.price > 0 ? "#c97b7b" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>
                {selectedProduct.price > 0
                  ? `Rs. ${Number(selectedProduct.price).toLocaleString()}`
                  : "Price will be confirmed by team"}
              </span>
              <span style={{
                fontSize: 11, background: "#f0e4cc", color: "#c9830a",
                padding: "2px 8px", borderRadius: 6, fontWeight: 500,
              }}>Auto</span>
            </div>
          </div>

          {/* Date + Time */}
          <div className="form-row">
            <div className="form-group">
              <label>Delivery Date</label>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => set("deliveryDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={errors.deliveryDate ? { borderColor: "#c0392b" } : {}}
              />
              {errors.deliveryDate && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{errors.deliveryDate}</p>}
            </div>
            <div className="form-group">
              <label>Delivery Time</label>
              <input
                type="time"
                value={form.deliveryTime}
                onChange={(e) => set("deliveryTime", e.target.value)}
                style={errors.deliveryTime ? { borderColor: "#c0392b" } : {}}
              />
              {errors.deliveryTime && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{errors.deliveryTime}</p>}
            </div>
          </div>

          {/* Payment + Delivery Charges */}
          <div className="form-row">
            <div className="form-group">
              <label>Payment Type</label>
              <select value={form.payment} onChange={(e) => set("payment", e.target.value)}>
                <option>Advance</option>
                <option>COD</option>
              </select>
            </div>
            <div className="form-group" style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 0 }}>
                <input
                  type="checkbox"
                  checked={form.deliveryCharges}
                  onChange={(e) => set("deliveryCharges", e.target.checked)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: "var(--brown)" }}>Delivery charges paid by me</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Flavor preferences, design details, allergies..."
            />
          </div>

          <button
            className="btn-primary"
            onClick={submit}
            disabled={submitting}
            style={{ width: "100%", padding: 14, fontSize: 16, marginTop: 4 }}
          >
            {submitting ? "Placing Order..." : "🎂 Place Order"}
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 28, color: "var(--text-muted)", fontSize: 13, lineHeight: 2.2 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            <a href={BUSINESS.instagramUrl} target="_blank" rel="noreferrer"
              style={{ color: "var(--rose)", textDecoration: "none", fontWeight: 600 }}>
              📸 {BUSINESS.instagram}
            </a>
            <a href={BUSINESS.whatsappUrl} target="_blank" rel="noreferrer"
              style={{ color: "#25d366", textDecoration: "none", fontWeight: 600 }}>
              💬 {BUSINESS.whatsapp}
            </a>
          </div>
        </div>
      </div>

      {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
