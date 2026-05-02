// src/pages/index.js
import { useState } from "react";
import Nav from "@/components/Nav";
import Receipt from "@/components/Receipt";
import { PRODUCTS, BUSINESS, genOrderId } from "@/lib/constants";
import { createOrder } from "@/lib/orders";

export default function OrderPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    product: PRODUCTS[0].name,
    price: PRODUCTS[0].price,
    deliveryDate: "",
    deliveryTime: "",
    payment: "Advance",
    deliveryCharges: false,
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onProductChange = (e) => {
    const p = PRODUCTS.find((x) => x.name === e.target.value);
    set("product", e.target.value);
    if (p && p.price > 0) set("price", p.price);
    else set("price", "");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.price || Number(form.price) <= 0) e.price = "Enter a valid price";
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
        ...form,
        price: Number(form.price),
        orderId: genOrderId(),
        status: "New",
        createdAt: new Date().toISOString(),
      };
      await createOrder(order);
      setReceipt(order);
      setForm({
        name: "", phone: "", address: "",
        product: PRODUCTS[0].name, price: PRODUCTS[0].price,
        deliveryDate: "", deliveryTime: "",
        payment: "Advance", deliveryCharges: false, notes: "",
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ k, label, children }) => (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {errors[k] && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{errors[k]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Nav />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 48px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🎂</div>
          <h1 style={{ fontSize: 34, color: "var(--brown)", marginBottom: 10 }}>Sweet Orders</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7 }}>
            Handcrafted cakes delivered to your door.<br />
            Fill in your details and we'll confirm shortly.
          </p>
        </div>

        <div className="card" style={{ borderRadius: 20, boxShadow: "0 8px 40px rgba(140,80,50,.08)" }}>
          <h2 style={{ fontSize: 20, color: "var(--brown)", marginBottom: 22 }}>Place Your Order</h2>

          <div className="form-row">
            <Field k="name" label="Customer Name">
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name"
                style={errors.name ? { borderColor: "#c0392b" } : {}}
              />
            </Field>
            <Field k="phone" label="Phone / WhatsApp">
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="03XX-XXXXXXX"
                style={errors.phone ? { borderColor: "#c0392b" } : {}}
              />
            </Field>
          </div>

          <Field k="address" label="Delivery Address">
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Street, Block, City"
              style={errors.address ? { borderColor: "#c0392b" } : {}}
            />
          </Field>

          <Field k="product" label="Select Product">
            <select value={form.product} onChange={onProductChange}>
              {PRODUCTS.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </Field>

          <Field k="price" label="Price (Rs.)">
            <input
              type="number"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="Enter price"
              style={errors.price ? { borderColor: "#c0392b" } : {}}
            />
          </Field>

          <div className="form-row">
            <Field k="deliveryDate" label="Delivery Date">
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => set("deliveryDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={errors.deliveryDate ? { borderColor: "#c0392b" } : {}}
              />
            </Field>
            <Field k="deliveryTime" label="Delivery Time">
              <input
                type="time"
                value={form.deliveryTime}
                onChange={(e) => set("deliveryTime", e.target.value)}
                style={errors.deliveryTime ? { borderColor: "#c0392b" } : {}}
              />
            </Field>
          </div>

          <div className="form-row">
            <Field k="payment" label="Payment Type">
              <select value={form.payment} onChange={(e) => set("payment", e.target.value)}>
                <option>Advance</option>
                <option>COD</option>
              </select>
            </Field>
            <div className="form-group" style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 0 }}>
                <input
                  type="checkbox"
                  checked={form.deliveryCharges}
                  onChange={(e) => set("deliveryCharges", e.target.checked)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: "var(--brown)" }}>Delivery charges paid by customer</span>
              </label>
            </div>
          </div>

          <Field k="notes" label="Notes (optional)">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Flavor preferences, design details, allergies..."
            />
          </Field>

          <button
            className="btn-primary"
            onClick={submit}
            disabled={submitting}
            style={{ width: "100%", padding: 14, fontSize: 16, marginTop: 4 }}
          >
            {submitting ? "Placing Order..." : "🎂 Place Order"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, color: "var(--text-muted)", fontSize: 13, lineHeight: 2 }}>
          <p>📱 Instagram: <strong>{BUSINESS.instagram}</strong></p>
          <p>📞 WhatsApp: <strong>{BUSINESS.whatsapp}</strong></p>
        </div>
      </div>

      {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
