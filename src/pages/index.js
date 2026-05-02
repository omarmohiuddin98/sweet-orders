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
  notes: "",
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
        payment: "Advance (Bank Transfer)",
        deliveryCharges: true,
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

          {/* Payment Type */}
          <div className="form-group">
            <label>Payment Type</label>
            <div style={{
              padding: "10px 14px", border: "1.5px solid var(--border)",
              borderRadius: 10, background: "#e8f2ec", fontSize: 14,
              fontWeight: 600, color: "#4a7c59",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>Bank Transfer (Advance)</span>
              <span style={{ fontSize: 11, background: "#c8e6d0", color: "#2e6b42",
                padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>Only</span>
            </div>
          </div>

          {/* Delivery Charges Notice */}
          <div className="form-group">
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "#fef3e2", border: "1.5px solid #f0d080",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <span style={{ fontSize: 18, marginTop: 1 }}>🚗</span>
              <p style={{ fontSize: 13, color: "#7a5000", lineHeight: 1.5, margin: 0 }}>
                <strong>Delivery Charges:</strong> Delivery is handled by a third-party service and charges are always paid by the customer at the time of delivery.
              </p>
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
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            <a href={BUSINESS.instagramUrl} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                color: "white", padding: "8px 16px", borderRadius: 12, fontWeight: 600, fontSize: 13 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              {BUSINESS.instagram}
            </a>
            <a href={BUSINESS.whatsappUrl} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                background: "#25d366", color: "white",
                padding: "8px 16px", borderRadius: 12, fontWeight: 600, fontSize: 13 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {BUSINESS.whatsapp}
            </a>
          </div>
        </div>
      </div>

      {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
