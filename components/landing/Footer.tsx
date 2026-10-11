import Link from "next/link";
import { Twitter, Github, Linkedin, Mail, type LucideIcon } from "lucide-react";

interface SocialLink {
    icon: LucideIcon;
    href: string;
    label: string;
}

const SOCIAL_LINKS: SocialLink[] = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
];

interface FooterColumn {
    title: string;
    links: { label: string; href: string }[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
    {
        title: "Product",
        links: [
            { label: "Features", href: "#" },
            { label: "Pricing", href: "#" },
            { label: "Roadmaps", href: "#" },
            { label: "Changelog", href: "#" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Contact", href: "#" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Documentation", href: "#" },
            { label: "Help Center", href: "#" },
            { label: "Community", href: "#" },
            { label: "Partners", href: "#" },
        ],
    },
];

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Calibrate</h3>
                        <p className="text-sm text-gray-400">
                            Bridging the gap between education and employment with real-time market intelligence.
                        </p>
                        <div className="flex gap-3">
                            {SOCIAL_LINKS.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="rounded-lg bg-white/5 p-2 hover:bg-white/10 transition-colors"
                                        aria-label={social.label}
                                    >
                                        <Icon className="h-4 w-4 text-gray-400" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Columns */}
                    {FOOTER_COLUMNS.map((column) => (
                        <div key={column.title}>
                            <h4 className="mb-4 font-semibold text-white">{column.title}</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="hover:text-cyan-400 transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-gray-400 md:flex-row">
                    <p>© 2026 Calibrate. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
