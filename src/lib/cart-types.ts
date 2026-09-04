export type CartItem = {
  id: string;
  image_url: string;
  price: number;
  description: string | null;
  category: string | null;
  quantity: number;
  stock?: number;
};
