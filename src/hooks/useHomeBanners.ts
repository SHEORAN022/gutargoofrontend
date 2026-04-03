import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AppTab = 'home' | 'originals' | 'movies' | 'tv_shows' | 'web_series' | 'short_movies';
export type CtaRedirectType = 'movie' | 'web_series' | 'tv_show' | 'short_movie' | 'external_url';

export interface HomeBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  genre_text: string | null;
  background_image_url: string;
  mobile_image_url: string | null;
  logo_image_url: string | null;
  cta_text: string | null;
  cta_redirect_type: CtaRedirectType;
  content_id: string | null;
  external_url: string | null;
  is_active: boolean;
  display_order: number;
  auto_slide_duration: number | null;
  allow_swipe: boolean | null;
  visible_tabs: AppTab[];
  created_at: string;
  updated_at: string;
}

export interface BannerFormData {
  title?: string;
  subtitle?: string;
  genre_text?: string;
  background_image_url: string;
  mobile_image_url?: string;
  logo_image_url?: string;
  cta_text?: string;
  cta_redirect_type: CtaRedirectType;
  content_id?: string;
  external_url?: string;
  is_active: boolean;
  display_order: number;
  auto_slide_duration?: number;
  allow_swipe?: boolean;
  visible_tabs: AppTab[];
}

export function useHomeBanners() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["home-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as HomeBanner[];
    },
  });

  const createBanner = useMutation({
    mutationFn: async (banner: BannerFormData) => {
      const { data, error } = await supabase
        .from("home_banners")
        .insert(banner)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-banners"] });
      toast({ title: "Banner created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating banner", description: error.message, variant: "destructive" });
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({ id, ...banner }: BannerFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("home_banners")
        .update(banner)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-banners"] });
      toast({ title: "Banner updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating banner", description: error.message, variant: "destructive" });
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-banners"] });
      toast({ title: "Banner deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting banner", description: error.message, variant: "destructive" });
    },
  });

  const reorderBanners = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase.from("home_banners").update({ display_order: index }).eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-banners"] });
    },
  });

  return {
    banners,
    isLoading,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
  };
}
