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
    LogOut
} from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

export function Sidebar({ role }: { role: "student" | "admin" | "mentor" }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="w-52 h-full bg-[#0a0a0a] border-r border-white/10 flex flex-col">
            {/* Top Section */}
            <div className="p-6 flex-1">
                {/* Logo - Clickable to go to landing page */}
                <Link href="/" className="mb-8 block hover:opacity-80 transition-opacity">
                    <div className="text-xl font-bold text-white">
                        Market<span className="text-cyan-400">Ready</span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="space-y-1">
                    {role === "student" && (
                        <>
                            <Link
                                href="/student/feed"
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive("/student/feed")
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <LayoutDashboard size={18} />
                                <span>Market Feed</span>
                            </Link>
                            <Link
                                href="/student/roadmap"
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive("/student/roadmap")
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <BookOpen size={18} />
                                <span>My Roadmap</span>
                            </Link>
                            <Link
                                href="/student/progress"
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive("/student/progress")
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Target size={18} />
                                <span>Skill Gap Analysis</span>
                            </Link>
                            <Link
                                href="/student/saved"
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive("/student/saved")
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Crosshair size={18} />
                                <span>Target Roles</span>
                            </Link>
                        </>
                    )}

                    {role === "admin" && (
                        <>
                            <Link
                                href="/admin"
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive("/admin")
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <BarChart size={18} />
                                <span>Overview</span>
                            </Link>
                            <Link
                                href="/admin/posts"
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive("/admin/posts")
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <FileText size={18} />
                                <span>Posts</span>
                            </Link>
                            <Link
                                href="/admin/analytics"
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive("/admin/analytics")
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <BarChart size={18} />
                                <span>Analytics</span>
                            </Link>
                        </>
                    )}

                    {role === "mentor" && (
                        <>
                            <Link
                                href="/mentor"
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive("/mentor")
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Users size={18} />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                href="/mentor/verify"
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive("/mentor/verify")
                                    ? "bg-cyan-400/10 text-cyan-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <CheckSquare size={18} />
                                <span>Verify Skills</span>
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            {/* Bottom User Profile Section */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-black font-semibold">
                        PR
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Pratyush Raj</p>
                        <p className="text-xs text-gray-400 capitalize">{role}</p>
                    </div>
                </div>
                <form action={logout}>
                    <button
                        type="submit"
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
