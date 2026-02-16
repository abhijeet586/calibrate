"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Users, Radio, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

const navigationItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
    },
    {
        title: "Career Tracks",
        icon: Layers,
        href: "/admin/tracks",
    },
    {
        title: "Track Ops",
        icon: Users,
        href: "/admin/track-ops",
    },
    {
        title: "Market Intelligence",
        icon: Radio,
        href: "/admin/market",
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950">
            {/* Header */}
            <div className="border-b border-zinc-800 p-4">
                <div className="flex items-center gap-3">
                    <div>
                        <Link href="/">
                            <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="text-white">Market</span>
                                <span className="text-cyan-400">Ready</span>
                            </h1>
                        </Link>
                        <p className="text-xs text-zinc-500">CDC Command Center</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                <p className="mb-2 px-3 text-xs font-medium text-zinc-400">Navigation</p>
                {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive
                                ? "bg-cyan-500/10 text-cyan-400"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                }`}
                        >
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Profile Section */}
            <div className="border-t border-zinc-800 p-4">
                <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-black">
                        A
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white">Admin User</p>
                        <p className="text-xs text-zinc-500">CDC Coordinator</p>
                    </div>
                </div>
                <form action={logout}>
                    <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut className="mr-2 size-4" />
                        Logout
                    </Button>
                </form>
            </div>
        </div>
    );
}
