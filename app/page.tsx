import papersData from "@/data/papers.json";
import type { Paper } from "@/types/paper";
import Link from "next/link";

const papers = papersData as Paper[];

export default function IndexPage() {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--border)" }}>
          <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>論文</th>
          <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: "var(--muted)", fontWeight: 500, whiteSpace: "nowrap" }}>論文リンク</th>
          <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>章数</th>
        </tr>
      </thead>
      <tbody>
        {papers.map((p) => (
          <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "14px 12px" }}>
              <Link href={`/papers/${p.id}/`} style={{ color: "var(--accent2)", fontWeight: 500, fontSize: 14 }}>
                {p.title}
              </Link>
            </td>
            <td style={{ padding: "14px 12px", fontSize: 13, whiteSpace: "nowrap" }}>
              {p.arxivUrl ? (
                <a href={p.arxivUrl} target="_blank" rel="noopener" style={{ color: "var(--muted)" }}>
                  arXiv:{p.id}
                </a>
              ) : p.doi ? (
                <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener" style={{ color: "var(--muted)" }}>
                  {p.doi}
                </a>
              ) : (
                <span style={{ color: "var(--muted)" }}>{p.id}</span>
              )}
            </td>
            <td style={{ padding: "14px 12px", textAlign: "right", fontSize: 13, color: "var(--muted)" }}>
              {p.chapters.length > 0 ? p.chapters.length : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
