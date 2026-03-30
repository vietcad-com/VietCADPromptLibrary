import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prompt Library",
  description: "Thư viện prompt AI dùng chung cho team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {/* NAV */}
        <nav
          style={{
            height: 52,
            background: "#fff",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 24,
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a18", letterSpacing: "-0.02em" }}>
              Prompt<span style={{ color: "#378ADD" }}>Lib</span>
            </span>
          </Link>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "#5f5e5a",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Thư viện
              </button>
            </Link>
            <Link href="/create" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#378ADD",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                + Tạo prompt
              </button>
            </Link>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
