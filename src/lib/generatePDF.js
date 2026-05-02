import { BUSINESS, formatDate, formatTime } from "./constants";

export async function generatePDF(order) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // Orange header background
  doc.setFillColor(232, 132, 90);
  doc.rect(0, 0, W, 38, "F");

  // Try to load logo
  try {
    const img = new Image();
    img.src = "/logo.png";
    await new Promise((res) => { img.onload = res; img.onerror = res; });
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    // Circle clip via ellipse
    doc.addImage(dataUrl, "PNG", W / 2 - 10, 4, 20, 20);
  } catch {}

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(BUSINESS.name, W / 2, 28, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(BUSINESS.tagline.toUpperCase(), W / 2, 34, { align: "center" });
  y = 46;

  // Order ID
  doc.setTextColor(92, 61, 46);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Order ID: ${order.orderId}`, W / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(122, 92, 74);
  doc.text(new Date(order.createdAt).toLocaleString(), W / 2, y, { align: "center" });
  y += 10;

  // Details block
  const row = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(92, 61, 46);
    doc.setFontSize(9);
    doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 16, 8);
    const lines = doc.splitTextToSize(String(value), 88);
    doc.text(lines, 58, y);
    y += lines.length * 6;
  };

  doc.setFillColor(253, 248, 245);
  doc.rect(10, y - 4, W - 20, 78, "F");
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

  // Payment box
  doc.setFillColor(92, 61, 46);
  doc.rect(10, y, W - 20, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Payment Details", 14, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Bank: ${BUSINESS.bankName}  |  Account: ${BUSINESS.accountTitle}`, 14, y + 16);
  doc.text(`Account No: ${BUSINESS.accountNumber}`, 14, y + 23);
  doc.text(`IBAN: ${BUSINESS.iban}`, 14, y + 30);
  doc.text(`Raast ID: ${BUSINESS.raastId}`, 14, y + 37);
  y += 48;

  // Footer
  doc.setTextColor(122, 92, 74);
  doc.setFontSize(8);
  doc.text(`Instagram: ${BUSINESS.instagram}  |  WhatsApp: ${BUSINESS.whatsapp}`, W / 2, y, { align: "center" });
  y += 5;
  doc.text("Thank you for your order!", W / 2, y, { align: "center" });

  doc.save(`receipt_${order.orderId}.pdf`);
}
