import Image from 'next/image';
import Link from 'next/link';
import { FiGithub, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import { footerSections } from './landing-data';

export default function LandingFooter() {
    return (
        <footer className="relative px-4 pb-10 md:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
                <div className="relative z-10 overflow-hidden rounded-[2.6rem] border border-[#ebe2d8] bg-white text-[#1f1814] shadow-[0_20px_60px_rgba(73,45,29,0.08)]">
                    <div className="grid gap-10 px-8 py-10 md:px-10 md:py-12 xl:grid-cols-[1.05fr_0.95fr]">
                        <div>
                            <div className="flex items-center gap-4">
                                <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white p-2">
                                    <Image src="/favicon.ico" alt="Firsthash logo" fill className="object-contain p-2" />
                                </div>
                                <div>
                                    <p className="text-xl font-semibold text-[#1f1814]">IPC</p>
                                    <p className="mt-1 text-sm text-[#6f655f]">Premium workflow platform for modern creative and SaaS teams.</p>
                                </div>
                            </div>

                            <p className="mt-8 max-w-xl text-lg leading-9 text-[#6b625d]">
                                IPC helps teams turn ideas into clear execution with a premium experience that feels reliable, structured, and simple to use.
                            </p>

                        <div className="mt-8 flex items-center gap-4 text-[#1f1814]">
                            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8ddd2] text-lg transition hover:bg-[#f7f1eb]">
                                <FaXTwitter className="h-5 w-5" />
                            </Link>
                            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8ddd2] text-lg transition hover:bg-[#f7f1eb]">
                                <FiLinkedin className="h-5 w-5" />
                            </Link>
                            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8ddd2] text-lg transition hover:bg-[#f7f1eb]">
                                <FiInstagram className="h-5 w-5" />
                            </Link>
                            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8ddd2] text-lg transition hover:bg-[#f7f1eb]">
                                <FiGithub className="h-5 w-5" />
                            </Link>
                        </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-3">
                            {footerSections.map((section) => (
                                <div key={section.title} className="p-2">
                                    <p className="text-lg font-semibold text-[#1f1814]">{section.title}</p>
                                    <div className="mt-5 space-y-3">
                                        {section.links.map((link) => (
                                            <Link key={link.label} href={link.href} className="block text-base text-[#6f655f] transition hover:text-[#1f1814]">
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col gap-4 border-t border-[#eee5dc] px-8 py-8 text-sm text-[#7a7068] md:flex-row md:items-center md:justify-between md:px-10 md:py-9">
                        <p>© 2026 IPC. All rights reserved.</p>
                        <div className="flex flex-wrap items-center gap-5">
                            <Link href="/" className="transition hover:text-[#1f1814]">
                                Privacy Policy
                            </Link>
                            <Link href="/" className="transition hover:text-[#1f1814]">
                                Terms
                            </Link>
                            <Link href="/" className="transition hover:text-[#1f1814]">
                                Cookies Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-4 max-w-[1680px]">
                <div
                    className="relative overflow-hidden rounded-[2.6rem]"
                    style={{
                        height: 'clamp(160px, 20vw, 340px)',
                        background: 'linear-gradient(180deg, #ede7e0 0%, #e8e2db 100%)',
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span
                            className="select-none font-serif font-extrabold uppercase leading-none"
                            style={{
                                fontSize: 'clamp(12rem, 22vw, 32rem)',
                                letterSpacing: '-0.02em',
                                color: '#e0d9d1',
                                transform: 'translateY(38%)',
                            }}
                        >
                            IPC
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
