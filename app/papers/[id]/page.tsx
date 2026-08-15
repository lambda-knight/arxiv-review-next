import papersData from "@/data/papers.json";
import type { Paper } from "@/types/paper";
import { MathSlide } from "./MathSlide";
import { AnimatedChapter } from "./AnimatedChapter";
import { InlineAudioButton } from "./InlineAudioButton";

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
              {ch.audioUrl && ch.timeline && ch.markdownSource ? (
                <details className="web-content-fold">
                  <summary>Webアニメーションを表示／隠す</summary>
                  <AnimatedChapter
                    date={paper.id}
                    mode={`chapter-${ch.index}`}
                    title={`${paper.title} — 第${ch.index}章`}
                    audioUrl={ch.audioUrl}
                    markdownSource={ch.markdownSource}
                    timeline={ch.timeline}
                  />
                </details>
              ) : (
                <video controls style={{ width: "100%" }} src={ch.videoUrl} />
              )}
              {ch.audioUrl && !ch.timeline && (
                <audio controls style={{ width: "100%", marginTop: 8 }} src={ch.audioUrl} />
              )}
              {ch.markdown && (
                <details className="web-content-fold markdown-fold" open>
                  <summary>本文・数式を表示／隠す</summary>
                  {ch.audioUrl && <InlineAudioButton src={ch.audioUrl} />}
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

      {/* 動画がまだない論文: 音声と本文をフォールバック表示（空ページを防ぐ） */}
      {paper.chapters.length === 0 && !paper.singleVideoUrl && (
        <div>
          {paper.singleAudioUrl && (
            <audio controls style={{ width: "100%" }} src={paper.singleAudioUrl} />
          )}
          {paper.markdown && (
            <div style={{ marginTop: paper.singleAudioUrl ? 16 : 0 }}>
              <MathSlide html={paper.markdown} />
            </div>
          )}
          {!paper.singleAudioUrl && !paper.markdown && (
            <p style={{ color: "var(--muted)" }}>この論文の動画・音声・本文はまだ準備中です</p>
          )}
        </div>
      )}

    </div>
  );
}
