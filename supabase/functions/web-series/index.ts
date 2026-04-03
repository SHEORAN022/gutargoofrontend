import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const seriesId = pathParts[1];
    const subResource = pathParts[2]; // 'seasons' or 'episodes'
    const subResourceId = pathParts[3];

    // Handle seasons sub-resource
    if (seriesId && subResource === "seasons") {
      return handleSeasons(req, supabase, seriesId, subResourceId);
    }

    // Handle episodes sub-resource
    if (seriesId && subResource === "episodes") {
      return handleEpisodes(req, supabase, subResourceId);
    }

    // GET - List all or get single web series
    if (req.method === "GET") {
      if (seriesId) {
        const { data, error } = await supabase
          .from("web_series")
          .select(`
            *,
            vendors:vendor_id(id, name, company_name),
            seasons:web_series_seasons(
              id, season_number, title, description,
              episodes:web_series_episodes(id, episode_number, title, duration, video_url, thumbnail_url)
            )
          `)
          .eq("id", seriesId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Web series not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const status = url.searchParams.get("status");
      const genre = url.searchParams.get("genre");
      const language = url.searchParams.get("language");
      const vendor_id = url.searchParams.get("vendor_id");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("web_series")
        .select("*, vendors:vendor_id(id, name, company_name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq("status", status);
      if (genre) query = query.eq("genre", genre);
      if (language) query = query.eq("language", language);
      if (vendor_id) query = query.eq("vendor_id", vendor_id);

      const { data, error, count } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ data, count, limit, offset }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create new web series
    if (req.method === "POST") {
      const body = await req.json();

      const { data, error } = await supabase
        .from("web_series")
        .insert({
          title: body.title,
          genre: body.genre,
          language: body.language || "Hindi",
          description: body.description,
          tagline: body.tagline,
          rating: body.rating,
          age_rating: body.age_rating,
          release_date: body.release_date,
          thumbnail_url: body.thumbnail_url,
          vendor_id: body.vendor_id,
          status: body.status || "draft",
          subscription_required: body.subscription_required || false,
          total_episodes: body.total_episodes || 0,
          genres: body.genres || [],
          tags: body.tags || [],
          cast_crew: body.cast_crew || [],
        })
        .select("*, vendors:vendor_id(id, name, company_name)")
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Web series created successfully" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT - Update web series
    if (req.method === "PUT") {
      if (!seriesId) {
        return new Response(
          JSON.stringify({ error: "Web series ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();

      const { data, error } = await supabase
        .from("web_series")
        .update({
          title: body.title,
          genre: body.genre,
          language: body.language,
          description: body.description,
          tagline: body.tagline,
          rating: body.rating,
          age_rating: body.age_rating,
          release_date: body.release_date,
          thumbnail_url: body.thumbnail_url,
          vendor_id: body.vendor_id,
          status: body.status,
          subscription_required: body.subscription_required,
          total_episodes: body.total_episodes,
          genres: body.genres,
          tags: body.tags,
          cast_crew: body.cast_crew,
          updated_at: new Date().toISOString(),
        })
        .eq("id", seriesId)
        .select("*, vendors:vendor_id(id, name, company_name)")
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Web series updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Delete web series
    if (req.method === "DELETE") {
      if (!seriesId) {
        return new Response(
          JSON.stringify({ error: "Web series ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("web_series")
        .delete()
        .eq("id", seriesId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: "Web series deleted successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Handle seasons sub-resource
async function handleSeasons(req: Request, supabase: any, seriesId: string, seasonId?: string) {
  if (req.method === "GET") {
    if (seasonId) {
      const { data, error } = await supabase
        .from("web_series_seasons")
        .select("*, episodes:web_series_episodes(*)")
        .eq("id", seasonId)
        .maybeSingle();

      if (error) throw error;
      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("web_series_seasons")
      .select("*, episodes:web_series_episodes(*)")
      .eq("web_series_id", seriesId)
      .order("season_number");

    if (error) throw error;
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from("web_series_seasons")
      .insert({
        web_series_id: seriesId,
        season_number: body.season_number,
        title: body.title,
        description: body.description,
      })
      .select()
      .single();

    if (error) throw error;
    return new Response(
      JSON.stringify({ data, message: "Season created successfully" }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method === "PUT" && seasonId) {
    const body = await req.json();
    const { data, error } = await supabase
      .from("web_series_seasons")
      .update({
        season_number: body.season_number,
        title: body.title,
        description: body.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", seasonId)
      .select()
      .single();

    if (error) throw error;
    return new Response(
      JSON.stringify({ data, message: "Season updated successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method === "DELETE" && seasonId) {
    const { error } = await supabase
      .from("web_series_seasons")
      .delete()
      .eq("id", seasonId);

    if (error) throw error;
    return new Response(
      JSON.stringify({ message: "Season deleted successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Handle episodes sub-resource
async function handleEpisodes(req: Request, supabase: any, episodeId?: string) {
  const url = new URL(req.url);
  const seasonId = url.searchParams.get("season_id");

  if (req.method === "GET") {
    if (episodeId) {
      const { data, error } = await supabase
        .from("web_series_episodes")
        .select("*")
        .eq("id", episodeId)
        .maybeSingle();

      if (error) throw error;
      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (seasonId) {
      const { data, error } = await supabase
        .from("web_series_episodes")
        .select("*")
        .eq("season_id", seasonId)
        .order("episode_number");

      if (error) throw error;
      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from("web_series_episodes")
      .insert({
        season_id: body.season_id,
        episode_number: body.episode_number,
        title: body.title,
        description: body.description,
        duration: body.duration,
        video_url: body.video_url,
        thumbnail_url: body.thumbnail_url,
      })
      .select()
      .single();

    if (error) throw error;
    return new Response(
      JSON.stringify({ data, message: "Episode created successfully" }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method === "PUT" && episodeId) {
    const body = await req.json();
    const { data, error } = await supabase
      .from("web_series_episodes")
      .update({
        episode_number: body.episode_number,
        title: body.title,
        description: body.description,
        duration: body.duration,
        video_url: body.video_url,
        thumbnail_url: body.thumbnail_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", episodeId)
      .select()
      .single();

    if (error) throw error;
    return new Response(
      JSON.stringify({ data, message: "Episode updated successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method === "DELETE" && episodeId) {
    const { error } = await supabase
      .from("web_series_episodes")
      .delete()
      .eq("id", episodeId);

    if (error) throw error;
    return new Response(
      JSON.stringify({ message: "Episode deleted successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
