-- =====================================================================
-- GOSPEL FORGE — MIGRATION 20261024000003: SHARED RATE LIMITING
-- =====================================================================
-- Provides database-backed distributed rate limiting for multi-process
-- Node.js runtimes (PM2 cluster mode, container replicas, Hostinger Cloud).
-- Eliminates process-local rate limit bypass across worker threads.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    reset_at TIMESTAMPTZ NOT NULL
);

-- Enable RLS (Service role only access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public direct access to rate limits table
CREATE POLICY "Service role only access to rate_limits"
    ON public.rate_limits
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Index for efficient cleanup of expired buckets
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON public.rate_limits (reset_at);

-- Atomic rate limit checker function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key TEXT,
    p_max INTEGER,
    p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_now TIMESTAMPTZ := clock_timestamp();
    v_record RECORD;
    v_new_count INTEGER;
    v_reset_at TIMESTAMPTZ;
    v_allowed BOOLEAN;
    v_remaining INTEGER;
    v_reset_seconds INTEGER;
BEGIN
    -- Clear expired key if present
    DELETE FROM public.rate_limits
    WHERE key = p_key AND reset_at <= v_now;

    -- Upsert key bucket
    INSERT INTO public.rate_limits (key, count, reset_at)
    VALUES (p_key, 1, v_now + (p_window_seconds || ' seconds')::INTERVAL)
    ON CONFLICT (key) DO UPDATE
    SET count = public.rate_limits.count + 1
    RETURNING count, reset_at INTO v_record;

    v_new_count := v_record.count;
    v_reset_at := v_record.reset_at;
    v_reset_seconds := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_reset_at - v_now)))::INTEGER);

    IF v_new_count > p_max THEN
        v_allowed := FALSE;
        v_remaining := 0;
    ELSE
        v_allowed := TRUE;
        v_remaining := p_max - v_new_count;
    END IF;

    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'remaining', v_remaining,
        'resetSeconds', v_reset_seconds
    );
END;
$$;
