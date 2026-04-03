import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);

    if (req.method === "GET") {
      const query = url.searchParams.get("q") || url.searchParams.get("query");
      const type = url.searchParams.get("type"); // movies, web_series, tv_shows, short_movies, or all
      const genre = url.searchParams.get("genre");
      const language = url.searchParams.get("language");
      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      if (!query || query.trim().length < 2) {
        return new Response(
          JSON.stringify({ error: "Search query must be at least 2 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const searchPattern = `%${query}%`;
      const contentTypes = type && type !== "all" 
        ? [type] 
        : ["movies", "web_series", "tv_shows", "short_movies"];

      const results: Record<string, unknown[]> = {};
      let totalCount = 0;

      for (const contentType of contentTypes) {
        let dbQuery = supabase
          .from(contentType)
          .select("*", { count: "exact" })
          .or(`title.ilike.${searchPattern},description.ilike.${searchPattern},tagline.ilike.${searchPattern}`)
          .eq("status", "published");

        if (genre) {
          dbQuery = dbQuery.eq("genre", genre);
        }
        if (language) {
          dbQuery = dbQuery.eq("language", language);
        }
        if (status) {
          dbQuery = dbQuery.eq("status", status);
        }

        // Apply pagination per content type when searching specific type
        if (type && type !== "all") {
          dbQuery = dbQuery.range(offset, offset + limit - 1);
        } else {
          // When searching all, limit results per type
          dbQuery = dbQuery.limit(Math.ceil(limit / contentTypes.length));
        }

        dbQuery = dbQuery.order("created_at", { ascending: false });

        const { data, error, count } = await dbQuery;

        if (error) {
          console.error(`Error searching ${contentType}:`, error);
          continue;
        }

        // Add content_type field to each result
        const typedData = (data || []).map(item => ({
          ...item,
          content_type: contentType,
        }));

        results[contentType] = typedData;
        totalCount += count || 0;
      }

      // Flatten results if searching all types
      let flatResults: unknown[] = [];
      if (!type || type === "all") {
        for (const contentType of contentTypes) {
          flatResults = flatResults.concat(results[contentType] || []);
        }
        // Sort combined results by created_at
        flatResults.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      return new Response(
        JSON.stringify({
          query,
          total_count: totalCount,
          results: type && type !== "all" ? results[type] : flatResults,
          by_type: results,
          filters: { genre, language, status },
          pagination: { limit, offset },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
