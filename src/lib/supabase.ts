import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  status: boolean;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface AdminProfile {
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      roles: {
        Row: UserRole;
        Insert: Omit<UserRole, 'created_at'>;
        Update: Partial<Omit<UserRole, 'created_at'>>;
      };
      admin_profiles: {
        Row: AdminProfile;
        Insert: Omit<AdminProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AdminProfile, 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}