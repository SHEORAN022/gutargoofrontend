import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface WebSeriesDB {
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
  genres: string[];
  tags: string[];
  cast_crew: Json;
  vendor_id: string | null;
  vendor_name?: string;
  total_episodes: number;
  created_at: string;
  updated_at: string;
}

export function useWebSeriesDB() {
  const [webSeries, setWebSeries] = useState<WebSeriesDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWebSeries = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("web_series")
        .select(`
          *,
          vendors:vendor_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const seriesWithVendor = (data || []).map((series) => ({
        ...series,
        status: series.status as "published" | "pending" | "draft",
        genres: (series.genres as string[]) || [],
        tags: (series.tags as string[]) || [],
        vendor_name: series.vendors?.name || null,
      }));

      setWebSeries(seriesWithVendor);
    } catch (error) {
      console.error("Error fetching web series:", error);
      toast.error("Failed to load web series");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebSeries();
  }, [fetchWebSeries]);

  const getWebSeries = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("web_series")
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
      } as WebSeriesDB;
    } catch (error) {
      console.error("Error fetching web series:", error);
      return null;
    }
  }, []);

  const addWebSeries = useCallback(async (series: Omit<WebSeriesDB, "id" | "created_at" | "updated_at" | "vendor_name">) => {
    try {
      const { data, error } = await supabase
        .from("web_series")
        .insert({
          title: series.title,
          genre: series.genre,
          language: series.language,
          rating: series.rating,
          status: series.status,
          subscription_required: series.subscription_required,
          thumbnail_url: series.thumbnail_url,
          description: series.description,
          tagline: series.tagline,
          release_date: series.release_date,
          age_rating: series.age_rating,
          genres: series.genres as unknown as Json,
          tags: series.tags as unknown as Json,
          cast_crew: series.cast_crew,
          vendor_id: series.vendor_id,
          total_episodes: series.total_episodes,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchWebSeries();
      return data;
    } catch (error) {
      console.error("Error adding web series:", error);
      toast.error("Failed to add web series");
      return null;
    }
  }, [fetchWebSeries]);

  const updateWebSeries = useCallback(async (id: string, updates: Partial<WebSeriesDB>) => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.genres) updateData.genres = updates.genres as unknown as Json;
      if (updates.tags) updateData.tags = updates.tags as unknown as Json;
      delete updateData.vendor_name;

      const { error } = await supabase
        .from("web_series")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      await fetchWebSeries();
      return true;
    } catch (error) {
      console.error("Error updating web series:", error);
      toast.error("Failed to update web series");
      return false;
    }
  }, [fetchWebSeries]);

  const deleteWebSeries = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("web_series").delete().eq("id", id);
      if (error) throw error;
      await fetchWebSeries();
      return true;
    } catch (error) {
      console.error("Error deleting web series:", error);
      toast.error("Failed to delete web series");
      return false;
    }
  }, [fetchWebSeries]);

  return { webSeries, isLoading, fetchWebSeries, getWebSeries, addWebSeries, updateWebSeries, deleteWebSeries };
}
