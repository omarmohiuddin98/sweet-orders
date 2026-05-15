import { BUSINESS, formatDate, formatTime } from "./constants";

export async function generatePDF(order) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // Support both new (items array) and legacy orders
  const items = order.items || [{ name: order.product, price: order.price, qty: 1, subtotal: order.price }];
  const grandTotal = items.reduce((s, i) => s + (i.subtotal || 0), 0);

  // Header
  doc.setFillColor(232, 132, 90);
  doc.rect(0, 0, W, 38, "F");
  try {
    const img = new Image();
    img.src = "/logo.png";
    await new Promise((res) => { img.onload = res; img.onerror = res; });
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);
    doc.addImage(canvas.toDataURL("image/png"), "PNG", W / 2 - 10, 3, 20, 20);
  } catch {}
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14); doc.setFont("helvetica", "bold");
  doc.text(BUSINESS.name, W / 2, 28, { align: "center" });
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text(BUSINESS.tagline.toUpperCase(), W / 2, 34, { align: "center" });
  y = 44;

  // Order ID
  doc.setTextColor(92, 61, 46); doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text(`Order ID: ${order.orderId}`, W / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(122, 92, 74);
  doc.text(new Date(order.createdAt).toLocaleString(), W / 2, y, { align: "center" });
  y += 10;

  // Customer details
  const row = (label, value) => {
    doc.setFont("helvetica", "bold"); doc.setTextColor(92, 61, 46); doc.setFontSize(9);
    doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(26, 16, 8);
    const lines = doc.splitTextToSize(String(value), 88);
    doc.text(lines, 58, y);
    y += lines.length * 6;
  };

  doc.setFillColor(253, 248, 245);
  doc.rect(10, y - 3, W - 20, 36, "F");
  y += 2;
  row("Customer", order.name);
  row("Phone", order.phone);
  row("Address", order.address);
  row("Delivery", `${formatDate(order.deliveryDate)} at ${formatTime(order.deliveryTime)}`);
  row("Payment", "Advance (Bank Transfer)");
  y += 6;

  // Items table header
  doc.setFillColor(92, 61, 46);
  doc.rect(10, y, W - 20, 7, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("ITEM", 14, y + 5);
  doc.text("QTY", W / 2, y + 5, { align: "center" });
  doc.text("SUBTOTAL", W - 14, y + 5, { align: "right" });
  y += 10;

  // Items rows
  items.forEach((item, i) => {
    doc.setFillColor(i % 2 === 0 ? 253 : 248, i % 2 === 0 ? 248 : 244, i % 2 === 0 ? 245 : 240);
    doc.rect(10, y - 4, W - 20, 10, "F");
    doc.setTextColor(26, 16, 8); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    const nameLines = doc.splitTextToSize(item.name, 70);
    doc.text(nameLines, 14, y);
    doc.text(String(item.qty), W / 2, y, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(item.price > 0 ? `Rs. ${item.subtotal.toLocaleString()}` : "TBD", W - 14, y, { align: "right" });
    y += nameLines.length > 1 ? nameLines.length * 5 + 2 : 10;
  });

  // Delivery charges row
  doc.setFillColor(254, 243, 226);
  doc.rect(10, y - 2, W - 20, 8, "F");
  doc.setTextColor(122, 80, 0); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("Delivery Charges", 14, y + 3);
  doc.setFont("helvetica", "bold");
  doc.text("Paid by Customer", W - 14, y + 3, { align: "right" });
  y += 10;

  // Grand total
  doc.setFillColor(201, 123, 123);
  doc.rect(10, y - 2, W - 20, 9, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("GRAND TOTAL", 14, y + 4);
  doc.text(`Rs. ${grandTotal.toLocaleString()}`, W - 14, y + 4, { align: "right" });
  y += 16;

  // Notes
  if (order.notes) {
    doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(92, 61, 46);
    doc.text(`Notes: ${order.notes}`, 14, y);
    y += 8;
  }

  // Payment details box
  doc.setFillColor(92, 61, 46);
  doc.rect(10, y, W - 20, 40, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("Payment Details", 14, y + 8);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text(`Bank: ${BUSINESS.bankName}  |  Account: ${BUSINESS.accountTitle}`, 14, y + 16);
  doc.text(`Account No: ${BUSINESS.accountNumber}`, 14, y + 23);
  doc.text(`IBAN: ${BUSINESS.iban}`, 14, y + 30);
  doc.text(`Raast ID: ${BUSINESS.raastId}`, 14, y + 37);
  y += 48;

  // Footer
  doc.setTextColor(122, 92, 74); doc.setFontSize(8);
  doc.text(`Instagram: ${BUSINESS.instagram}  |  WhatsApp: ${BUSINESS.whatsapp}`, W / 2, y, { align: "center" });
  y += 5;
  doc.text("Thank you for your order!", W / 2, y, { align: "center" });

  doc.save(`receipt_${order.orderId}.pdf`);
}
