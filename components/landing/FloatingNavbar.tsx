'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function FloatingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 120);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed inset-x-0 top-0 z-[80] px-5 pt-4 md:px-20 md:pt-6">
            <div className="mx-auto max-w-6xl">
                <nav
                    className={`flex items-center justify-between rounded-full border px-4 py-3  backdrop-blur transition-all duration-500 md:px-7 ${
                        isScrolled
                            ? 'border-[#ddccbd] bg-[#f7efe7]/92 text-[#201611]'
                            : 'border-white/12 bg-[#120c09]/52 text-white'
                    }`}
                >
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-white p-2">
                            <Image src="/favicon.ico" alt="Firsthash logo" fill className="object-contain p-2" />
                        </div>
                        <div className="hidden sm:block">
                            <p className={`text-sm font-semibold uppercase tracking-[0.28em] transition-colors duration-500 ${isScrolled ? 'text-[#2f221a]' : 'text-white/78'}`}>
                                IPC STUDIOS
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className={`inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium transition duration-500 ${
                                isScrolled
                                    ? 'border-[#cfb8a4] text-[#2f221a] hover:bg-[#efe2d6]'
                                    : 'border-white/15 text-white hover:bg-white/10'
                            }`}
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition duration-500 ${
                                isScrolled
                                    ? 'bg-[#1d130d] text-white hover:bg-[#3a2a21]'
                                    : 'bg-white text-[#1d130d] hover:bg-[#ffe9d5]'
                            }`}
                        >
                            Sign up
                        </Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}
