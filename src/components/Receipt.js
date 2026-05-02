import Image from "next/image";
import { BUSINESS, formatDate, formatTime } from "@/lib/constants";
import { generatePDF } from "@/lib/generatePDF";

export default function Receipt({ order, onClose }) {
  const handleWhatsApp = () => {
    const text =
      `🎂 *${BUSINESS.name} — Order Receipt*\n\n` +
      `*Order ID:* ${order.orderId}\n` +
      `*Name:* ${order.name}\n` +
      `*Product:* ${order.product}\n` +
      `*Price:* Rs. ${Number(order.price).toLocaleString()}\n` +
      `*Delivery:* ${formatDate(order.deliveryDate)} at ${formatTime(order.deliveryTime)}\n` +
      `*Payment:* ${order.payment}\n` +
      `*Address:* ${order.address}\n\n` +
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
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(30,10,0,.55)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "white", borderRadius: 20, maxWidth: 440, width: "100%",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #e8845a, #c96a3a)",
          padding: "28px 28px 20px", borderRadius: "20px 20px 0 0",
          color: "white", textAlign: "center",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <Image src="/logo.png" alt="Cakexplode" width={64} height={64}
              style={{ borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)", objectFit: "cover" }} />
          </div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, marginBottom: 8 }}>Order Confirmed!</h2>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "10px 14px", margin: "0 0 4px", fontSize: 13, lineHeight: 1.6 }}>
            📲 Please share this order confirmation receipt and advance payment receipt to our WhatsApp number <strong>{BUSINESS.whatsapp}</strong>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{
              fontFamily: "monospace", background: "#fdf8f5",
              border: "1px solid #e8d5c8", padding: "6px 16px",
              borderRadius: 8, fontSize: 13, color: "#5c3d2e", fontWeight: 600,
            }}>#{order.orderId}</span>
            <p style={{ fontSize: 11, color: "#7a5c4a", marginTop: 6 }}>
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Product + price */}
          <div style={{ background: "#fdf8f5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14, flex: 1, marginRight: 8 }}>{order.product}</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#c97b7b", whiteSpace: "nowrap" }}>
                Rs. {Number(order.price).toLocaleString()}
              </span>
            </div>
            {order.deliveryCharges && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7a5c4a" }}>
                <span>Delivery Charges</span><span>Paid by Customer</span>
              </div>
            )}
            <div style={{ borderTop: "1px solid #e8d5c8", marginTop: 10, paddingTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15 }}>
                <span>Total</span>
                <span style={{ color: "#c97b7b" }}>Rs. {Number(order.price).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ fontSize: 13, color: "#5c3d2e", lineHeight: 1.9 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              <div><span style={{ color: "#7a5c4a" }}>Customer: </span><strong>{order.name}</strong></div>
              <div><span style={{ color: "#7a5c4a" }}>Phone: </span><strong>{order.phone}</strong></div>
              <div style={{ gridColumn: "1/-1" }}>
                <span style={{ color: "#7a5c4a" }}>Address: </span><strong>{order.address}</strong>
              </div>
              <div><span style={{ color: "#7a5c4a" }}>Date: </span><strong>{formatDate(order.deliveryDate)}</strong></div>
              <div><span style={{ color: "#7a5c4a" }}>Time: </span><strong>{formatTime(order.deliveryTime)}</strong></div>
              <div>
                <span style={{ color: "#7a5c4a" }}>Payment: </span>
                <span style={{
                  background: "#e8f2ec",
                  color: "#4a7c59",
                  padding: "1px 8px", borderRadius: 6, fontWeight: 600,
                }}>{order.payment}</span>
              </div>
            </div>
            {order.notes && (
              <div style={{ marginTop: 8, padding: 10, background: "#f5f0ec", borderRadius: 8 }}>
                <span style={{ color: "#7a5c4a" }}>Notes: </span>{order.notes}
              </div>
            )}
          </div>

          {/* Payment details */}
          <div style={{ marginTop: 16, background: "#5c3d2e", color: "white", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>💳 Payment Details</p>
            <div style={{ fontSize: 12, lineHeight: 2, opacity: 0.92 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Bank</span><strong>{BUSINESS.bankName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Account Title</span><strong>{BUSINESS.accountTitle}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Account No.</span><strong>{BUSINESS.accountNumber}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>IBAN</span><strong style={{ fontSize: 11 }}>{BUSINESS.iban}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Raast ID</span><strong>{BUSINESS.raastId}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "0 24px 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-primary btn-small" onClick={() => generatePDF(order)} style={{ flex: 1 }}>
            ⬇ Download PDF
          </button>
          <button className="btn-secondary btn-small" onClick={handleWhatsApp} style={{ flex: 1 }}>
            📋 Copy for WhatsApp
          </button>
          <button className="btn-secondary btn-small" onClick={onClose} style={{ width: "100%" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
