import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
    const { response, user, supabase } = await updateSession(request);

    // Protected routes pattern
    if (request.nextUrl.pathname.startsWith("/student") ||
        request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/mentor")) {

        if (!user) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }

        // Role-based access control (RBAC) logic here
        // Verify user role matches the path
        // For now, we just ensure they are logged in
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
