export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ads_settings: {
        Row: {
          ad_type: string
          ad_unit_id: string | null
          app_id: string | null
          created_at: string
          frequency_cap: number | null
          id: string
          is_enabled: boolean
          placement: string
          provider: string
          updated_at: string
        }
        Insert: {
          ad_type: string
          ad_unit_id?: string | null
          app_id?: string | null
          created_at?: string
          frequency_cap?: number | null
          id?: string
          is_enabled?: boolean
          placement: string
          provider?: string
          updated_at?: string
        }
        Update: {
          ad_type?: string
          ad_unit_id?: string | null
          app_id?: string | null
          created_at?: string
          frequency_cap?: number | null
          id?: string
          is_enabled?: boolean
          placement?: string
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          devices_count: number
          email: string
          id: string
          last_active_at: string | null
          login_method: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          subscription_plan: string
          total_watch_time: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          devices_count?: number
          email: string
          id?: string
          last_active_at?: string | null
          login_method?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          subscription_plan?: string
          total_watch_time?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          devices_count?: number
          email?: string
          id?: string
          last_active_at?: string | null
          login_method?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          subscription_plan?: string
          total_watch_time?: number
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      home_banners: {
        Row: {
          allow_swipe: boolean | null
          auto_slide_duration: number | null
          background_image_url: string
          content_id: string | null
          created_at: string
          cta_redirect_type: Database["public"]["Enums"]["cta_redirect_type"]
          cta_text: string | null
          display_order: number
          external_url: string | null
          genre_text: string | null
          id: string
          is_active: boolean
          logo_image_url: string | null
          mobile_image_url: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
          visible_tabs: Database["public"]["Enums"]["app_tab"][]
        }
        Insert: {
          allow_swipe?: boolean | null
          auto_slide_duration?: number | null
          background_image_url: string
          content_id?: string | null
          created_at?: string
          cta_redirect_type?: Database["public"]["Enums"]["cta_redirect_type"]
          cta_text?: string | null
          display_order?: number
          external_url?: string | null
          genre_text?: string | null
          id?: string
          is_active?: boolean
          logo_image_url?: string | null
          mobile_image_url?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          visible_tabs?: Database["public"]["Enums"]["app_tab"][]
        }
        Update: {
          allow_swipe?: boolean | null
          auto_slide_duration?: number | null
          background_image_url?: string
          content_id?: string | null
          created_at?: string
          cta_redirect_type?: Database["public"]["Enums"]["cta_redirect_type"]
          cta_text?: string | null
          display_order?: number
          external_url?: string | null
          genre_text?: string | null
          id?: string
          is_active?: boolean
          logo_image_url?: string | null
          mobile_image_url?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          visible_tabs?: Database["public"]["Enums"]["app_tab"][]
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          category_id: string | null
          content_source: Database["public"]["Enums"]["content_source"]
          content_type: string
          created_at: string
          display_order: number
          display_style: Database["public"]["Enums"]["display_style"]
          id: string
          is_active: boolean
          is_original_only: boolean | null
          item_limit: number | null
          section_type: Database["public"]["Enums"]["section_type"]
          title: string
          trending_period_days: number | null
          updated_at: string
          visible_tabs: Database["public"]["Enums"]["app_tab"][]
        }
        Insert: {
          category_id?: string | null
          content_source?: Database["public"]["Enums"]["content_source"]
          content_type?: string
          created_at?: string
          display_order?: number
          display_style?: Database["public"]["Enums"]["display_style"]
          id?: string
          is_active?: boolean
          is_original_only?: boolean | null
          item_limit?: number | null
          section_type: Database["public"]["Enums"]["section_type"]
          title: string
          trending_period_days?: number | null
          updated_at?: string
          visible_tabs?: Database["public"]["Enums"]["app_tab"][]
        }
        Update: {
          category_id?: string | null
          content_source?: Database["public"]["Enums"]["content_source"]
          content_type?: string
          created_at?: string
          display_order?: number
          display_style?: Database["public"]["Enums"]["display_style"]
          id?: string
          is_active?: boolean
          is_original_only?: boolean | null
          item_limit?: number | null
          section_type?: Database["public"]["Enums"]["section_type"]
          title?: string
          trending_period_days?: number | null
          updated_at?: string
          visible_tabs?: Database["public"]["Enums"]["app_tab"][]
        }
        Relationships: [
          {
            foreignKeyName: "home_sections_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      home_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      movies: {
        Row: {
          ads_enabled: boolean
          age_rating: string | null
          cast_crew: Json | null
          created_at: string
          description: string | null
          duration: string | null
          genre: string
          genres: Json | null
          id: string
          is_original: boolean | null
          language: string
          rating: string | null
          release_date: string | null
          status: string
          subscription_required: boolean
          tagline: string | null
          tags: Json | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          vendor_id: string | null
          video_url: string | null
          views: number
        }
        Insert: {
          ads_enabled?: boolean
          age_rating?: string | null
          cast_crew?: Json | null
          created_at?: string
          description?: string | null
          duration?: string | null
          genre: string
          genres?: Json | null
          id?: string
          is_original?: boolean | null
          language?: string
          rating?: string | null
          release_date?: string | null
          status?: string
          subscription_required?: boolean
          tagline?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          vendor_id?: string | null
          video_url?: string | null
          views?: number
        }
        Update: {
          ads_enabled?: boolean
          age_rating?: string | null
          cast_crew?: Json | null
          created_at?: string
          description?: string | null
          duration?: string | null
          genre?: string
          genres?: Json | null
          id?: string
          is_original?: boolean | null
          language?: string
          rating?: string | null
          release_date?: string | null
          status?: string
          subscription_required?: boolean
          tagline?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          vendor_id?: string | null
          video_url?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "movies_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      section_items: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          display_order: number
          id: string
          section_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          display_order?: number
          id?: string
          section_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          display_order?: number
          id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "home_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      short_movies: {
        Row: {
          ads_enabled: boolean
          age_rating: string | null
          cast_crew: Json | null
          created_at: string
          description: string | null
          director: string | null
          duration: string | null
          genre: string
          genres: Json | null
          id: string
          is_original: boolean | null
          language: string
          rating: string | null
          release_date: string | null
          status: string
          subscription_required: boolean
          tagline: string | null
          tags: Json | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          vendor_id: string | null
          video_url: string | null
          views: number
        }
        Insert: {
          ads_enabled?: boolean
          age_rating?: string | null
          cast_crew?: Json | null
          created_at?: string
          description?: string | null
          director?: string | null
          duration?: string | null
          genre: string
          genres?: Json | null
          id?: string
          is_original?: boolean | null
          language?: string
          rating?: string | null
          release_date?: string | null
          status?: string
          subscription_required?: boolean
          tagline?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          vendor_id?: string | null
          video_url?: string | null
          views?: number
        }
        Update: {
          ads_enabled?: boolean
          age_rating?: string | null
          cast_crew?: Json | null
          created_at?: string
          description?: string | null
          director?: string | null
          duration?: string | null
          genre?: string
          genres?: Json | null
          id?: string
          is_original?: boolean | null
          language?: string
          rating?: string | null
          release_date?: string | null
          status?: string
          subscription_required?: boolean
          tagline?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          vendor_id?: string | null
          video_url?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "short_movies_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          duration: string
          features: Json
          has_ads: boolean
          id: string
          is_active: boolean
          max_devices: number
          max_downloads: number | null
          name: string
          price: number
          quality: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration: string
          features?: Json
          has_ads?: boolean
          id?: string
          is_active?: boolean
          max_devices?: number
          max_downloads?: number | null
          name: string
          price: number
          quality?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string
          features?: Json
          has_ads?: boolean
          id?: string
          is_active?: boolean
          max_devices?: number
          max_downloads?: number | null
          name?: string
          price?: number
          quality?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tv_show_episodes: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          episode_number: number
          id: string
          season_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number: number
          id?: string
          season_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number?: number
          id?: string
          season_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tv_show_episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "tv_show_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      tv_show_seasons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          season_number: number
          title: string | null
          tv_show_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          season_number: number
          title?: string | null
          tv_show_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          season_number?: number
          title?: string | null
          tv_show_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tv_show_seasons_tv_show_id_fkey"
            columns: ["tv_show_id"]
            isOneToOne: false
            referencedRelation: "tv_shows"
            referencedColumns: ["id"]
          },
        ]
      }
      tv_shows: {
        Row: {
          age_rating: string | null
          air_time: string | null
          cast_crew: Json | null
          channel: string | null
          created_at: string
          description: string | null
          genre: string
          genres: Json | null
          id: string
          is_original: boolean | null
          language: string
          rating: string | null
          release_date: string | null
          status: string
          subscription_required: boolean
          tagline: string | null
          tags: Json | null
          thumbnail_url: string | null
          title: string
          total_episodes: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          age_rating?: string | null
          air_time?: string | null
          cast_crew?: Json | null
          channel?: string | null
          created_at?: string
          description?: string | null
          genre: string
          genres?: Json | null
          id?: string
          is_original?: boolean | null
          language?: string
          rating?: string | null
          release_date?: string | null
          status?: string
          subscription_required?: boolean
          tagline?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          total_episodes?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          age_rating?: string | null
          air_time?: string | null
          cast_crew?: Json | null
          channel?: string | null
          created_at?: string
          description?: string | null
          genre?: string
          genres?: Json | null
          id?: string
          is_original?: boolean | null
          language?: string
          rating?: string | null
          release_date?: string | null
          status?: string
          subscription_required?: boolean
          tagline?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          total_episodes?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tv_shows_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_watch_progress: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          duration_seconds: number
          episode_id: string | null
          id: string
          is_completed: boolean | null
          last_watched_at: string
          progress_percentage: number | null
          progress_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          duration_seconds?: number
          episode_id?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string
          progress_percentage?: number | null
          progress_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          duration_seconds?: number
          episode_id?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string
          progress_percentage?: number | null
          progress_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          commission_rate: number | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          pending_content: number
          phone: string | null
          status: string
          total_content: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          pending_content?: number
          phone?: string | null
          status?: string
          total_content?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          pending_content?: number
          phone?: string | null
          status?: string
          total_content?: number
          updated_at?: string
        }
        Relationships: []
      }
      web_series: {
        Row: {
          age_rating: string | null
          cast_crew: Json | null
          created_at: string
          description: string | null
          genre: string
          genres: Json | null
          id: string
          is_original: boolean | null
          language: string
          rating: string | null
          release_date: string | null
          status: string
          subscription_required: boolean
          tagline: string | null
          tags: Json | null
          thumbnail_url: string | null
          title: string
          total_episodes: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          age_rating?: string | null
          cast_crew?: Json | null
          created_at?: string
          description?: string | null
          genre: string
          genres?: Json | null
          id?: string
          is_original?: boolean | null
          language?: string
          rating?: string | null
          release_date?: string | null
          status?: string
          subscription_required?: boolean
          tagline?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          total_episodes?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          age_rating?: string | null
          cast_crew?: Json | null
          created_at?: string
          description?: string | null
          genre?: string
          genres?: Json | null
          id?: string
          is_original?: boolean | null
          language?: string
          rating?: string | null
          release_date?: string | null
          status?: string
          subscription_required?: boolean
          tagline?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          total_episodes?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web_series_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      web_series_episodes: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          episode_number: number
          id: string
          season_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number: number
          id?: string
          season_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number?: number
          id?: string
          season_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web_series_episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "web_series_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      web_series_seasons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          season_number: number
          title: string | null
          updated_at: string
          web_series_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          season_number: number
          title?: string | null
          updated_at?: string
          web_series_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          season_number?: number
          title?: string | null
          updated_at?: string
          web_series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "web_series_seasons_web_series_id_fkey"
            columns: ["web_series_id"]
            isOneToOne: false
            referencedRelation: "web_series"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_tab:
        | "home"
        | "originals"
        | "movies"
        | "tv_shows"
        | "web_series"
        | "short_movies"
      content_source:
        | "most_viewed"
        | "recently_added"
        | "watch_time_based"
        | "admin_selected"
        | "auto"
      cta_redirect_type:
        | "movie"
        | "web_series"
        | "tv_show"
        | "short_movie"
        | "external_url"
      display_style:
        | "horizontal_banner"
        | "vertical_banner"
        | "big_horizontal"
        | "big_vertical"
        | "index_horizontal"
        | "index_vertical"
      section_type:
        | "continue_watching"
        | "trending_now"
        | "latest_releases"
        | "top_rated"
        | "recommended"
        | "category_based"
        | "custom_collection"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_tab: [
        "home",
        "originals",
        "movies",
        "tv_shows",
        "web_series",
        "short_movies",
      ],
      content_source: [
        "most_viewed",
        "recently_added",
        "watch_time_based",
        "admin_selected",
        "auto",
      ],
      cta_redirect_type: [
        "movie",
        "web_series",
        "tv_show",
        "short_movie",
        "external_url",
      ],
      display_style: [
        "horizontal_banner",
        "vertical_banner",
        "big_horizontal",
        "big_vertical",
        "index_horizontal",
        "index_vertical",
      ],
      section_type: [
        "continue_watching",
        "trending_now",
        "latest_releases",
        "top_rated",
        "recommended",
        "category_based",
        "custom_collection",
      ],
    },
  },
} as const
