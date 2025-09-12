import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    try {
      // Get current user ID for tracking
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...product,
          created_by: user?.id,
          updated_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchProducts(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error creating product';
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>) => {
    try {
      // Get current user ID for tracking
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchProducts(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error updating product';
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProducts(); // Refresh the list
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error deleting product';
      return { error };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}