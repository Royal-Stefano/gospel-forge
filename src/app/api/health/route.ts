import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const startTime = Date.now();
  const uptimeSeconds = process.uptime();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const r2Bucket = process.env.R2_BUCKET_NAME;

  let dbStatus = "unconfigured";
  if (supabaseUrl) {
    try {
      const admin = getSupabaseAdminClient();
      if (admin) {
        const { error } = await admin
          .from("profiles")
          .select("id")
          .limit(1);
        dbStatus = error ? `degraded: ${error.message}` : "healthy";
      }
    } catch (err: any) {
      dbStatus = `unreachable: ${err.message}`;
    }
  }

  const isR2Configured = Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );

  const memUsage = process.memoryUsage();

  return NextResponse.json(
    {
      status: "healthy",
      service: "gospel-forge",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(uptimeSeconds),
      latencyMs: Date.now() - startTime,
      environment: process.env.NODE_ENV || "production",
      database: {
        status: dbStatus,
        provider: "supabase-postgresql",
      },
      storage: {
        configured: isR2Configured,
        bucket: r2Bucket || "gospel-forge-media",
        provider: "cloudflare-r2",
      },
      system: {
        nodeVersion: process.version,
        rssMb: Math.round(memUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
