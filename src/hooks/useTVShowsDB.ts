import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface TVShowDB {
  id: string;
  title: string;
  genre: string;
  language: string;
  rating: string | null;
  status: "published" | "pending" | "draft";
  subscription_required: boolean;
  thumbnail_url: string | null;
  description: string | null;
  tagline: string | null;
  release_date: string | null;
  age_rating: string | null;
  channel: string | null;
  air_time: string | null;
  genres: string[];
  tags: string[];
  cast_crew: Json;
  vendor_id: string | null;
  vendor_name?: string;
  total_episodes: number;
  created_at: string;
  updated_at: string;
}

export function useTVShowsDB() {
  const [tvShows, setTVShows] = useState<TVShowDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTVShows = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tv_shows")
        .select(`
          *,
          vendors:vendor_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const showsWithVendor = (data || []).map((show) => ({
        ...show,
        status: show.status as "published" | "pending" | "draft",
        genres: (show.genres as string[]) || [],
        tags: (show.tags as string[]) || [],
        vendor_name: show.vendors?.name || null,
      }));

      setTVShows(showsWithVendor);
    } catch (error) {
      console.error("Error fetching TV shows:", error);
      toast.error("Failed to load TV shows");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTVShows();
  }, [fetchTVShows]);

  const getTVShow = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("tv_shows")
        .select(`
          *,
          vendors:vendor_id (name)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        status: data.status as "published" | "pending" | "draft",
        genres: (data.genres as string[]) || [],
        tags: (data.tags as string[]) || [],
        vendor_name: data.vendors?.name || null,
      } as TVShowDB;
    } catch (error) {
      console.error("Error fetching TV show:", error);
      return null;
    }
  }, []);

  const addTVShow = useCallback(async (show: Omit<TVShowDB, "id" | "created_at" | "updated_at" | "vendor_name">) => {
    try {
      const { data, error } = await supabase
        .from("tv_shows")
        .insert({
          title: show.title,
          genre: show.genre,
          language: show.language,
          rating: show.rating,
          status: show.status,
          subscription_required: show.subscription_required,
          thumbnail_url: show.thumbnail_url,
          description: show.description,
          tagline: show.tagline,
          release_date: show.release_date,
          age_rating: show.age_rating,
          channel: show.channel,
          air_time: show.air_time,
          genres: show.genres as unknown as Json,
          tags: show.tags as unknown as Json,
          cast_crew: show.cast_crew,
          vendor_id: show.vendor_id,
          total_episodes: show.total_episodes,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchTVShows();
      return data;
    } catch (error) {
      console.error("Error adding TV show:", error);
      toast.error("Failed to add TV show");
      return null;
    }
  }, [fetchTVShows]);

  const updateTVShow = useCallback(async (id: string, updates: Partial<TVShowDB>) => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.genres) updateData.genres = updates.genres as unknown as Json;
      if (updates.tags) updateData.tags = updates.tags as unknown as Json;
      delete updateData.vendor_name;

      const { error } = await supabase
        .from("tv_shows")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      await fetchTVShows();
      return true;
    } catch (error) {
      console.error("Error updating TV show:", error);
      toast.error("Failed to update TV show");
      return false;
    }
  }, [fetchTVShows]);

  const deleteTVShow = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("tv_shows").delete().eq("id", id);
      if (error) throw error;
      await fetchTVShows();
      return true;
    } catch (error) {
      console.error("Error deleting TV show:", error);
      toast.error("Failed to delete TV show");
      return false;
    }
  }, [fetchTVShows]);

  return { tvShows, isLoading, fetchTVShows, getTVShow, addTVShow, updateTVShow, deleteTVShow };
}
