import Image from "next/image";
import { BUSINESS, formatDate, formatTime } from "@/lib/constants";
import { generatePDF } from "@/lib/generatePDF";

export default function Receipt({ order, onClose }) {
  // Support both new (items array) and legacy (single product) orders
  const items = order.items || [{ name: order.product, price: order.price, qty: 1, subtotal: order.price }];
  const grandTotal = items.reduce((s, i) => s + (i.subtotal || 0), 0);
  const hasCustom = items.some((i) => i.price === 0);

  const handleWhatsApp = () => {
    const itemLines = items.map((i) =>
      `  • ${i.name} x${i.qty}${i.price > 0 ? ` = Rs. ${i.subtotal.toLocaleString()}` : " (custom price)"}`
    ).join("\n");

    const text =
      `🎂 *${BUSINESS.name} — Order Receipt*\n\n` +
      `*Order ID:* ${order.orderId}\n` +
      `*Name:* ${order.name}\n` +
      `*Phone:* ${order.phone}\n` +
      `*Address:* ${order.address}\n` +
      `*Delivery:* ${formatDate(order.deliveryDate)} at ${formatTime(order.deliveryTime)}\n\n` +
      `*🛒 Order Items:*\n${itemLines}\n\n` +
      `*Grand Total:* Rs. ${grandTotal.toLocaleString()}${hasCustom ? " + custom item(s)" : ""}\n\n` +
      `*Payment:* ${order.payment}\n\n` +
      `💳 *Payment Details:*\n` +
      `Bank: ${BUSINESS.bankName}\n` +
      `Account Title: ${BUSINESS.accountTitle}\n` +
      `Account No: ${BUSINESS.accountNumber}\n` +
      `IBAN: ${BUSINESS.iban}\n` +
      `Raast ID: ${BUSINESS.raastId}\n\n` +
      `📱 Instagram: ${BUSINESS.instagram}`;

    navigator.clipboard.writeText(text).catch(() => {});
    alert("Receipt copied! Paste it in WhatsApp.");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(30,10,0,.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 20, maxWidth: 460, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #e8845a, #c96a3a)", padding: "24px 24px 18px", borderRadius: "20px 20px 0 0", color: "white", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <Image src="/logo.png" alt="Cakexplode" width={60} height={60}
              style={{ borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)", objectFit: "cover" }} />
          </div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 21, marginBottom: 8 }}>Order Confirmed!</h2>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "9px 13px", fontSize: 13, lineHeight: 1.6 }}>
            📲 Please share this receipt and advance payment receipt to our WhatsApp: <strong>{BUSINESS.whatsapp}</strong>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>

          {/* Order ID + date */}
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <span style={{ fontFamily: "monospace", background: "#fdf8f5", border: "1px solid #e8d5c8", padding: "6px 16px", borderRadius: 8, fontSize: 13, color: "#5c3d2e", fontWeight: 600 }}>
              #{order.orderId}
            </span>
            <p style={{ fontSize: 11, color: "#7a5c4a", marginTop: 6 }}>{new Date(order.createdAt).toLocaleString()}</p>
          </div>

          {/* ── Itemized list ── */}
          <div style={{ border: "1.5px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 90px", gap: 8, padding: "8px 14px", background: "#fdf8f5", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
              <span>ITEM</span><span style={{ textAlign: "center" }}>QTY</span><span style={{ textAlign: "right" }}>SUBTOTAL</span>
            </div>

            {/* Items */}
            {items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 40px 90px", gap: 8, padding: "10px 14px", borderBottom: i < items.length - 1 ? "1px solid #f0e8e0" : "none", alignItems: "center", background: "white" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 1 }}>{item.name}</p>
                  {item.price > 0 && <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Rs. {item.price.toLocaleString()} each</p>}
                </div>
                <span style={{ textAlign: "center", fontWeight: 600, fontSize: 14, color: "var(--brown)" }}>{item.qty}</span>
                <span style={{ textAlign: "right", fontWeight: 700, color: "#c97b7b", fontSize: 14 }}>
                  {item.price > 0 ? `Rs. ${item.subtotal.toLocaleString()}` : "TBD"}
                </span>
              </div>
            ))}

            {/* Delivery */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", background: "#fef3e2", fontSize: 12, color: "#7a5000", borderTop: "1px solid #f0d080" }}>
              <span>🚗 Delivery Charges</span><span style={{ fontWeight: 600 }}>Paid by Customer</span>
            </div>

            {/* Grand total */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#fdf8f5", borderTop: "1.5px solid var(--border)", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--brown)" }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#c97b7b" }}>
                Rs. {grandTotal.toLocaleString()}{hasCustom ? " + TBD" : ""}
              </span>
            </div>
          </div>

          {/* Customer details */}
          <div style={{ fontSize: 13, color: "#5c3d2e", lineHeight: 1.9, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px" }}>
              <div><span style={{ color: "#7a5c4a" }}>Customer: </span><strong>{order.name}</strong></div>
              <div><span style={{ color: "#7a5c4a" }}>Phone: </span><strong>{order.phone}</strong></div>
              <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#7a5c4a" }}>Address: </span><strong>{order.address}</strong></div>
              <div><span style={{ color: "#7a5c4a" }}>Date: </span><strong>{formatDate(order.deliveryDate)}</strong></div>
              <div><span style={{ color: "#7a5c4a" }}>Time: </span><strong>{formatTime(order.deliveryTime)}</strong></div>
              <div>
                <span style={{ color: "#7a5c4a" }}>Payment: </span>
                <span style={{ background: "#e8f2ec", color: "#4a7c59", padding: "1px 8px", borderRadius: 6, fontWeight: 600 }}>Advance</span>
              </div>
            </div>
            {order.notes && (
              <div style={{ marginTop: 8, padding: 10, background: "#f5f0ec", borderRadius: 8 }}>
                <span style={{ color: "#7a5c4a" }}>Notes: </span>{order.notes}
              </div>
            )}
          </div>

          {/* Payment details */}
          <div style={{ background: "#5c3d2e", color: "white", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>💳 Payment Details</p>
            <div style={{ fontSize: 12, lineHeight: 2, opacity: 0.92 }}>
              {[
                ["Bank", BUSINESS.bankName],
                ["Account Title", BUSINESS.accountTitle],
                ["Account No.", BUSINESS.accountNumber],
                ["IBAN", BUSINESS.iban],
                ["Raast ID", BUSINESS.raastId],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ opacity: 0.8 }}>{k}</span>
                  <strong style={{ fontSize: k === "IBAN" ? 11 : 12, textAlign: "right" }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-primary btn-small" onClick={() => generatePDF(order)} style={{ flex: 1 }}>⬇ Download PDF</button>
          <button className="btn-secondary btn-small" onClick={handleWhatsApp} style={{ flex: 1 }}>📋 Copy for WhatsApp</button>
          <button className="btn-secondary btn-small" onClick={onClose} style={{ width: "100%" }}>Close</button>
        </div>
      </div>
    </div>
  );
}
