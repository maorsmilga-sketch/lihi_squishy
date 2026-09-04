export type Product = {
  id: string;
  image_url: string;
  price: number;
  description: string | null;
  category: string | null;
  created_at: string;
  external_link?: string | null;
};

export type Video = {
  id: string;
  video_url: string;
  title: string;
  created_at: string;
};

export type Settings = {
  id: number;
  about_text: string;
};
