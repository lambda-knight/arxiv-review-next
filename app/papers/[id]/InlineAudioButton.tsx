"use client";

import { useEffect, useRef, useState } from "react";

export function InlineAudioButton({ src, playEventName, stopEventName, showButton = true }: { src: string; playEventName?: string; stopEventName?: string; showButton?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  useEffect(() => {
    const play = () => { void audioRef.current?.play(); };
    const stop = () => audioRef.current?.pause();
    if (playEventName) window.addEventListener(playEventName, play);
    if (stopEventName) window.addEventListener(stopEventName, stop);
    return () => {
      if (playEventName) window.removeEventListener(playEventName, play);
      if (stopEventName) window.removeEventListener(stopEventName, stop);
    };
  }, [playEventName, stopEventName]);

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
      {showButton && <button type="button" className="audio-play-button" onClick={toggle} aria-pressed={playing}>
          {playing ? "⏸ 音声を停止" : "▶ Markdownを見ながら音声を再生"}
      </button>}
    </div>
  );
}
