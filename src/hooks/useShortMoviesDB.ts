import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface ShortMovieDB {
  id: string;
  title: string;
  genre: string;
  language: string;
  duration: string | null;
  rating: string | null;
  status: "published" | "pending" | "draft";
  subscription_required: boolean;
  ads_enabled: boolean;
  thumbnail_url: string | null;
  video_url: string | null;
  description: string | null;
  tagline: string | null;
  release_date: string | null;
  age_rating: string | null;
  director: string | null;
  genres: string[];
  tags: string[];
  cast_crew: Json;
  vendor_id: string | null;
  vendor_name?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export function useShortMoviesDB() {
  const [shortMovies, setShortMovies] = useState<ShortMovieDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShortMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("short_movies")
        .select(`
          *,
          vendors:vendor_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const moviesWithVendor = (data || []).map((movie) => ({
        ...movie,
        status: movie.status as "published" | "pending" | "draft",
        genres: (movie.genres as string[]) || [],
        tags: (movie.tags as string[]) || [],
        vendor_name: movie.vendors?.name || null,
      }));

      setShortMovies(moviesWithVendor);
    } catch (error) {
      console.error("Error fetching short movies:", error);
      toast.error("Failed to load short movies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShortMovies();
  }, [fetchShortMovies]);

  const getShortMovie = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("short_movies")
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
      } as ShortMovieDB;
    } catch (error) {
      console.error("Error fetching short movie:", error);
      return null;
    }
  }, []);

  const addShortMovie = useCallback(async (movie: Omit<ShortMovieDB, "id" | "created_at" | "updated_at" | "views" | "vendor_name">) => {
    try {
      const { data, error } = await supabase
        .from("short_movies")
        .insert({
          title: movie.title,
          genre: movie.genre,
          language: movie.language,
          duration: movie.duration,
          rating: movie.rating,
          status: movie.status,
          subscription_required: movie.subscription_required,
          ads_enabled: movie.ads_enabled,
          thumbnail_url: movie.thumbnail_url,
          video_url: movie.video_url,
          description: movie.description,
          tagline: movie.tagline,
          release_date: movie.release_date,
          age_rating: movie.age_rating,
          director: movie.director,
          genres: movie.genres as unknown as Json,
          tags: movie.tags as unknown as Json,
          cast_crew: movie.cast_crew,
          vendor_id: movie.vendor_id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchShortMovies();
      return data;
    } catch (error) {
      console.error("Error adding short movie:", error);
      toast.error("Failed to add short movie");
      return null;
    }
  }, [fetchShortMovies]);

  const updateShortMovie = useCallback(async (id: string, updates: Partial<ShortMovieDB>) => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.genres) updateData.genres = updates.genres as unknown as Json;
      if (updates.tags) updateData.tags = updates.tags as unknown as Json;
      delete updateData.vendor_name;

      const { error } = await supabase
        .from("short_movies")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      await fetchShortMovies();
      return true;
    } catch (error) {
      console.error("Error updating short movie:", error);
      toast.error("Failed to update short movie");
      return false;
    }
  }, [fetchShortMovies]);

  const deleteShortMovie = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("short_movies").delete().eq("id", id);
      if (error) throw error;
      await fetchShortMovies();
      return true;
    } catch (error) {
      console.error("Error deleting short movie:", error);
      toast.error("Failed to delete short movie");
      return false;
    }
  }, [fetchShortMovies]);

  return { shortMovies, isLoading, fetchShortMovies, getShortMovie, addShortMovie, updateShortMovie, deleteShortMovie };
}
