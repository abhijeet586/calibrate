"use client";

import { useState } from "react";

export interface FocusItem {
    id: string | number;
    text: string;
    completed: boolean;
}

export function FocusWidget({ items = [] }: { items?: FocusItem[] }) {
    const [localItems, setLocalItems] = useState<FocusItem[]>(items);

    // Sync state if props change (useful for initial load)
    // Note: useEffect can be added later if dynamic syncing is fully needed, but useState init is fine for initial render.

    const toggleItem = (id: string | number) => {
        setLocalItems(localItems.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    return (
        <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
            <h3 className="mb-4 text-sm font-medium text-gray-400">Critical Skill Gaps</h3>

            <div className="space-y-3">
                {localItems.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">No critical gaps identified right now. You are doing great!</p>
                ) : (
                    localItems.map((item) => (
                        <label
                            key={item.id}
                            className="flex items-start gap-3 cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => toggleItem(item.id)}
                                className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-zinc-800 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0"
                            />
                            <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-300'} group-hover:text-white transition-colors`}>
                                {item.text}
                            </span>
                        </label>
                    ))
                )}
            </div>
        </div>
    );
}
