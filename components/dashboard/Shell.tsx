import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Shell({
    role,
    children,
}: {
    role: "student" | "admin" | "mentor";
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#050505] overflow-hidden">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
