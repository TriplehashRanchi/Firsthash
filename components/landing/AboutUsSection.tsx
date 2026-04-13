import Image from 'next/image';
import Link from 'next/link';
import { aboutUsContent } from './landing-data';

export default function AboutUsSection() {
    return (
        <section className="px-4 py-20 md:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px] rounded-[2.5rem] border border-[#ecdcd0] bg-white px-6 py-8 shadow-[0_24px_60px_rgba(60,36,22,0.08)] md:px-10 md:py-12 lg:px-14 lg:py-14">
                <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] xl:grid-cols-[0.85fr_1.15fr]">
                    <div className="relative mx-auto aspect-[1/1] w-full max-w-[560px] overflow-hidden rounded-[2.75rem] rounded-bl-[6rem] rounded-tr-[6rem]">
                        <Image src={aboutUsContent.image} alt="About Firsthash" fill className="object-cover" />
                    </div>

                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#18253c]">{aboutUsContent.eyebrow}</p>
                        <div className="mt-3 h-1 w-24 rounded-full bg-[#ff7e2f]" />
                        <h2 className="mt-6 font-serif text-4xl leading-[1.02] text-[#1b1d23] md:text-6xl xl:text-[5.2rem]">
                            {aboutUsContent.title}
                        </h2>
                        <p className="mt-6 max-w-2xl text-lg leading-9 text-[#6a625c]">{aboutUsContent.description}</p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            {aboutUsContent.highlights.map((item) => (
                                <span key={item} className="rounded-full border border-[#ead8ca] bg-[#faf4ef] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-[#7a5b45]">
                                    {item}
                                </span>
                            ))}
                        </div>

                        <Link
                            href="/register"
                            className="mt-10 inline-flex items-center justify-center rounded-full bg-[#ff7e2f] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#ff9351]"
                        >
                            {aboutUsContent.ctaLabel}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
