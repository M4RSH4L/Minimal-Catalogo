import { useState, useEffect } from 'react';
import { supabase, AdminProfile } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

export function useAdminProfile() {
  const { user, role } = useSupabaseAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user || role !== 'admin') {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (username: string, avatar_url?: string) => {
    if (!user) return { data: null, error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .insert([{
          user_id: user.id,
          username,
          avatar_url
        }])
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error creating profile';
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: { username?: string; avatar_url?: string }) => {
    if (!user || !profile) return { data: null, error: 'No profile to update' };

    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error updating profile';
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, role]);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refetch: fetchProfile,
  };
}