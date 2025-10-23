export interface Product {
  id: string;
  name: string;
  category: string;
  lowest_price: number;
  highest_price: number;
  rarity: number;
  path: string;
  description: string;
}

export interface CardProps {
  name: string;
  price: number;
  imageUrl: string;
  id: string;
}

export interface SearchProps{
    query: string;
    category: string;
}