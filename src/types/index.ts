export interface Product {
  id: string;
  name: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  category: string;
  description?: string;
  barcode?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'transfer';
}