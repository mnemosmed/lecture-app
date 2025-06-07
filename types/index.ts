export interface VideoItem {
  Title: string;
  Category: string;
  Subcategory: number;
  URL: string;
}

export interface CategoryGroup {
  category: string;
  videos: VideoItem[];
}
