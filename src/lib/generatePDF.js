// src/lib/generatePDF.js
import { BUSINESS, formatDate, formatTime } from "./constants";

export async function generatePDF(order) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header
  doc.setFillColor(201, 123, 123);
  doc.rect(0, 0, W, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(BUSINESS.name, W / 2, 13, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Order Receipt", W / 2, 22, { align: "center" });
  y = 38;

  // Order ID
  doc.setTextColor(92, 61, 46);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Order ID: ${order.orderId}`, W / 2, y, { align: "center" });
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(122, 92, 74);
  doc.text(new Date(order.createdAt).toLocaleString(), W / 2, y, { align: "center" });
  y += 12;

  // Details block
  const row = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(92, 61, 46);
    doc.setFontSize(9);
    doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 16, 8);
    const lines = doc.splitTextToSize(String(value), 90);
    doc.text(lines, 60, y);
    y += lines.length * 6;
  };

  doc.setFillColor(253, 248, 245);
  doc.rect(10, y - 4, W - 20, 80, "F");
  y += 2;
  row("Product", order.product);
  row("Price", `Rs. ${Number(order.price).toLocaleString()}`);
  row("Customer", order.name);
  row("Phone", order.phone);
  row("Address", order.address);
  row("Delivery Date", formatDate(order.deliveryDate));
  row("Delivery Time", formatTime(order.deliveryTime));
  row("Payment", order.payment);
  row("Delivery Charges", order.deliveryCharges ? "Paid by Customer" : "Included");
  if (order.notes) row("Notes", order.notes);
  y += 8;

  // Payment details box
  doc.setFillColor(92, 61, 46);
  doc.rect(10, y, W - 20, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Payment Details", 14, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Bank: ${BUSINESS.bankName}  |  Account Title: ${BUSINESS.accountTitle}`, 14, y + 17);
  doc.text(`Account No: ${BUSINESS.accountNumber}`, 14, y + 24);
  doc.text(`Raast ID: ${BUSINESS.raastId}`, 14, y + 31);
  y += 42;

  // Footer
  doc.setTextColor(122, 92, 74);
  doc.setFontSize(9);
  doc.text("Thank you for your order!", W / 2, y, { align: "center" });

  doc.save(`receipt_${order.orderId}.pdf`);
}
