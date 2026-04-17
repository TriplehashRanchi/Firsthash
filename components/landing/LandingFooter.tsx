import Image from 'next/image';
import Link from 'next/link';
import { Namdhinggo } from 'next/font/google';
import { FiGithub, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import { footerSections } from './landing-data';

const namdhinggo = Namdhinggo({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
});

const socialLinks = [
    { label: 'X', href: 'https://x.com', icon: FaXTwitter },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: FiLinkedin },
    { label: 'Instagram', href: 'https://instagram.com', icon: FiInstagram },
    { label: 'GitHub', href: 'https://github.com', icon: FiGithub },
];

export default function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative overflow-hidden px-4 pb-0 pt-6 md:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
                <div className="relative overflow-hidden rounded  bg-[linear-gradient(180deg,#fffdf9_0%,#f7efe6_100%)] text-[#1f1814]">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-16 top-16 h-40 w-40 rounded-full bg-[#f1dfcf]/60 blur-3xl" />
                        <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-[#f8eee4] blur-3xl" />
                        <div className="absolute bottom-0 right-20 h-44 w-44 rounded-full bg-[#ebd6c3]/50 blur-3xl" />
                    </div>

                    <div className="relative z-10 grid gap-8 px-6 py-7 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:gap-8">
                        <div>
                            <div className="flex items-start gap-4">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1.15rem] border border-[#eadbce] bg-white shadow-[0_10px_24px_rgba(96,65,37,0.08)]">
                                    <Image src="/favicon.ico" alt="Firsthash logo" fill className="object-contain p-3" />
                                </div>

                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c7563] sm:text-xs">IPC Studios</p>
                                    <p className="mt-1 text-[2rem] font-semibold tracking-[-0.05em] text-[#1f1814] sm:text-[2.15rem]">Operations, but calmer.</p>
                                </div>
                            </div>

                            <p className="mt-7 max-w-[430px] text-[15px] leading-8 text-[#655850] sm:text-[16px]">
                                IPC helps teams turn ideas into clean execution with a premium workspace that feels structured, dependable, and easy to move through.
                            </p>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-10">
                            {footerSections.map((section) => (
                                <div key={section.title}>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c7563] sm:text-xs">{section.title}</p>

                                    <div className="mt-5 space-y-4">
                                        {section.links.map((link) => (
                                            <Link key={link.label} href={link.href} className="block text-[15px] font-medium text-[#5d514a] transition hover:text-[#1f1814]">
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 px-6 pb-6 pt-3 md:px-8 md:pb-7">
                        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c7563] sm:text-xs">Social</p>

                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                    {socialLinks.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={item.label}
                                                className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#dccabb] bg-transparent text-[#7b6a5d] transition duration-300 hover:border-[#bfa792] hover:bg-[#fbf4ed] hover:text-[#1f1814]"
                                            >
                                                <Icon className="h-[17px] w-[17px] transition group-hover:scale-105" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#73675f] sm:text-sm">
                                <p>© {currentYear} IPC. All rights reserved.</p>
                                <Link href="/privacypolisy" className="transition hover:text-[#1f1814]">
                                    Privacy Policy
                                </Link>
                                <Link href="/term-condition" className="transition hover:text-[#1f1814]">
                                    Terms
                                </Link>
                                <Link href="/register" className="transition hover:text-[#1f1814]">
                                    Cookies Settings
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 w-full overflow-hidden border-t border-[#eadfd4] bg-[linear-gradient(180deg,#fffdf9_0%,#f7efe6_100%)] px-6 py-8 sm:px-8 sm:py-9">
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(247,239,230,0)_0%,rgba(226,210,194,0.32)_100%)]" />

                        <div className="flex min-h-[150px] items-center">
                            <div className="flex w-full items-center gap-5 sm:gap-6 lg:gap-8">
                                <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                                    <Image src="/favicon.ico" alt="IPC logo" fill className="object-contain p-2" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#8c7563] sm:text-[11px]">IPC Studios</p>

                                    <div
                                        className={`${namdhinggo.className} block w-full leading-[0.88] text-[#1f1814]`}
                                        style={{
                                            fontSize: 'clamp(3.4rem, 10vw, 10rem)',
                                            letterSpacing: '0.11em',
                                            fontWeight: 800,
                                        }}
                                    >
                                        IPC STUDIOS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
