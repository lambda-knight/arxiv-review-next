export interface Chapter {
  index: number;
  title: string;
  videoUrl: string;
  audioUrl?: string;
  markdown?: string;
  markdownSource?: string;
  timeline?: ChapterTimeline;
}

export interface TimelineCue {
  speaker: "A" | "B";
  text: string;
  section: string;
  startFrame: number;
  endFrame: number;
}

export interface ChapterTimeline {
  fps: number;
  totalFrames: number;
  cues: TimelineCue[];
}

export interface Paper {
  id: string;
  title: string;
  arxivUrl?: string;
  doi?: string;
  iaId: string;
  iaUrl: string;
  chapters: Chapter[];
  singleVideoUrl?: string;
  singleAudioUrl?: string;
  markdown?: string;
  webAudioUrl?: string;
  markdownSource?: string;
  timeline?: ChapterTimeline;
}
