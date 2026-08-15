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
  const eventBase = `paper-${props.paperId}-chapter-${props.chapterIndex}`;
  const stopEvent = `${eventBase}:stop`;
  const play = (next: "animation" | "markdown") => {
    window.dispatchEvent(new Event(stopEvent));
    setView(next);
    window.dispatchEvent(new Event(`${eventBase}:play-${next}`));
  };

  return (
    <div className="chapter-view-shell">
      <div className="chapter-view-toggle" role="tablist" aria-label="章の表示方法">
        <button type="button" role="tab" aria-selected={view === "animation"} className={view === "animation" ? "is-active" : ""} onClick={() => play("animation")}>▶ アニメーションで再生</button>
        <button type="button" role="tab" aria-selected={view === "markdown"} className={view === "markdown" ? "is-active" : ""} onClick={() => play("markdown")}>▶ Markdownを見ながら再生</button>
      </div>
      <div hidden={view !== "animation"}>
        <AnimatedChapter
          date={props.paperId}
          mode={`chapter-${props.chapterIndex}`}
          title={props.title}
          audioUrl={props.audioUrl}
          markdownSource={props.markdownSource}
          timeline={props.timeline}
          playEventName={`${eventBase}:play-animation`}
          stopEventName={stopEvent}
          showPlayButton={false}
        />
      </div>
      <div hidden={view !== "markdown"}>
        <div className="markdown-listening-view">
          <InlineAudioButton src={props.audioUrl} playEventName={`${eventBase}:play-markdown`} stopEventName={stopEvent} showButton={false} />
          <MathSlide html={props.markdownHtml} />
        </div>
      </div>
    </div>
  );
}
