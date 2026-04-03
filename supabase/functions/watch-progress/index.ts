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
    const userId = url.searchParams.get("user_id");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Update watch progress
    if (req.method === "POST") {
      const body = await req.json();
      const { content_type, content_id, episode_id, progress_seconds, duration_seconds } = body;

      if (!content_type || !content_id || progress_seconds === undefined || duration_seconds === undefined) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: content_type, content_id, progress_seconds, duration_seconds" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const progressPercentage = duration_seconds > 0 
        ? Math.round((progress_seconds / duration_seconds) * 100 * 100) / 100 
        : 0;
      
      const isCompleted = progressPercentage >= 95;

      const { data, error } = await supabase
        .from("user_watch_progress")
        .upsert({
          user_id: userId,
          content_type,
          content_id,
          episode_id: episode_id || null,
          progress_seconds,
          duration_seconds,
          progress_percentage: progressPercentage,
          is_completed: isCompleted,
          last_watched_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,content_type,content_id,episode_id",
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET - Get user's continue watching list
    if (req.method === "GET") {
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const contentType = url.searchParams.get("content_type");

      let query = supabase
        .from("user_watch_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .order("last_watched_at", { ascending: false })
        .limit(limit);

      if (contentType) {
        query = query.eq("content_type", contentType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch content details for each progress item
      const enrichedData = await Promise.all(
        (data || []).map(async (progress) => {
          let contentDetails = null;
          
          const { data: content } = await supabase
            .from(progress.content_type === "web_series" ? "web_series" : 
                  progress.content_type === "tv_show" ? "tv_shows" : 
                  progress.content_type === "short_movie" ? "short_movies" : "movies")
            .select("id, title, thumbnail_url, genre, language")
            .eq("id", progress.content_id)
            .maybeSingle();
          
          contentDetails = content;

          return {
            ...progress,
            content: contentDetails,
          };
        })
      );

      return new Response(JSON.stringify({ data: enrichedData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE - Remove from continue watching
    if (req.method === "DELETE") {
      const contentId = url.searchParams.get("content_id");
      const contentType = url.searchParams.get("content_type");

      if (!contentId || !contentType) {
        return new Response(
          JSON.stringify({ error: "content_id and content_type are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("user_watch_progress")
        .delete()
        .eq("user_id", userId)
        .eq("content_id", contentId)
        .eq("content_type", contentType);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
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
