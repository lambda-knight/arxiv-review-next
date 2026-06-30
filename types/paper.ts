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
  singleAudioUrl?: string;
}
