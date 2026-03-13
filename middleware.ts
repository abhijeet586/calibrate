import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Define which roles are allowed on which route prefixes
const ROLE_ROUTE_MAP: Record<string, string> = {
    student: "/student",
    mentor: "/mentor",
    admin: "/admin",
    cdc_admin: "/admin",
};

// Where to redirect each role when they hit an unauthorized route
const ROLE_HOME_MAP: Record<string, string> = {
    student: "/student/feed",
    mentor: "/mentor",
    admin: "/admin",
    cdc_admin: "/admin",
};

export async function middleware(request: NextRequest) {
    const { response, user, supabase } = await updateSession(request);

    const pathname = request.nextUrl.pathname;

    // Only enforce RBAC on protected route prefixes
    const isProtectedRoute =
        pathname.startsWith("/student") ||
        pathname.startsWith("/mentor") ||
        pathname.startsWith("/admin");

    if (!isProtectedRoute) {
        return response;
    }

    // ─── 1. Session Check ───
    // If no active session, redirect to login
    if (!user) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ─── 2. Role Retrieval ───
    // Fetch the user's role from the public.users table
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (userError || !userData) {
        console.error("RBAC Middleware: Failed to fetch user role", userError);
        // If we can't determine the role, redirect to login as a safety measure
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const userRole = userData.role as string; // 'student' | 'mentor' | 'admin' | 'cdc_admin'

    // ─── 3. Route Protection Rules ───
    // Check if the current path belongs to the user's allowed route prefix
    const allowedPrefix = ROLE_ROUTE_MAP[userRole];

    if (allowedPrefix && pathname.startsWith(allowedPrefix)) {
        // User is accessing their own section — allow
        return response;
    }

    // User is accessing a section they don't own — redirect to their home
    const redirectHome = ROLE_HOME_MAP[userRole] || "/auth/login";
    console.warn(
        `RBAC Redirect: User ${user.id} (role: ${userRole}) tried to access ${pathname} → redirecting to ${redirectHome}`
    );

    return NextResponse.redirect(new URL(redirectHome, request.url));
}

export const config = {
    matcher: [
        // Match protected dashboard routes
        "/student/:path*",
        "/mentor/:path*",
        "/admin/:path*",
    ],
};
