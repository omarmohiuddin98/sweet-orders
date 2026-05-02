import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Nav() {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");

  return (
    <nav style={{
      background: "white",
      borderBottom: "1px solid var(--border)",
      padding: "0 16px",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 58,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="Cakexplode" width={42} height={42} style={{ borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <div style={{ fontFamily: "Playfair Display, serif", fontSize: 16, fontWeight: 700, color: "var(--brown)", lineHeight: 1.2 }}>Cakexplode</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.05em" }}>AN EXPLOSION OF SWEETNESS</div>
          </div>
        </Link>

        <div style={{ display: "flex", gap: 6 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "7px 16px", borderRadius: 8, border: "1.5px solid",
              borderColor: !isAdmin ? "var(--rose)" : "transparent",
              background: !isAdmin ? "var(--rose-light)" : "transparent",
              color: !isAdmin ? "var(--rose)" : "var(--text-muted)",
              fontWeight: 500, fontSize: 13, cursor: "pointer",
            }}>Order</button>
          </Link>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "7px 16px", borderRadius: 8, border: "1.5px solid",
              borderColor: isAdmin ? "var(--rose)" : "transparent",
              background: isAdmin ? "var(--rose-light)" : "transparent",
              color: isAdmin ? "var(--rose)" : "var(--text-muted)",
              fontWeight: 500, fontSize: 13, cursor: "pointer",
            }}>Team Dashboard</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
