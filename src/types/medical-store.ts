
export interface Medicine {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  medicine_id: string;
  quantity: number;
  medicine?: Medicine;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  phone_number: string; // Changed from user_id to phone_number
  total_price: number;
  address: string;
  phone: string;
  status: string;
  prescription_url: string | null;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  profiles?: {
    full_name: string | null;
  } | null | Record<string, any>;
}

export interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: string;
  quantity: number;
  price: number;
  medicine?: Medicine;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  status_message: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
}
