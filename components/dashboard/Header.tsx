"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";

export function Header() {
    return (
        <header className="h-16 border-b border-white/10 bg-[#0a0a0a] px-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>

            <form action={logout}>
                <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:text-white hover:shadow-[0_0_15px_rgba(248,113,113,0.3)] transition-all border border-white/20 hover:border-red-400/40"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </form>
        </header>
    );
}
