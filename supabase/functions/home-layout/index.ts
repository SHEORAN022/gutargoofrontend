import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const url = new URL(req.url);
    const path = url.pathname.replace("/home-layout", "");
    const tab = url.searchParams.get("tab") || "home";
    const userId = url.searchParams.get("user_id");

    // GET /home-layout - Get complete home layout for a tab
    if (req.method === "GET" && (path === "" || path === "/")) {
      // Get banner limit setting
      const { data: bannerLimitSetting } = await supabase
        .from("home_settings")
        .select("setting_value")
        .eq("setting_key", "banner_limit")
        .maybeSingle();
      
      const bannerLimit = bannerLimitSetting?.setting_value?.value || 8;

      // Fetch banners for this tab
      const { data: bannersRaw, error: bannersError } = await supabase
        .from("home_banners")
        .select("*")
        .eq("is_active", true)
        .contains("visible_tabs", [tab])
        .order("display_order", { ascending: true })
        .limit(bannerLimit);

      if (bannersError) throw bannersError;

      // Enrich banners with content data (title, genre, etc.)
      const banners = await Promise.all(
        (bannersRaw || []).map(async (banner) => {
          if (!banner.content_id) return banner;

          // Fetch content details based on redirect type
          const tableName = getTableName(banner.cta_redirect_type);
          const { data: content } = await supabase
            .from(tableName)
            .select("id, title, genre, language, tagline, thumbnail_url, description")
            .eq("id", banner.content_id)
            .maybeSingle();

          if (content) {
            return {
              ...banner,
              // Use banner values or fallback to content
              title: banner.title || content.title,
              subtitle: banner.subtitle || content.tagline,
              genre_text: `${content.language} · ${content.genre}`,
              content_title: content.title,
              content_genre: content.genre,
              content_language: content.language,
              content_description: content.description,
              content_thumbnail: content.thumbnail_url,
            };
          }
          return banner;
        })
      );

      // Fetch sections for this tab
      const { data: sections, error: sectionsError } = await supabase
        .from("home_sections")
        .select("*, categories(id, name, slug)")
        .eq("is_active", true)
        .contains("visible_tabs", [tab])
        .order("display_order", { ascending: true });

      if (sectionsError) throw sectionsError;

      // Fetch settings
      const { data: settings } = await supabase
        .from("home_settings")
        .select("setting_key, setting_value");

      const settingsMap: Record<string, any> = {};
      settings?.forEach((s) => {
        settingsMap[s.setting_key] = s.setting_value?.value;
      });

      // Process sections and fetch content for each
      const processedSections = await Promise.all(
        (sections || []).map(async (section) => {
          let content: any[] = [];

          // Skip continue_watching if not enabled or no user
          if (section.section_type === "continue_watching") {
            if (!settingsMap.continue_watching_enabled || !userId) {
              return { ...section, content: [] };
            }
            // Fetch user's watch progress
            const { data: watchProgress } = await supabase
              .from("user_watch_progress")
              .select("*")
              .eq("user_id", userId)
              .eq("is_completed", false)
              .order("last_watched_at", { ascending: false })
              .limit(section.item_limit || 20);

            content = watchProgress || [];
          } else if (section.content_source === "admin_selected") {
            // Fetch manually selected items from section_items table
            const { data: sectionItems } = await supabase
              .from("section_items")
              .select("*")
              .eq("section_id", section.id)
              .order("display_order", { ascending: true });

            if (sectionItems && sectionItems.length > 0) {
              // Fetch content for each item
              for (const item of sectionItems) {
                const tableName = item.content_type === "web_series" ? "web_series" :
                                  item.content_type === "tv_shows" ? "tv_shows" :
                                  item.content_type === "short_movies" ? "short_movies" : "movies";
                
                const { data: contentItem } = await supabase
                  .from(tableName)
                  .select("*")
                  .eq("id", item.content_id)
                  .maybeSingle();
                
                if (contentItem) {
                  content.push({ ...contentItem, _content_type: tableName });
                }
              }
            }
          } else {
            // Determine which table to query based on content_type
            const tables = getContentTables(section.content_type);
            
            for (const table of tables) {
              let query = supabase.from(table).select("*").eq("status", "active");
              
              // Apply original filter if needed
              if (section.is_original_only) {
                query = query.eq("is_original", true);
              }

              // Apply category filter
              if (section.section_type === "category_based" && section.category_id) {
                query = query.eq("genre", section.categories?.slug || section.category_id);
              }

              // Apply sorting based on content_source
              switch (section.content_source) {
                case "most_viewed":
                  query = query.order("views", { ascending: false });
                  break;
                case "recently_added":
                  query = query.order("created_at", { ascending: false });
                  break;
                default:
                  query = query.order("created_at", { ascending: false });
              }

              query = query.limit(section.item_limit || 20);
              const { data } = await query;
              if (data) {
                content.push(...data.map((item) => ({ ...item, _content_type: table })));
              }
            }

            // Limit total items
            content = content.slice(0, section.item_limit || 20);
          }

          return {
            id: section.id,
            title: section.title,
            section_type: section.section_type,
            display_style: section.display_style,
            content,
          };
        })
      );

      return new Response(
        JSON.stringify({
          tab,
          banners: banners || [],
          sections: processedSections.filter((s) => s.content.length > 0 || s.section_type === "continue_watching"),
          settings: settingsMap,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /home-layout/banners - Get only banners with enriched content
    if (req.method === "GET" && path === "/banners") {
      const { data: bannersRaw, error } = await supabase
        .from("home_banners")
        .select("*")
        .eq("is_active", true)
        .contains("visible_tabs", [tab])
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Enrich banners with content data
      const banners = await Promise.all(
        (bannersRaw || []).map(async (banner) => {
          if (!banner.content_id) return banner;

          const tableName = getTableName(banner.cta_redirect_type);
          const { data: content } = await supabase
            .from(tableName)
            .select("id, title, genre, language, tagline, thumbnail_url")
            .eq("id", banner.content_id)
            .maybeSingle();

          if (content) {
            return {
              ...banner,
              title: banner.title || content.title,
              subtitle: banner.subtitle || content.tagline,
              genre_text: `${content.language} · ${content.genre}`,
              content_title: content.title,
              content_genre: content.genre,
              content_language: content.language,
            };
          }
          return banner;
        })
      );

      return new Response(JSON.stringify({ data: banners }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /home-layout/sections - Get only sections metadata
    if (req.method === "GET" && path === "/sections") {
      const { data: sections, error } = await supabase
        .from("home_sections")
        .select("*, categories(id, name, slug)")
        .eq("is_active", true)
        .contains("visible_tabs", [tab])
        .order("display_order", { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify({ data: sections }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /home-layout/settings - Get all home settings
    if (req.method === "GET" && path === "/settings") {
      const { data: settings, error } = await supabase
        .from("home_settings")
        .select("*");

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      settings?.forEach((s) => {
        settingsMap[s.setting_key] = s.setting_value?.value;
      });

      return new Response(JSON.stringify({ data: settingsMap }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getTableName(ctaType: string): string {
  switch (ctaType) {
    case "movie": return "movies";
    case "web_series": return "web_series";
    case "tv_show": return "tv_shows";
    case "short_movie": return "short_movies";
    default: return "movies";
  }
}

function getContentTables(contentType: string): string[] {
  switch (contentType) {
    case "movies":
      return ["movies"];
    case "web_series":
      return ["web_series"];
    case "tv_shows":
      return ["tv_shows"];
    case "short_movies":
      return ["short_movies"];
    case "all":
    default:
      return ["movies", "web_series", "tv_shows", "short_movies"];
  }
}
