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

export interface ListedItem {
  id?: string;
  product_name: string;
  user_id: string;
  product_id: string;
  description: string;
  price: number;
  quantity: number;
  gameday_listed: number;
  path: string;
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

export interface ProductQuantity {
  product: Product;
  quantity: number;
}

export interface Bid {
  product: Product;
  amount: number;
}

export interface UserObj { 
  user_id: string;
  seller_name: string;
  seller_image_url: string;
  cart_items: string;
  current_day: string;
  current_day_seed: string;
  owned_items: string;
  listed_items: string;
  money: number;
  bid_items: string;
  watchlist_items: string;
}