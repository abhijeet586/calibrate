"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="text-2xl font-bold">
                    <span className="text-white">Cali</span>
                    <span className="text-cyan-400">brate</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link href="/auth/login">
                        <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                            Login
                        </Button>
                    </Link>
                    <Link href="/auth/register">
                        <Button className="bg-cyan-400 text-black hover:bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
