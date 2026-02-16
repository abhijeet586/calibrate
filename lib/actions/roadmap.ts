'use server'

import { createClient } from '@/lib/supabase/server'

export async function getRoadmap(studentId: string) {
    const supabase = await createClient()
    // Fetch roadmap logic
}

export async function updateProgress(stepId: string, status: string) {
    const supabase = await createClient()
    // Update logic
}
