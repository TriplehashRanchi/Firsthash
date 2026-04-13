'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { heroSlides } from './landing-data';
import FloatingNavbar from './FloatingNavbar';

export default function HeroSection() {
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % heroSlides.length);
        }, 4200);

        return () => window.clearInterval(interval);
    }, []);

    return (
        <section className="relative overflow-hidden">
            <FloatingNavbar />

            <div className="relative min-h-screen overflow-hidden bg-[#140d09]">
                {heroSlides.map((slide, index) => (
                    <div
                        key={slide.title}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <Image src={slide.image} alt={slide.title} fill priority={index === 0} className="object-cover object-center" />
                    </div>
                ))}

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,6,5,0.76)_0%,rgba(8,6,5,0.5)_42%,rgba(8,6,5,0.14)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,151,61,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,151,61,0.16),_transparent_22%)]" />

                <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-8 pt-28 md:px-8 md:pb-10 md:pt-32 lg:px-10 lg:pt-36">
                    <div className="flex flex-1 items-end py-8 md:py-12 lg:py-14">
                        <div className="grid w-full gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                            <div className="max-w-3xl">
                                <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80 backdrop-blur">
                                    {heroSlides[activeSlide].eyebrow}
                                </div>
                                <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[0.92] tracking-[-0.05em] text-white md:text-7xl lg:text-[5.8rem]">
                                    {heroSlides[activeSlide].title}
                                </h1>
                                <p className="mt-5 max-w-lg text-base leading-7 text-white/78 md:text-lg">
                                    {heroSlides[activeSlide].description}
                                </p>

                                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff8d2f] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#ff9f52]"
                                    >
                                        Get started
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                                    >
                                        View dashboard
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                                {heroSlides.map((slide, index) => (
                                    <button
                                        key={slide.title}
                                        type="button"
                                        onClick={() => setActiveSlide(index)}
                                        className="group flex items-center gap-3"
                                        aria-label={`Show slide ${index + 1}`}
                                    >
                                        <span
                                            className={`block rounded-full transition-all ${index === activeSlide ? 'h-3 w-10 bg-[#ff8d2f]' : 'h-3 w-3 bg-white/55 group-hover:bg-white/80'}`}
                                        />
                                        <span className={`hidden text-xs uppercase tracking-[0.28em] text-white/70 lg:block ${index === activeSlide ? 'text-white' : ''}`}>
                                            0{index + 1}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 border-t border-white/10 pt-5 text-white/75 md:grid-cols-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">Visual style</p>
                            <p className="mt-2 text-sm">Minimal text, strong imagery, portfolio-like composition.</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">Navigation</p>
                            <p className="mt-2 text-sm">Logo on the left with clean login and signup actions on the right.</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">Hero motion</p>
                            <p className="mt-2 text-sm">Background images auto-slide to keep the first screen alive.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
