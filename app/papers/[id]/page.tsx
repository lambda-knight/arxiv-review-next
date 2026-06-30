import papersData from "@/data/papers.json";
import type { Paper } from "@/types/paper";
import { MathSlide } from "./MathSlide";

const papers = papersData as Paper[];

export function generateStaticParams() {
  return papers.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = papers.find((p) => p.id === id);
  return { title: paper?.title ?? id };
}

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = papers.find((p) => p.id === id);
  if (!paper) return <p style={{ color: "var(--muted)" }}>論文が見つかりません</p>;

  return (
    <div>
      {/* 章別動画 */}
      {paper.chapters.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {paper.chapters.map((ch) => (
            <section key={ch.index}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>
                第{ch.index}章: {ch.title}
              </h3>
              <video controls style={{ width: "100%" }} src={ch.videoUrl} />
              {ch.audioUrl && (
                <audio controls style={{ width: "100%", marginTop: 8 }} src={ch.audioUrl} />
              )}
              {ch.markdown && (
                <details style={{ marginTop: 12 }}>
                  <summary>解説スライド（クリックで展開）</summary>
                  <MathSlide html={ch.markdown} />
                </details>
              )}
            </section>
          ))}
        </div>
      )}

      {/* 単一動画 */}
      {paper.chapters.length === 0 && paper.singleVideoUrl && (
        <video controls style={{ width: "100%" }} src={paper.singleVideoUrl} />
      )}

    </div>
  );
}
