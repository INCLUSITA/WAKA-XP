import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Create user
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: "super@waka.money",
    password: "super@waka.money",
    email_confirm: true,
  });

  if (userError && !userError.message.includes("already been registered")) {
    return new Response(JSON.stringify({ error: userError.message }), { status: 400 });
  }

  // Get user id
  let userId = userData?.user?.id;
  if (!userId) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const user = list?.users?.find(u => u.email === "super@waka.money");
    userId = user?.id;
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  // Assign admin role
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

  // Link to demo tenant
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, tenant_id: "00000000-0000-0000-0000-000000000001" }, { onConflict: "id" });

  return new Response(JSON.stringify({ 
    success: true, userId,
    roleError: roleError?.message,
    profileError: profileError?.message 
  }));
});
