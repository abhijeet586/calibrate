"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    BookOpen,
    Target,
    FileText,
    BarChart,
    Users,
    CheckSquare,
    Crosshair,
    LogOut,
    type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
    student: [
        { href: "/student/feed", label: "Market Feed", icon: LayoutDashboard },
        { href: "/student/roadmap", label: "My Roadmap", icon: BookOpen },
        { href: "/student/progress", label: "Skill Gap Analysis", icon: Target },
        { href: "/student/saved", label: "Target Roles", icon: Crosshair },
    ],
    admin: [
        { href: "/admin", label: "Overview", icon: BarChart },
        { href: "/admin/posts", label: "Posts", icon: FileText },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart },
    ],
    mentor: [
        { href: "/mentor", label: "Dashboard", icon: Users },
        { href: "/mentor/verify", label: "Verify Skills", icon: CheckSquare },
    ],
};

export function Sidebar({ role }: { role: "student" | "admin" | "mentor" }) {
    const pathname = usePathname();

    const items = NAV_ITEMS[role] || [];

    return (
        <div className="w-52 h-full bg-[#0a0a0a] border-r border-white/10 flex flex-col">
            {/* Top Section */}
            <div className="p-6 flex-1">
                {/* Logo - Clickable to go to landing page */}
                <Link href="/" className="mb-8 block hover:opacity-80 transition-opacity">
                    <div className="text-xl font-bold text-white">
                        Cali<span className="text-cyan-400">brate</span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom User Profile Section */}
            <div className="p-4 border-t border-white/10 bg-black/40">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-black font-bold text-xs ring-2 ring-white/10">
                        AS
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Abhijeet Senapati</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
