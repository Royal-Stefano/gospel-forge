#!/usr/bin/env node

/**
 * =====================================================================
 * GOSPEL FORGE — SUPER ADMIN BOOTSTRAP SCRIPT
 * =====================================================================
 * Usage:
 *   node scripts/bootstrap-super-admin.mjs <admin_email>
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 * =====================================================================
 */

import { createClient } from "@supabase/supabase-js";

const targetEmail = process.argv[2]?.trim().toLowerCase();

if (!targetEmail) {
  console.error("\x1b[31mError: Target user email required.\x1b[0m");
  console.log("Usage: node scripts/bootstrap-super-admin.mjs <admin_email>");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("\x1b[31mError: Missing Supabase environment variables.\x1b[0m");
  console.log("Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment.");
  console.log("\nAlternative SQL query for Supabase SQL Editor:");
  console.log(`
  UPDATE public.profiles
  SET role = 'super_admin', artist_status = 'approved', updated_at = NOW()
  WHERE email = '${targetEmail}';
  `);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function bootstrap() {
  console.log(`\n\x1b[36mBootstrapping Super Admin role for:\x1b[0m ${targetEmail}...`);

  // Query profile
  const { data: profile, error: findError } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, artist_status")
    .eq("email", targetEmail)
    .maybeSingle();

  if (findError) {
    console.error("\x1b[31mDatabase lookup failed:\x1b[0m", findError.message);
    process.exit(1);
  }

  if (!profile) {
    console.error(`\x1b[33mNo profile found for email:\x1b[0m ${targetEmail}`);
    console.log("User must sign up via the application (/signup) before elevation.");
    console.log("\nAlternative: Check auth.users table in Supabase dashboard.");
    process.exit(1);
  }

  // Elevate to super_admin
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      role: "super_admin",
      artist_status: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (updateError) {
    console.error("\x1b[31mElevation failed:\x1b[0m", updateError.message);
    process.exit(1);
  }

  // Record audit log
  await supabase.from("audit_logs").insert({
    user_id: profile.id,
    user_name: profile.display_name || targetEmail,
    user_role: "super_admin",
    action: "BOOTSTRAP_SUPER_ADMIN",
    target_type: "user",
    target_id: profile.id,
    metadata: {
      previousRole: profile.role,
      elevatedBy: "CLI_BOOTSTRAP_SCRIPT",
    },
  });

  console.log(`\x1b[32m✔ User successfully elevated to super_admin:\x1b[0m`);
  console.log(`  User ID: ${profile.id}`);
  console.log(`  Email:   ${targetEmail}`);
  console.log(`  Role:    super_admin`);
  console.log(`  Artist:  approved\n`);
}

bootstrap().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
