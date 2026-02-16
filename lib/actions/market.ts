'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMarketUpdate(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const content = formData.get('content') as string

    const { error } = await supabase.from('market_updates').insert({
        title,
        content,
    })

    if (error) {
        // For now, satisfy TS by returning void (redirect throws, so it works, or we just return)
        // In a real app, we'd pass error back to client component
        console.error(error)
        return
    }

    revalidatePath('/dashboard/student/feed')
    revalidatePath('/dashboard/admin/posts')
    redirect('/dashboard/admin/posts')
}
