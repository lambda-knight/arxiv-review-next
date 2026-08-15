"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import type { ChapterTimeline as EpisodeTimeline } from "@/types/paper";
import { YukkuriWeb } from "./remotion/YukkuriWeb";
import { YukkuriPrezi } from "./remotion/YukkuriPrezi";
import type { TimingData } from "./remotion/types";

type AnimationProps = {
  date: string;
  audioUrl: string;
  title: string;
  mode: string;
  markdownSource?: string;
  timeline: EpisodeTimeline;
  playEventName?: string;
  stopEventName?: string;
  showPlayButton?: boolean;
  externalTimeSec?: number;
  externalPlaying?: boolean;
};

type Adjustments = {
  timingOffsetFrames: number;
  scrollOffsetPx: number;
  manualSectionName?: string;
  showSubtitles: boolean;
  characterScale: number;
  karaokeSubtitles: boolean;
};

const DEFAULT_ADJUSTMENTS: Adjustments = {
  timingOffsetFrames: 0,
  scrollOffsetPx: 0,
  showSubtitles: true,
  characterScale: 1,
  karaokeSubtitles: true,
};

type IconButtonProps = {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
};

function IconButton({ icon, label, active = false, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`adjuster-icon${active ? " is-active" : ""}`}
      aria-label={label}
      data-tooltip={label}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

function toTimingData(props: AnimationProps): TimingData {
  return {
    title: props.title,
    markdown: props.markdownSource ?? "",
    fps: props.timeline.fps,
    totalFrames: props.timeline.totalFrames,
    // 論文Web版は冒頭・末尾もMarkdownスライドを常時表示する。
    youtubeScreens: false,
    segments: props.timeline.cues.map((cue, id) => ({
      id,
      speaker: cue.speaker,
      text: cue.text,
      section: /オープニング/.test(cue.section)
        ? "opening"
        : /エンディング/.test(cue.section)
          ? "ending"
          : "main",
      sectionName: cue.section,
      startFrame: cue.startFrame,
      endFrame: cue.endFrame,
      audioFile: "",
    })),
  };
}

export function AnimatedChapter(props: AnimationProps) {
  const timingData = toTimingData(props);
  const playerRef = useRef<PlayerRef>(null);
  const audioRef = useRef<HTMLVideoElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const storageKey = `ai-qc-news:adjustment:${props.date}:${props.mode}`;
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [viewMode, setViewMode] = useState<"normal" | "prezi">("normal");
  const sections = useMemo(
    () => [...new Set(timingData.segments.map((segment) => segment.sectionName))],
    [timingData.segments],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setAdjustments({ ...DEFAULT_ADJUSTMENTS, ...(JSON.parse(saved) as Partial<Adjustments>) });
    const requested = new URLSearchParams(window.location.search).get("view");
    if (requested === "prezi") setViewMode("prezi");
  }, [storageKey]);

  useEffect(() => {
    const play = () => { void audioRef.current?.play(); };
    const stop = () => audioRef.current?.pause();
    if (props.playEventName) window.addEventListener(props.playEventName, play);
    if (props.stopEventName) window.addEventListener(props.stopEventName, stop);
    return () => {
      if (props.playEventName) window.removeEventListener(props.playEventName, play);
      if (props.stopEventName) window.removeEventListener(props.stopEventName, stop);
    };
  }, [props.playEventName, props.stopEventName]);

  useEffect(() => {
    if (props.externalTimeSec === undefined) return;
    const player = playerRef.current;
    if (!player) return;
    const target = Math.min(timingData.totalFrames - 1, Math.round(props.externalTimeSec * timingData.fps));
    player.seekTo(target);
    if (props.externalPlaying) player.play();
    else player.pause();
  }, [props.externalTimeSec, props.externalPlaying, timingData.fps, timingData.totalFrames]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) setIsPseudoFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isPseudoFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPseudoFullscreen]);

  const currentSection = () => {
    if (adjustments.manualSectionName) return adjustments.manualSectionName;
    const frame = (playerRef.current?.getCurrentFrame() ?? 0) + adjustments.timingOffsetFrames;
    return [...timingData.segments].reverse().find((segment) => segment.startFrame <= frame)?.sectionName
      ?? sections[0];
  };

  const moveSection = (direction: number) => {
    const index = Math.max(0, sections.indexOf(currentSection()));
    const next = sections[Math.max(0, Math.min(sections.length - 1, index + direction))];
    setAdjustments((value) => ({ ...value, manualSectionName: next, scrollOffsetPx: 0 }));
  };

  const save = () => window.localStorage.setItem(storageKey, JSON.stringify(adjustments));
  const reset = () => {
    window.localStorage.removeItem(storageKey);
    setAdjustments(DEFAULT_ADJUSTMENTS);
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ date: props.date, mode: props.mode, ...adjustments }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${props.date}_${props.mode}_adjustment.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const syncPlayerToAudio = () => {
    const audio = audioRef.current;
    const player = playerRef.current;
    if (!audio || !player) return;
    const target = Math.min(timingData.totalFrames - 1, Math.round(audio.currentTime * timingData.fps));
    if (Math.abs(player.getCurrentFrame() - target) > 3) player.seekTo(target);
  };
  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  };
  const toggleFullscreen = async () => {
    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      return;
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    const element = fullscreenRef.current;
    if (!element?.requestFullscreen) {
      setIsPseudoFullscreen(true);
      return;
    }
    try {
      await element.requestFullscreen();
    } catch {
      // iPhone Safari does not support fullscreen for arbitrary elements.
      setIsPseudoFullscreen(true);
    }
  };
  return (
    <div style={{ marginTop: 8 }}>
      <div ref={fullscreenRef} className={`animation-fullscreen-shell${isPseudoFullscreen ? " is-pseudo-fullscreen" : ""}`}>
      <button type="button" className="fullscreen-close" aria-label="全画面表示を終了" onClick={toggleFullscreen}>×</button>
      <div className="view-mode-switch" role="group" aria-label="表示モード">
        <button type="button" className={viewMode === "normal" ? "is-active" : ""} onClick={() => setViewMode("normal")}>通常</button>
        <button type="button" className={viewMode === "prezi" ? "is-active" : ""} onClick={() => setViewMode("prezi")}>Prezi</button>
      </div>
      <Player
        ref={playerRef}
        component={viewMode === "prezi" ? YukkuriPrezi : YukkuriWeb}
        inputProps={{ timingData, audioUrl: props.audioUrl, ...adjustments }}
        durationInFrames={timingData.totalFrames}
        compositionWidth={1280}
        compositionHeight={720}
        fps={timingData.fps}
        controls={false}
        className="paper-remotion-player"
        style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 10, overflow: "hidden" }}
      />
      {props.externalTimeSec === undefined && <audio
        ref={audioRef}
        playsInline
        preload="metadata"
        src={props.audioUrl}
        onPlay={() => { setIsAudioPlaying(true); playerRef.current?.play(); }}
        onPause={() => { setIsAudioPlaying(false); playerRef.current?.pause(); }}
        onTimeUpdate={syncPlayerToAudio}
        onSeeking={syncPlayerToAudio}
        onEnded={() => { setIsAudioPlaying(false); playerRef.current?.pause(); }}
      />}
      </div>
      <div className="remotion-adjuster" role="toolbar" aria-label="表示と同期の調整">
        <IconButton icon="⛶" label="全画面表示を切り替え" onClick={toggleFullscreen} />
        <IconButton icon="⏮" label="前の章を表示" onClick={() => moveSection(-1)} />
        <IconButton icon="⏭" label="次の章を表示" onClick={() => moveSection(1)} />
        <IconButton icon="🔄" label="表示する章を音声に追従" active={!adjustments.manualSectionName} onClick={() => setAdjustments((v) => ({ ...v, manualSectionName: undefined }))} />
        <IconButton icon="⇧" label="スライドを上へ80ピクセル調整" onClick={() => setAdjustments((v) => ({ ...v, scrollOffsetPx: v.scrollOffsetPx - 80 }))} />
        <IconButton icon="⇩" label="スライドを下へ80ピクセル調整" onClick={() => setAdjustments((v) => ({ ...v, scrollOffsetPx: v.scrollOffsetPx + 80 }))} />
        <IconButton icon="◀︎⏱" label="字幕と画面の同期を0.1秒早める" onClick={() => setAdjustments((v) => ({ ...v, timingOffsetFrames: v.timingOffsetFrames - 3 }))} />
        <IconButton icon="⏱▶︎" label="字幕と画面の同期を0.1秒遅らせる" onClick={() => setAdjustments((v) => ({ ...v, timingOffsetFrames: v.timingOffsetFrames + 3 }))} />
        <IconButton icon={adjustments.showSubtitles ? "CC" : "CC̸"} label={adjustments.showSubtitles ? "字幕を非表示" : "字幕を表示"} active={adjustments.showSubtitles} onClick={() => setAdjustments((v) => ({ ...v, showSubtitles: !v.showSubtitles }))} />
        <IconButton icon="字追" label={adjustments.karaokeSubtitles ? "字幕の追従色を無効化" : "字幕の追従色を有効化"} active={adjustments.karaokeSubtitles} onClick={() => setAdjustments((v) => ({ ...v, karaokeSubtitles: !v.karaokeSubtitles }))} />
        <IconButton icon="👤−" label="キャラクターを10%縮小" onClick={() => setAdjustments((v) => ({ ...v, characterScale: Math.max(0.6, +(v.characterScale - 0.1).toFixed(1)) }))} />
        <IconButton icon="👤" label="キャラクターを標準サイズに戻す" active={adjustments.characterScale === 1} onClick={() => setAdjustments((v) => ({ ...v, characterScale: 1 }))} />
        <IconButton icon="👤＋" label="キャラクターを10%拡大" onClick={() => setAdjustments((v) => ({ ...v, characterScale: Math.min(1.6, +(v.characterScale + 0.1).toFixed(1)) }))} />
        <IconButton icon="💾" label="この端末のブラウザに調整値を保存" onClick={save} />
        <IconButton icon="⇩ JSON" label="調整値をJSONファイルとして出力" onClick={exportJson} />
        <IconButton icon="↺" label="すべての調整を初期値に戻す" onClick={reset} />
        <span>時刻 {adjustments.timingOffsetFrames / 30 >= 0 ? "+" : ""}{(adjustments.timingOffsetFrames / 30).toFixed(1)}秒 / 画面 {adjustments.scrollOffsetPx}px / キャラ {Math.round(adjustments.characterScale * 100)}%</span>
      </div>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 12, color: "var(--muted)", fontSize: 12 }}>
        <span>動画プレビュー共通画面・音声同期Web版</span>
        {props.showPlayButton !== false && (
          <button type="button" className="audio-play-button" onClick={toggleAudio} aria-pressed={isAudioPlaying}>
            {isAudioPlaying ? "⏸ アニメーションを停止" : "▶ アニメーションを再生"}
          </button>
        )}
      </div>
    </div>
  );
}
