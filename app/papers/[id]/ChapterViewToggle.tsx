"use client";

import { useRef, useState } from "react";
import type { ChapterTimeline } from "@/types/paper";
import { AnimatedChapter } from "./AnimatedChapter";
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [timeSec, setTimeSec] = useState(0);
  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  return (
    <div className="chapter-view-shell">
      <audio ref={audioRef} src={props.audioUrl} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={(event) => setTimeSec(event.currentTarget.currentTime)} onSeeking={(event) => setTimeSec(event.currentTarget.currentTime)} />
      <button type="button" className="audio-play-button chapter-audio-button" onClick={toggleAudio} aria-pressed={playing}>
        {playing ? "⏸ 音声を停止" : "▶ 音声を再生"}
      </button>
      <div className="chapter-view-toggle" role="tablist" aria-label="再生中の表示方法">
        <button type="button" role="tab" aria-selected={view === "animation"} className={view === "animation" ? "is-active" : ""} onClick={() => setView("animation")}>アニメーション</button>
        <button type="button" role="tab" aria-selected={view === "markdown"} className={view === "markdown" ? "is-active" : ""} onClick={() => setView("markdown")}>Markdown</button>
      </div>
      {view === "animation" ? (
        <AnimatedChapter
          date={props.paperId}
          mode={`chapter-${props.chapterIndex}`}
          title={props.title}
          audioUrl={props.audioUrl}
          markdownSource={props.markdownSource}
          timeline={props.timeline}
          showPlayButton={false}
          externalTimeSec={timeSec}
          externalPlaying={playing}
        />
      ) : (
        <div className="markdown-listening-view">
          <MathSlide html={props.markdownHtml} />
        </div>
      )}
    </div>
  );
}
