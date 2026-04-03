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
    const categoryId = pathParts[1]; // /categories/:id

    // GET - List all categories or get single category
    if (req.method === "GET") {
      if (categoryId) {
        // Get single category by ID
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("id", categoryId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Category not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // List all categories with filters
      const isActive = url.searchParams.get("is_active");
      const parentId = url.searchParams.get("parent_id");
      const slug = url.searchParams.get("slug");

      let query = supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (isActive !== null) {
        query = query.eq("is_active", isActive === "true");
      }
      if (parentId) {
        query = query.eq("parent_id", parentId);
      }
      if (slug) {
        query = query.eq("slug", slug);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, count: data?.length || 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create new category
    if (req.method === "POST") {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: body.name,
          slug: body.slug,
          description: body.description,
          icon: body.icon,
          parent_id: body.parent_id || null,
          is_active: body.is_active ?? true,
          sort_order: body.sort_order || 0,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Category created successfully" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT - Update category
    if (req.method === "PUT") {
      if (!categoryId) {
        return new Response(
          JSON.stringify({ error: "Category ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: body.name,
          slug: body.slug,
          description: body.description,
          icon: body.icon,
          parent_id: body.parent_id,
          is_active: body.is_active,
          sort_order: body.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", categoryId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data, message: "Category updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Delete category
    if (req.method === "DELETE") {
      if (!categoryId) {
        return new Response(
          JSON.stringify({ error: "Category ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: "Category deleted successfully" }),
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
