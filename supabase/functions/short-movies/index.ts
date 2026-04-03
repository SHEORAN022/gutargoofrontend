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
    const shortMovieId = pathParts[1];

    // GET - List all or get single
    if (req.method === "GET") {
      if (shortMovieId) {
        const { data, error } = await supabase
          .from("short_movies")
          .select("*, vendors:vendor_id(id, name, company_name)")
          .eq("id", shortMovieId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Short movie not found" }),
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
        .from("short_movies")
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

    // POST - Create new
    if (req.method === "POST") {
      const body = await req.json();

      const { data, error } = await supabase
        .from("short_movies")
        .insert({
          title: body.title,
          genre: body.genre,
          language: body.language || "Hindi",
          description: body.description,
          tagline: body.tagline,
          duration: body.duration,
          rating: body.rating,
          age_rating: body.age_rating,
          release_date: body.release_date,
          video_url: body.video_url,
          thumbnail_url: body.thumbnail_url,
          vendor_id: body.vendor_id,
          director: body.director,
          status: body.status || "draft",
          subscription_required: body.subscription_required || false,
          ads_enabled: body.ads_enabled ?? true,
          genres: body.genres || [],
          tags: body.tags || [],
          cast_crew: body.cast_crew || [],
        })
        .select("*, vendors:vendor_id(id, name, company_name)")
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Short movie created successfully" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT - Update
    if (req.method === "PUT") {
      if (!shortMovieId) {
        return new Response(
          JSON.stringify({ error: "Short movie ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();

      const { data, error } = await supabase
        .from("short_movies")
        .update({
          title: body.title,
          genre: body.genre,
          language: body.language,
          description: body.description,
          tagline: body.tagline,
          duration: body.duration,
          rating: body.rating,
          age_rating: body.age_rating,
          release_date: body.release_date,
          video_url: body.video_url,
          thumbnail_url: body.thumbnail_url,
          vendor_id: body.vendor_id,
          director: body.director,
          status: body.status,
          subscription_required: body.subscription_required,
          ads_enabled: body.ads_enabled,
          genres: body.genres,
          tags: body.tags,
          cast_crew: body.cast_crew,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shortMovieId)
        .select("*, vendors:vendor_id(id, name, company_name)")
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Short movie updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE
    if (req.method === "DELETE") {
      if (!shortMovieId) {
        return new Response(
          JSON.stringify({ error: "Short movie ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("short_movies")
        .delete()
        .eq("id", shortMovieId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: "Short movie deleted successfully" }),
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
