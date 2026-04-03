import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface MovieDB {
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
  genres: string[];
  tags: string[];
  cast_crew: Json;
  vendor_id: string | null;
  vendor_name?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export function useMoviesDB() {
  const [movies, setMovies] = useState<MovieDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("movies")
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

      setMovies(moviesWithVendor);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Failed to load movies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const getMovie = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("movies")
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
      } as MovieDB;
    } catch (error) {
      console.error("Error fetching movie:", error);
      return null;
    }
  }, []);

  const addMovie = useCallback(async (movie: Omit<MovieDB, "id" | "created_at" | "updated_at" | "views" | "vendor_name">) => {
    try {
      const { data, error } = await supabase
        .from("movies")
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
          genres: movie.genres as unknown as Json,
          tags: movie.tags as unknown as Json,
          cast_crew: movie.cast_crew,
          vendor_id: movie.vendor_id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchMovies();
      return data;
    } catch (error) {
      console.error("Error adding movie:", error);
      toast.error("Failed to add movie");
      return null;
    }
  }, [fetchMovies]);

  const updateMovie = useCallback(async (id: string, updates: Partial<MovieDB>) => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.genres) updateData.genres = updates.genres as unknown as Json;
      if (updates.tags) updateData.tags = updates.tags as unknown as Json;
      delete updateData.vendor_name;

      const { error } = await supabase
        .from("movies")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      await fetchMovies();
      return true;
    } catch (error) {
      console.error("Error updating movie:", error);
      toast.error("Failed to update movie");
      return false;
    }
  }, [fetchMovies]);

  const deleteMovie = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("movies").delete().eq("id", id);
      if (error) throw error;
      await fetchMovies();
      return true;
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("Failed to delete movie");
      return false;
    }
  }, [fetchMovies]);

  return { movies, isLoading, fetchMovies, getMovie, addMovie, updateMovie, deleteMovie };
}
