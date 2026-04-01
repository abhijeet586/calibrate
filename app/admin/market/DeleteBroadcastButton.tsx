"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteBroadcast } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface DeleteBroadcastButtonProps {
    id: string;
}

export default function DeleteBroadcastButton({ id }: DeleteBroadcastButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!window.confirm("Delete this broadcast?")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteBroadcast(id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to delete broadcast");
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
            title="Delete Broadcast"
        >
            {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </button>
    );
}
