"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, PenTool, ShieldCheck, Home } from "lucide-react";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Writing Agent", href: "/writing-agent", icon: PenTool },
    { name: "Branding Agent", href: "/branding-agent", icon: ShieldCheck },
];


export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/40 border border-white/5 backdrop-blur-3xl px-6 py-3 rounded-3xl shadow-2xl flex items-center space-x-2 md:space-x-8">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${isActive ? "text-white" : "text-slate-500 hover:text-slate-200"
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="nav-bg"
                                className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <item.icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : ""}`} />
                        <span className="hidden md:inline">{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
