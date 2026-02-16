"use client";

import { Shell } from "@/components/dashboard/Shell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardClientWrapper({
    children,
    hasSupabaseUser,
    supabaseRole,
}: {
    children: React.ReactNode;
    hasSupabaseUser: boolean;
    supabaseRole: string | null;
}) {
    const router = useRouter();
    const [role, setRole] = useState<string>(supabaseRole || "student");
    const [isAuthenticated, setIsAuthenticated] = useState(hasSupabaseUser);

    useEffect(() => {
        // Check for Firebase user in localStorage
        const firebaseUserStr = localStorage.getItem('firebase_user');

        if (!hasSupabaseUser && !firebaseUserStr) {
            router.push('/auth/login');
            return;
        }

        if (firebaseUserStr && !hasSupabaseUser) {
            const firebaseUser = JSON.parse(firebaseUserStr);
            setIsAuthenticated(true);
            // Role is already set to student by default
        }
    }, [hasSupabaseUser, router]);

    if (!isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-600">Loading...</div>
        </div>;
    }

    return <Shell role={role}>{children}</Shell>;
}
