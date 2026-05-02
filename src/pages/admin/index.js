// src/pages/admin/index.js
import { useState } from "react";
import { useRouter } from "next/router";
import Nav from "@/components/Nav";

export default function AdminLogin() {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const login = () => {
    const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "sweetorders2024";
    if (pass === correct) {
      sessionStorage.setItem("admin_auth", "true");
      router.push("/admin/dashboard");
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Nav />
      <div style={{ maxWidth: 380, margin: "80px auto 0", padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🔒</div>
          <h1 style={{ fontSize: 28, color: "var(--brown)" }}>Team Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>
            Enter your password to access orders
          </p>
        </div>

        <div className="card" style={{ borderRadius: 20 }}>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
              placeholder="Enter team password"
              onKeyDown={(e) => e.key === "Enter" && login()}
              style={error ? { borderColor: "#c0392b" } : {}}
            />
            {error && (
              <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>
                Incorrect password. Try again.
              </p>
            )}
          </div>
          <button className="btn-primary" style={{ width: "100%" }} onClick={login}>
            Access Dashboard
          </button>
          <p style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--text-muted)" }}>
            Default: <code style={{ background: "#f5f0ec", padding: "1px 6px", borderRadius: 4 }}>sweetorders2024</code>
          </p>
        </div>
      </div>
    </div>
  );
}
