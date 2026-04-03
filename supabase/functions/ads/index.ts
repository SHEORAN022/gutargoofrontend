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
    const pathParts = url.pathname.split("/").filter(Boolean);
    const adId = pathParts[1]; // /ads/:id

    // GET - List all ads or get single ad
    if (req.method === "GET") {
      if (adId) {
        // Get single ad by ID
        const { data, error } = await supabase
          .from("ads_settings")
          .select("*")
          .eq("id", adId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Ad setting not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // List all ads with filters
      const placement = url.searchParams.get("placement");
      const provider = url.searchParams.get("provider");
      const adType = url.searchParams.get("ad_type");
      const isEnabled = url.searchParams.get("is_enabled");

      let query = supabase
        .from("ads_settings")
        .select("*")
        .order("placement", { ascending: true });

      if (placement) {
        query = query.eq("placement", placement);
      }
      if (provider) {
        query = query.eq("provider", provider);
      }
      if (adType) {
        query = query.eq("ad_type", adType);
      }
      if (isEnabled !== null) {
        query = query.eq("is_enabled", isEnabled === "true");
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, count: data?.length || 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create new ad setting
    if (req.method === "POST") {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("ads_settings")
        .insert({
          placement: body.placement,
          provider: body.provider || "google",
          ad_type: body.ad_type,
          ad_unit_id: body.ad_unit_id,
          app_id: body.app_id,
          is_enabled: body.is_enabled ?? false,
          frequency_cap: body.frequency_cap,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Ad setting created successfully" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT - Update ad setting
    if (req.method === "PUT") {
      if (!adId) {
        return new Response(
          JSON.stringify({ error: "Ad ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      
      const { data, error } = await supabase
        .from("ads_settings")
        .update({
          placement: body.placement,
          provider: body.provider,
          ad_type: body.ad_type,
          ad_unit_id: body.ad_unit_id,
          app_id: body.app_id,
          is_enabled: body.is_enabled,
          frequency_cap: body.frequency_cap,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Ad setting updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Delete ad setting
    if (req.method === "DELETE") {
      if (!adId) {
        return new Response(
          JSON.stringify({ error: "Ad ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("ads_settings")
        .delete()
        .eq("id", adId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: "Ad setting deleted successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
