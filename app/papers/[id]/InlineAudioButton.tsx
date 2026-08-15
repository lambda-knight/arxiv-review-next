"use client";

import { useRef, useState } from "react";

export function InlineAudioButton({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  return (
    <div className="markdown-audio-row">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button type="button" className="audio-play-button" onClick={toggle} aria-pressed={playing}>
        {playing ? "⏸ 音声を停止" : "▶ Markdownを見ながら音声を再生"}
      </button>
    </div>
  );
}
