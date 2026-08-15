import React from "react";
import {Lottie, type LottieAnimationData} from "@remotion/lottie";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import type {TimingData, Segment} from "./types";
import {YukkuriWeb} from "./YukkuriWeb";

type Props = {
  timingData: TimingData;
  audioUrl: string;
  effectMode: 4 | 6 | 8;
  timingOffsetFrames?: number;
  scrollOffsetPx?: number;
  manualSectionName?: string;
  showSubtitles?: boolean;
  characterScale?: number;
  karaokeSubtitles?: boolean;
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const LOTTIE_DATA: LottieAnimationData = {
  v: "5.7.4", fr: 30, ip: 0, op: 90, w: 300, h: 300, nm: "news-pulse", ddd: 0, assets: [],
  layers: [{ddd: 0, ind: 1, ty: 4, nm: "Pulse", sr: 1, ks: {
    o: {a: 1, k: [{t: 0, s: [85]}, {t: 45, s: [35]}, {t: 90, s: [85]}]},
    r: {a: 1, k: [{t: 0, s: [0]}, {t: 90, s: [180]}]},
    p: {a: 0, k: [150, 150, 0]}, a: {a: 0, k: [0, 0, 0]},
    s: {a: 1, k: [{t: 0, s: [55, 55, 100]}, {t: 45, s: [105, 105, 100]}, {t: 90, s: [55, 55, 100]}]},
  }, ao: 0, shapes: [
    {ty: "el", p: {a: 0, k: [0, 0]}, s: {a: 0, k: [170, 170]}, nm: "Ellipse"},
    {ty: "st", c: {a: 0, k: [0.4, 0.25, 0.95, 1]}, o: {a: 0, k: 100}, w: {a: 0, k: 12}, lc: 2, lj: 2, nm: "Stroke"},
  ], ip: 0, op: 90, st: 0, bm: 0}],
};

export const YukkuriEffectTest: React.FC<Props> = (props) => {
  const frame = useCurrentFrame();
  const {timingData, effectMode} = props;
  const syncFrame = Math.max(0, Math.min(timingData.totalFrames - 1, frame + (props.timingOffsetFrames ?? 0)));
  const current: Segment | undefined = timingData.segments.find((cue) => syncFrame >= cue.startFrame && syncFrame < cue.endFrame);
  const cueProgress = current ? (syncFrame - current.startFrame) / Math.max(1, current.endFrame - current.startFrame) : 0;
  const chartProgress = interpolate(cueProgress, [0, .7], [0, 1], clamp);

  return <AbsoluteFill>
    <YukkuriWeb {...props} />

    {effectMode === 4 && <div className="test-living-background" style={{backgroundPosition: `${frame * .35}px ${frame * .18}px`}}>
      <i className="particle p1" style={{transform: `translate(${Math.sin(frame / 45) * 35}px, ${Math.cos(frame / 60) * 25}px)`}} />
      <i className="particle p2" style={{transform: `translate(${Math.cos(frame / 55) * 42}px, ${Math.sin(frame / 40) * 28}px)`}} />
      <i className="particle p3" style={{transform: `translate(${Math.sin(frame / 38) * 28}px, ${Math.cos(frame / 52) * 38}px)`}} />
      <span>TEST 04 / TRANSPARENT PARTICLES</span>
    </div>}

    {effectMode === 6 && <div className="test-chart-card">
      <strong>注目度の比較</strong>
      {[72, 48, 88, 61].map((value, index) => <div className="test-chart-row" key={value}>
        <span>{["技術", "制度", "市場", "社会"][index]}</span><i><b style={{width: `${value * chartProgress}%`}} /></i><em>{Math.round(value * chartProgress)}</em>
      </div>)}
    </div>}

    {effectMode === 8 && <div className="test-lottie-card"><Lottie animationData={LOTTIE_DATA} loop style={{width: 180, height: 180}} /><b>NEWS<br />UPDATE</b><span>Lottie / TEST 08</span></div>}
  </AbsoluteFill>;
};
