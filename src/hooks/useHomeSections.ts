import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SectionType = 'continue_watching' | 'trending_now' | 'latest_releases' | 'top_rated' | 'recommended' | 'category_based' | 'custom_collection';
export type ContentSource = 'most_viewed' | 'recently_added' | 'watch_time_based' | 'admin_selected' | 'auto';
export type DisplayStyle = 'horizontal_banner' | 'vertical_banner' | 'big_horizontal' | 'big_vertical' | 'index_horizontal' | 'index_vertical';
export type AppTab = 'home' | 'originals' | 'movies' | 'tv_shows' | 'web_series' | 'short_movies';

export interface HomeSection {
  id: string;
  title: string;
  section_type: SectionType;
  content_type: string;
  content_source: ContentSource;
  category_id: string | null;
  display_style: DisplayStyle;
  item_limit: number | null;
  is_active: boolean;
  display_order: number;
  visible_tabs: AppTab[];
  trending_period_days: number | null;
  is_original_only: boolean | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string } | null;
}

export interface SectionFormData {
  title: string;
  section_type: SectionType;
  content_type: string;
  content_source: ContentSource;
  category_id?: string;
  display_style: DisplayStyle;
  item_limit?: number;
  is_active: boolean;
  display_order: number;
  visible_tabs: AppTab[];
  trending_period_days?: number;
  is_original_only?: boolean;
}

export interface SectionItem {
  id: string;
  section_id: string;
  content_type: string;
  content_id: string;
  display_order: number;
  created_at: string;
}

export function useHomeSections() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["home-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_sections")
        .select("*, categories(name)")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as HomeSection[];
    },
  });

  const createSection = useMutation({
    mutationFn: async (section: SectionFormData) => {
      const { data, error } = await supabase
        .from("home_sections")
        .insert(section)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-sections"] });
      toast({ title: "Section created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating section", description: error.message, variant: "destructive" });
    },
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, ...section }: SectionFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("home_sections")
        .update(section)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-sections"] });
      toast({ title: "Section updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating section", description: error.message, variant: "destructive" });
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-sections"] });
      toast({ title: "Section deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting section", description: error.message, variant: "destructive" });
    },
  });

  const reorderSections = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) =>
        supabase.from("home_sections").update({ display_order: index }).eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-sections"] });
    },
  });

  return {
    sections,
    isLoading,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
  };
}

export function useSectionItems(sectionId: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["section-items", sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      const { data, error } = await supabase
        .from("section_items")
        .select("*")
        .eq("section_id", sectionId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as SectionItem[];
    },
    enabled: !!sectionId,
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<SectionItem, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("section_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section-items", sectionId] });
      toast({ title: "Item added to section" });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("section_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section-items", sectionId] });
      toast({ title: "Item removed from section" });
    },
  });

  return { items, isLoading, addItem, removeItem };
}
