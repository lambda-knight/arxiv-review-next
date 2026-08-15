"use client";

import { useState } from "react";
import type { ChapterTimeline } from "@/types/paper";
import { AnimatedChapter } from "./AnimatedChapter";
import { InlineAudioButton } from "./InlineAudioButton";
import { MathSlide } from "./MathSlide";

type Props = {
  paperId: string;
  chapterIndex: number;
  title: string;
  audioUrl: string;
  markdownHtml: string;
  markdownSource: string;
  timeline: ChapterTimeline;
};

export function ChapterViewToggle(props: Props) {
  const [view, setView] = useState<"animation" | "markdown">("animation");

  return (
    <div className="chapter-view-shell">
      <div className="chapter-view-toggle" role="tablist" aria-label="章の表示方法">
        <button type="button" role="tab" aria-selected={view === "animation"} className={view === "animation" ? "is-active" : ""} onClick={() => setView("animation")}>アニメーション</button>
        <button type="button" role="tab" aria-selected={view === "markdown"} className={view === "markdown" ? "is-active" : ""} onClick={() => setView("markdown")}>Markdown＋音声</button>
      </div>
      {view === "animation" ? (
        <AnimatedChapter
          date={props.paperId}
          mode={`chapter-${props.chapterIndex}`}
          title={props.title}
          audioUrl={props.audioUrl}
          markdownSource={props.markdownSource}
          timeline={props.timeline}
        />
      ) : (
        <div className="markdown-listening-view">
          <InlineAudioButton src={props.audioUrl} />
          <MathSlide html={props.markdownHtml} />
        </div>
      )}
    </div>
  );
}
