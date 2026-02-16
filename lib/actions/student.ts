'use server'

import { createClient } from '@/lib/supabase/server'

export async function verifySkill(studentId: string, skillId: string) {
    const supabase = await createClient()
    // Verification logic
}
