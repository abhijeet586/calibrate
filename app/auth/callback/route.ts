import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Check if profile exists, create if not
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, role')
                .eq('id', data.user.id)
                .single();

            let userRole = 'student';

            if (!existingProfile) {
                // Create profile for new Google user with default role "student"
                await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: data.user.email,
                        full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
                        role: 'student',
                    });
            } else {
                userRole = existingProfile.role || 'student';
            }

            // Redirect based on role
            let redirectPath = '/student/feed';
            if (userRole === 'mentor') {
                redirectPath = '/mentor';
            } else if (userRole === 'admin') {
                redirectPath = '/admin';
            }

            return NextResponse.redirect(`${origin}${redirectPath}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
