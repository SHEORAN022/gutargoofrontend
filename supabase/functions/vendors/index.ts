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
    const vendorId = pathParts[1];
    const subResource = pathParts[2]; // 'content'

    // Handle vendor content listing
    if (vendorId && subResource === "content") {
      return handleVendorContent(req, supabase, vendorId);
    }

    // GET - List all or get single vendor
    if (req.method === "GET") {
      if (vendorId) {
        const { data, error } = await supabase
          .from("vendors")
          .select("*")
          .eq("id", vendorId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Vendor not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("vendors")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq("status", status);

      const { data, error, count } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ data, count, limit, offset }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create new vendor
    if (req.method === "POST") {
      const body = await req.json();

      const { data, error } = await supabase
        .from("vendors")
        .insert({
          name: body.name,
          email: body.email,
          phone: body.phone,
          company_name: body.company_name,
          address: body.address,
          status: body.status || "pending",
          commission_rate: body.commission_rate || 0,
          notes: body.notes,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Vendor created successfully" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT - Update vendor
    if (req.method === "PUT") {
      if (!vendorId) {
        return new Response(
          JSON.stringify({ error: "Vendor ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();

      const { data, error } = await supabase
        .from("vendors")
        .update({
          name: body.name,
          email: body.email,
          phone: body.phone,
          company_name: body.company_name,
          address: body.address,
          status: body.status,
          commission_rate: body.commission_rate,
          notes: body.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vendorId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Vendor updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Delete vendor
    if (req.method === "DELETE") {
      if (!vendorId) {
        return new Response(
          JSON.stringify({ error: "Vendor ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("vendors")
        .delete()
        .eq("id", vendorId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: "Vendor deleted successfully" }),
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

// Handle vendor content listing
async function handleVendorContent(req: Request, supabase: any, vendorId: string) {
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const contentType = url.searchParams.get("type"); // 'movies', 'web_series', 'tv_shows', 'short_movies'

  const results: any = {};

  // Fetch movies
  if (!contentType || contentType === "movies") {
    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select("id, title, genre, status, views, created_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (moviesError) throw moviesError;
    results.movies = movies;
  }

  // Fetch web series
  if (!contentType || contentType === "web_series") {
    const { data: webSeries, error: webSeriesError } = await supabase
      .from("web_series")
      .select("id, title, genre, status, total_episodes, created_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (webSeriesError) throw webSeriesError;
    results.web_series = webSeries;
  }

  // Fetch TV shows
  if (!contentType || contentType === "tv_shows") {
    const { data: tvShows, error: tvShowsError } = await supabase
      .from("tv_shows")
      .select("id, title, genre, status, total_episodes, channel, created_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (tvShowsError) throw tvShowsError;
    results.tv_shows = tvShows;
  }

  // Fetch short movies
  if (!contentType || contentType === "short_movies") {
    const { data: shortMovies, error: shortMoviesError } = await supabase
      .from("short_movies")
      .select("id, title, genre, status, views, created_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (shortMoviesError) throw shortMoviesError;
    results.short_movies = shortMovies;
  }

  // Calculate totals
  results.totals = {
    movies: results.movies?.length || 0,
    web_series: results.web_series?.length || 0,
    tv_shows: results.tv_shows?.length || 0,
    short_movies: results.short_movies?.length || 0,
    total: (results.movies?.length || 0) + 
           (results.web_series?.length || 0) + 
           (results.tv_shows?.length || 0) + 
           (results.short_movies?.length || 0),
  };

  return new Response(
    JSON.stringify({ data: results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
