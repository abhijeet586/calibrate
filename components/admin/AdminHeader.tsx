"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminHeader() {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-zinc-800 bg-zinc-950/95 px-6 backdrop-blur">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                        type="search"
                        placeholder="Search students, mentors, tracks..."
                        className="border-zinc-800 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500 focus:border-cyan-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
                    <Bell className="size-5 text-white" />
                </Button>
            </div>
        </header>
    );
}
