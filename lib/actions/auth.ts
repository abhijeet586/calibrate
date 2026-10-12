'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        const message = error.message.includes('Invalid login credentials')
            ? 'Account does not exist or wrong credentials'
            : error.message;
        return redirect(`/auth/login?message=${encodeURIComponent(message)}`)
    }

    // Get user role from profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

    const role = profile?.role || 'student';

    // Ensure user row exists in public.users so RBAC middleware permits routing
    await supabase.from('users').upsert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0],
        role: role,
    });

    // Redirect based on role
    if (role === 'mentor') {
        redirect('/mentor')
    } else if (role === 'admin' || role === 'cdc_admin') {
        redirect('/admin')
    } else {
        redirect('/student/feed')
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return redirect(`/auth/login?message=${encodeURIComponent(error.message)}`)
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = 'student'

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        return redirect(`/auth/register?message=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
        // Create profile (upsert so it doesn't clash with DB triggers)
        await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: role,
            });

        // Also ensure entry in users table
        await supabase
            .from('users')
            .upsert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: role,
            });
    }

    if (data.session) {
        return redirect('/student/roles');
    }

    // Try explicit sign in to establish session cookies
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (!signInError) {
        return redirect('/student/roles');
    }

    if (signInError.message.toLowerCase().includes('not confirmed')) {
        return redirect('/auth/login?message=' + encodeURIComponent('Registration successful! Please check your email inbox to confirm your account, or disable "Confirm email" in Supabase settings.'));
    }

    return redirect('/auth/login?message=' + encodeURIComponent(signInError.message));
}
