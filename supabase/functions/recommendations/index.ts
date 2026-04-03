import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentItem {
  id: string;
  title: string;
  genre: string;
  language: string;
  thumbnail_url?: string;
  rating?: string;
  views?: number;
  created_at: string;
  content_type: string;
  score?: number;
}

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
      const userId = url.searchParams.get("user_id");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const contentType = url.searchParams.get("type"); // movies, web_series, tv_shows, short_movies

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "user_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get user's watch history
      const { data: watchHistory, error: watchError } = await supabase
        .from("user_watch_progress")
        .select("content_type, content_id, progress_percentage, is_completed")
        .eq("user_id", userId)
        .order("last_watched_at", { ascending: false })
        .limit(50);

      if (watchError) {
        console.error("Error fetching watch history:", watchError);
      }

      // Get watched content IDs to exclude
      const watchedIds = new Set((watchHistory || []).map(w => w.content_id));

      // Analyze preferences from watch history
      const genreScores: Record<string, number> = {};
      const languageScores: Record<string, number> = {};
      const contentTypeScores: Record<string, number> = {};

      // Fetch details of watched content to analyze preferences
      const contentTypes = ["movies", "web_series", "tv_shows", "short_movies"];
      
      for (const type of contentTypes) {
        const watchedOfType = (watchHistory || [])
          .filter(w => w.content_type === type)
          .map(w => w.content_id);

        if (watchedOfType.length > 0) {
          const { data: content } = await supabase
            .from(type)
            .select("id, genre, language")
            .in("id", watchedOfType);

          (content || []).forEach((item: { id: string; genre: string; language: string }) => {
            const watchItem = (watchHistory || []).find(w => w.content_id === item.id);
            const weight = watchItem?.is_completed ? 2 : (watchItem?.progress_percentage || 0) > 50 ? 1.5 : 1;

            genreScores[item.genre] = (genreScores[item.genre] || 0) + weight;
            languageScores[item.language] = (languageScores[item.language] || 0) + weight;
            contentTypeScores[type] = (contentTypeScores[type] || 0) + weight;
          });
        }
      }

      // Get top preferences
      const topGenres = Object.entries(genreScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);
      
      const topLanguages = Object.entries(languageScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([lang]) => lang);

      // Fetch recommendations
      const recommendations: ContentItem[] = [];
      const typesToQuery = contentType ? [contentType] : contentTypes;

      for (const type of typesToQuery) {
        let query = supabase
          .from(type)
          .select("id, title, genre, language, thumbnail_url, rating, views, created_at")
          .eq("status", "published")
          .order("views", { ascending: false })
          .limit(Math.ceil(limit / typesToQuery.length) + 10);

        // Prefer user's favorite genres if available
        if (topGenres.length > 0) {
          query = query.in("genre", topGenres);
        }

        const { data: content, error } = await query;

        if (error) {
          console.error(`Error fetching ${type}:`, error);
          continue;
        }

        // Score and filter recommendations
        (content || []).forEach((item) => {
          if (watchedIds.has(item.id)) return; // Skip already watched

          let score = 0;
          
          // Genre match bonus
          if (topGenres.includes(item.genre)) {
            score += 10 * (topGenres.indexOf(item.genre) === 0 ? 1.5 : 1);
          }
          
          // Language match bonus
          if (topLanguages.includes(item.language)) {
            score += 5 * (topLanguages.indexOf(item.language) === 0 ? 1.5 : 1);
          }
          
          // Content type preference bonus
          const typeWeight = contentTypeScores[type] || 0;
          score += typeWeight * 2;
          
          // Popularity bonus (normalized)
          score += Math.min((item.views || 0) / 1000, 5);
          
          // Recency bonus
          const ageInDays = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
          if (ageInDays < 30) score += 3;
          else if (ageInDays < 90) score += 1;

          recommendations.push({
            id: item.id,
            title: item.title,
            genre: item.genre,
            language: item.language,
            thumbnail_url: item.thumbnail_url,
            rating: item.rating,
            views: item.views,
            created_at: item.created_at,
            content_type: type,
            score,
          });
        });
      }

      // Sort by score and limit
      recommendations.sort((a, b) => (b.score || 0) - (a.score || 0));
      const finalRecommendations = recommendations.slice(0, limit);

      // Group by reason
      const forYou = finalRecommendations.filter(r => (r.score || 0) > 10);
      const trending = finalRecommendations.filter(r => (r.views || 0) > 500);
      const newReleases = finalRecommendations.filter(r => {
        const ageInDays = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return ageInDays < 30;
      });

      return new Response(
        JSON.stringify({
          user_id: userId,
          preferences: {
            top_genres: topGenres,
            top_languages: topLanguages,
            watch_history_count: (watchHistory || []).length,
          },
          recommendations: finalRecommendations.map(({ score, ...rest }) => rest),
          sections: {
            for_you: forYou.slice(0, 10).map(({ score, ...rest }) => rest),
            trending: trending.slice(0, 10).map(({ score, ...rest }) => rest),
            new_releases: newReleases.slice(0, 10).map(({ score, ...rest }) => rest),
          },
          total_count: finalRecommendations.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Recommendations error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
