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
    const planId = pathParts[1]; // /subscriptions/:id

    // GET - List all plans or get single plan
    if (req.method === "GET") {
      if (planId) {
        // Get single plan by ID
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", planId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Plan not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // List all plans with filters
      const isActive = url.searchParams.get("is_active");
      const duration = url.searchParams.get("duration");

      let query = supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (isActive !== null) {
        query = query.eq("is_active", isActive === "true");
      }
      if (duration) {
        query = query.eq("duration", duration);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, count: data?.length || 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create new plan
    if (req.method === "POST") {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("subscription_plans")
        .insert({
          name: body.name,
          price: body.price,
          duration: body.duration,
          features: body.features || [],
          max_devices: body.max_devices || 1,
          max_downloads: body.max_downloads,
          has_ads: body.has_ads ?? true,
          quality: body.quality || "HD",
          is_active: body.is_active ?? true,
          sort_order: body.sort_order || 0,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Subscription plan created successfully" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT - Update plan
    if (req.method === "PUT") {
      if (!planId) {
        return new Response(
          JSON.stringify({ error: "Plan ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      
      const { data, error } = await supabase
        .from("subscription_plans")
        .update({
          name: body.name,
          price: body.price,
          duration: body.duration,
          features: body.features,
          max_devices: body.max_devices,
          max_downloads: body.max_downloads,
          has_ads: body.has_ads,
          quality: body.quality,
          is_active: body.is_active,
          sort_order: body.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", planId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Subscription plan updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Delete plan
    if (req.method === "DELETE") {
      if (!planId) {
        return new Response(
          JSON.stringify({ error: "Plan ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: "Subscription plan deleted successfully" }),
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
