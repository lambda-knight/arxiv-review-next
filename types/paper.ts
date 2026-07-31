export interface Chapter {
  index: number;
  title: string;
  videoUrl: string;
  audioUrl?: string;
  markdown?: string;
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
  webAudioUrl?: string;
  markdownSource?: string;
  timeline?: {
    fps: number;
    totalFrames: number;
    cues: Array<{
      speaker: "A" | "B";
      text: string;
      section: string;
      startFrame: number;
      endFrame: number;
    }>;
  };
}
