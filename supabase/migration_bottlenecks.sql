-- =============================================================================
-- Migration: Verification Bottlenecks Support
-- Run this in the Supabase SQL Editor
-- =============================================================================

-- 1. Add assigned_mentor_id column to student_progress
ALTER TABLE public.student_progress
ADD COLUMN IF NOT EXISTS assigned_mentor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create index for faster lookups on pending + assigned queries
CREATE INDEX IF NOT EXISTS idx_student_progress_assigned_mentor
ON public.student_progress (assigned_mentor_id)
WHERE status = 'pending';

-- 3. Create the RPC function for aggregating bottleneck data per track
CREATE OR REPLACE FUNCTION get_track_bottlenecks()
RETURNS TABLE (
    track_id uuid,
    track_name text,
    pending_count bigint,
    overloaded boolean
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        tr.id AS track_id,
        tr.name AS track_name,
        COUNT(sp.id) AS pending_count,
        COUNT(sp.id) > 20 AS overloaded
    FROM public.target_roles tr
    LEFT JOIN public.roadmap_items ri ON ri.target_role_id = tr.id
    LEFT JOIN public.student_progress sp ON sp.roadmap_item_id = ri.id AND sp.status = 'pending'
    GROUP BY tr.id, tr.name
    ORDER BY pending_count DESC;
$$;
