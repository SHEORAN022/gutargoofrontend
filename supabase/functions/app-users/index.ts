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
    const userId = pathParts[1]; // /app-users/:id

    // GET - List all users or get single user
    if (req.method === "GET") {
      if (userId) {
        // Get single user by ID
        const { data, error } = await supabase
          .from("app_users")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(
            JSON.stringify({ error: "User not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // List all users with filters
      const status = url.searchParams.get("status");
      const subscriptionPlan = url.searchParams.get("subscription_plan");
      const loginMethod = url.searchParams.get("login_method");
      const search = url.searchParams.get("search");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("app_users")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }
      if (subscriptionPlan) {
        query = query.eq("subscription_plan", subscriptionPlan);
      }
      if (loginMethod) {
        query = query.eq("login_method", loginMethod);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, count, limit, offset }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create new user
    if (req.method === "POST") {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("app_users")
        .insert({
          name: body.name,
          email: body.email,
          phone: body.phone,
          avatar_url: body.avatar_url,
          status: body.status || "active",
          subscription_plan: body.subscription_plan || "free",
          login_method: body.login_method || "email",
          devices_count: body.devices_count || 0,
          total_watch_time: body.total_watch_time || 0,
          notes: body.notes,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "User created successfully" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT - Update user
    if (req.method === "PUT") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      
      const { data, error } = await supabase
        .from("app_users")
        .update({
          name: body.name,
          email: body.email,
          phone: body.phone,
          avatar_url: body.avatar_url,
          status: body.status,
          subscription_plan: body.subscription_plan,
          login_method: body.login_method,
          devices_count: body.devices_count,
          total_watch_time: body.total_watch_time,
          notes: body.notes,
          last_active_at: body.last_active_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "User updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Delete user
    if (req.method === "DELETE") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("app_users")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: "User deleted successfully" }),
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
