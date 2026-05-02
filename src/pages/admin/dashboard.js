import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "@/components/Nav";
import { STATUS_OPTIONS, DEFAULT_PRODUCTS, formatDate, formatTime } from "@/lib/constants";
import { getAllOrders, updateOrderStatus, getProducts, saveProducts } from "@/lib/orders";

const PER_PAGE = 10;

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("orders"); // "orders" | "products"
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  // Products state
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [productsSaving, setProductsSaving] = useState(false);
  const [productsSaved, setProductsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") !== "true") {
      router.replace("/admin");
      return;
    }
    fetchOrders();
    getProducts().then(setProducts).catch(() => {});
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try { setOrders(await getAllOrders()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatus(order.id, status);
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status } : o));
      if (selected?.id === order.id) setSelected((s) => ({ ...s, status }));
    } catch { alert("Failed to update status"); }
  };

  const logout = () => { sessionStorage.removeItem("admin_auth"); router.push("/admin"); };

  const exportCSV = () => {
    const headers = ["Order ID","Name","Phone","Product","Price","Date","Time","Payment","Status","Address","Notes"];
    const rows = filtered.map((o) => [
      o.orderId, o.name, o.phone, `"${o.product}"`, o.price,
      o.deliveryDate, o.deliveryTime, o.payment, o.status,
      `"${o.address}"`, `"${o.notes || ""}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Product handlers
  const addProduct = () => setProducts((p) => [...p, { name: "", price: 0 }]);
  const removeProduct = (i) => setProducts((p) => p.filter((_, idx) => idx !== i));
  const updateProduct = (i, field, value) =>
    setProducts((p) => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSaveProducts = async () => {
    const valid = products.filter((p) => p.name.trim());
    if (valid.length === 0) { alert("Add at least one product."); return; }
    setProductsSaving(true);
    try {
      await saveProducts(valid);
      setProducts(valid);
      setProductsSaved(true);
      setTimeout(() => setProductsSaved(false), 3000);
    } catch { alert("Failed to save. Check Firebase permissions."); }
    finally { setProductsSaving(false); }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const ms = !q || o.name?.toLowerCase().includes(q) || o.orderId?.toLowerCase().includes(q)
      || o.product?.toLowerCase().includes(q) || o.phone?.includes(q);
    const mst = filterStatus === "All" || o.status === filterStatus;
    return ms && mst;
  });

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total: orders.length,
    newOrders: orders.filter((o) => o.status === "New").length,
    today: orders.filter((o) => o.createdAt?.startsWith(new Date().toISOString().slice(0, 10))).length,
    revenue: orders.reduce((s, o) => s + (Number(o.price) || 0), 0),
  };

  const statusColor = (s) => ({
    New: { background: "#f0e4cc", color: "#c9830a" },
    Confirmed: { background: "#e8f0fe", color: "#1a56db" },
    "In Progress": { background: "#fef3e2", color: "#c9830a" },
    Delivered: { background: "#e8f2ec", color: "#4a7c59" },
  }[s] || { background: "#f0e4cc", color: "#c9830a" });

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer",
      background: tab === id ? "var(--rose)" : "transparent",
      color: tab === id ? "white" : "var(--text-muted)",
      fontWeight: tab === id ? 600 : 400, fontSize: 14,
      boxShadow: tab === id ? "0 2px 8px rgba(201,123,123,.3)" : "none",
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Nav />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 16px 56px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, color: "var(--brown)" }}>Team Dashboard</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Cakexplode order management</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {tab === "orders" && <>
              <button className="btn-secondary btn-small" onClick={fetchOrders}>↻ Refresh</button>
              <button className="btn-secondary btn-small" onClick={exportCSV}>⬇ Export CSV</button>
            </>}
            <button className="btn-secondary btn-small" onClick={logout}>Sign Out</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid var(--border)", borderRadius: 14, padding: 4, marginBottom: 24, width: "fit-content" }}>
          <TabBtn id="orders" label="📦 Orders" />
          <TabBtn id="products" label="🛍️ Manage Products" />
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && <>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total Orders", value: stats.total, icon: "📦" },
              { label: "New", value: stats.newOrders, icon: "🆕" },
              { label: "Today", value: stats.today, icon: "📅" },
              { label: "Revenue", value: `Rs. ${stats.revenue.toLocaleString()}`, icon: "💰" },
            ].map((s) => (
              <div key={s.label} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 6 }}>{s.icon} {s.label}</p>
                <p style={{ fontSize: s.value.toString().length > 7 ? 15 : 22, fontWeight: 700, color: "var(--brown)", fontFamily: "Playfair Display, serif" }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              placeholder="🔍  Search by name, order ID, product, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ flex: 1, minWidth: 240 }}
            />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              style={{ minWidth: 150, background: "white" }}
            >
              <option>All</option>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>Loading orders...
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#fdf8f5", borderBottom: "1.5px solid var(--border)" }}>
                      {["Order ID","Customer","Product","Delivery","Payment","Status",""].map((h) => (
                        <th key={h} style={{ padding: "13px 14px", textAlign: "left", fontWeight: 600, color: "var(--brown)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>No orders found
                      </td></tr>
                    )}
                    {paged.map((o, i) => (
                      <tr key={o.id} style={{ borderBottom: "1px solid #f0e8e0", background: i % 2 === 0 ? "white" : "#fffcfa" }}>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#c97b7b", fontWeight: 600 }}>{o.orderId}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <strong>{o.name}</strong><br />
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{o.phone}</span>
                        </td>
                        <td style={{ padding: "12px 14px", maxWidth: 160 }}>
                          <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{o.product}</span>
                          <span style={{ color: "#c97b7b", fontWeight: 600 }}>Rs. {Number(o.price).toLocaleString()}</span>
                        </td>
                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap", color: "var(--text-muted)" }}>
                          {formatDate(o.deliveryDate)}<br />
                          <span style={{ fontSize: 12 }}>{formatTime(o.deliveryTime)}</span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span className="tag" style={{ background: o.payment === "Advance" ? "#e8f2ec" : "#fef3e2", color: o.payment === "Advance" ? "#4a7c59" : "#c9830a" }}>
                            {o.payment}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <select value={o.status} onChange={(e) => handleStatusChange(o, e.target.value)}
                            style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 12, background: "white", minWidth: 110, ...statusColor(o.status) }}>
                            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button className="btn-secondary btn-small" onClick={() => setSelected(o)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 14, borderTop: "1px solid #f0e8e0" }}>
                {Array.from({ length: pages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} style={{
                    width: 34, height: 34, borderRadius: 8, border: "1.5px solid",
                    borderColor: page === i + 1 ? "#c97b7b" : "var(--border)",
                    background: page === i + 1 ? "#c97b7b" : "white",
                    color: page === i + 1 ? "white" : "var(--brown)",
                    fontWeight: 600, cursor: "pointer",
                  }}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        </>}

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <div style={{ maxWidth: 600 }}>
            <div className="card" style={{ borderRadius: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, color: "var(--brown)" }}>Products & Prices</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    Changes here update the order form instantly for all customers.
                  </p>
                </div>
                <button className="btn-secondary btn-small" onClick={addProduct}>+ Add Product</button>
              </div>

              {products.map((p, i) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  padding: "14px", background: "#fdf8f5",
                  borderRadius: 12, marginBottom: 10, border: "1px solid var(--border)",
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, marginBottom: 4 }}>Product Name</label>
                    <input
                      value={p.name}
                      onChange={(e) => updateProduct(i, "name", e.target.value)}
                      placeholder="e.g. Birthday Tier Cake"
                      style={{ marginBottom: 8 }}
                    />
                    <label style={{ fontSize: 11, marginBottom: 4 }}>Price (Rs.) — enter 0 for custom pricing</label>
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => updateProduct(i, "price", Number(e.target.value))}
                      placeholder="e.g. 2500"
                    />
                  </div>
                  <button onClick={() => removeProduct(i)} style={{
                    background: "#fceaea", color: "#c0392b",
                    border: "none", borderRadius: 8, padding: "6px 12px",
                    fontSize: 18, cursor: "pointer", marginTop: 20,
                  }}>×</button>
                </div>
              ))}

              <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  className="btn-primary"
                  onClick={handleSaveProducts}
                  disabled={productsSaving}
                  style={{ flex: 1, padding: 12 }}
                >
                  {productsSaving ? "Saving..." : "💾 Save Products"}
                </button>
                {productsSaved && (
                  <span style={{ color: "#4a7c59", fontSize: 13, fontWeight: 600 }}>✓ Saved!</span>
                )}
              </div>

              <p style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                💡 Set price to <strong>0</strong> for products like "Custom Design Cake" — the order form will show "Price will be confirmed by team".
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,10,0,.5)", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "white", borderRadius: 20, maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, color: "var(--brown)" }}>Order Details</h2>
              <button className="btn-secondary btn-small" onClick={() => setSelected(null)}>✕ Close</button>
            </div>
            <div style={{ background: "#fdf8f5", borderRadius: 12, padding: 16, fontSize: 14, lineHeight: 2 }}>
              {[
                ["Order ID", <span key="id" style={{ fontFamily: "monospace", color: "#c97b7b", fontWeight: 600 }}>{selected.orderId}</span>],
                ["Customer", selected.name],
                ["Phone", selected.phone],
                ["Address", selected.address],
                ["Product", selected.product],
                ["Price", `Rs. ${Number(selected.price).toLocaleString()}`],
                ["Delivery Date", formatDate(selected.deliveryDate)],
                ["Delivery Time", formatTime(selected.deliveryTime)],
                ["Payment", selected.payment],
                ["Delivery Charges", selected.deliveryCharges ? "Paid by customer" : "Included"],
                ["Created", new Date(selected.createdAt).toLocaleString()],
                ...(selected.notes ? [["Notes", selected.notes]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 12, borderBottom: "1px solid #f0e8e0", paddingBottom: 2 }}>
                  <span style={{ color: "var(--text-muted)", minWidth: 130, fontWeight: 500 }}>{k}</span>
                  <span style={{ color: "var(--text)", flex: 1 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <label style={{ marginBottom: 8 }}>Update Status</label>
              <select value={selected.status} onChange={(e) => handleStatusChange(selected, e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
