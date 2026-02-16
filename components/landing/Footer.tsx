import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">MarketReady</h3>
                        <p className="text-sm text-gray-400">
                            Bridging the gap between education and employment with real-time market intelligence.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="rounded-lg bg-white/5 p-2 hover:bg-white/10 transition-colors">
                                <Twitter className="h-4 w-4 text-gray-400" />
                            </a>
                            <a href="#" className="rounded-lg bg-white/5 p-2 hover:bg-white/10 transition-colors">
                                <Github className="h-4 w-4 text-gray-400" />
                            </a>
                            <a href="#" className="rounded-lg bg-white/5 p-2 hover:bg-white/10 transition-colors">
                                <Linkedin className="h-4 w-4 text-gray-400" />
                            </a>
                            <a href="#" className="rounded-lg bg-white/5 p-2 hover:bg-white/10 transition-colors">
                                <Mail className="h-4 w-4 text-gray-400" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="mb-4 font-semibold text-white">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Roadmaps</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="mb-4 font-semibold text-white">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="mb-4 font-semibold text-white">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Community</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Partners</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-gray-400 md:flex-row">
                    <p>© 2026 MarketReady. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
