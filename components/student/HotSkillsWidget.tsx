import { Badge } from "@/components/ui/badge";

const HOT_SKILLS = [
    "Redis",
    "Docker",
    "Go",
    "TypeScript",
    "GraphQL",
    "Kubernetes",
];

export function HotSkillsWidget() {
    return (
        <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
            <h3 className="mb-4 text-sm font-medium text-gray-400">Hot Skills</h3>

            <div className="flex flex-wrap gap-2">
                {HOT_SKILLS.map((skill) => (
                    <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-zinc-800 text-gray-300 hover:bg-cyan-400/10 hover:text-cyan-400 hover:border-cyan-400/30 transition-all cursor-pointer"
                    >
                        {skill}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
