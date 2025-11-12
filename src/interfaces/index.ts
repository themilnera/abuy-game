export interface Product {
  id: string;
  name: string;
  category: string;
  lowest_price: number;
  highest_price: number;
  current_price: string;
  rarity: number;
  path: string;
  description: string;
}

export interface CardProps {
  name: string;
  price: string;
  path: string;
  id: string;
}

export interface SearchProps {
  query: string;
  category: string;
}
