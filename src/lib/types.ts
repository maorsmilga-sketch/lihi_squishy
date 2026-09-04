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

export type Raffle = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  ends_at: string;
  winner_entry_id: string | null;
  winner_name: string | null;
  drawn_at: string | null;
  created_at: string;
};

export type RaffleEntry = {
  id: string;
  raffle_id: string;
  name: string;
  name_normalized: string;
  phone: string | null;
  created_at: string;
};

export type PublicRaffleEntry = {
  id: string;
  name: string;
  created_at: string;
};

export type RaffleState = {
  raffle: Raffle | null;
  entries: PublicRaffleEntry[];
  entryCount: number;
  isOpen: boolean;
  isEnded: boolean;
};

export type AdminRaffleState = {
  raffle: Raffle | null;
  entries: RaffleEntry[];
  entryCount: number;
  isOpen: boolean;
  isEnded: boolean;
};
