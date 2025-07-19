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

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
}

export interface Lecture {
  id: string;
  title: string;
  videoUrl: string;
  categoryId: string;
}
