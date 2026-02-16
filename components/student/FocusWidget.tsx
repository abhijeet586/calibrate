"use client";

import { useState } from "react";

const FOCUS_ITEMS = [
    { id: 1, text: "Learn Server Actions (Next.js)", completed: false },
    { id: 2, text: "Postgres Indexing", completed: false },
];

export function FocusWidget() {
    const [items, setItems] = useState(FOCUS_ITEMS);

    const toggleItem = (id: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    return (
        <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
            <h3 className="mb-4 text-sm font-medium text-gray-400">Critical Skill Gaps</h3>

            <div className="space-y-3">
                {items.map((item) => (
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
                ))}
            </div>
        </div>
    );
}
