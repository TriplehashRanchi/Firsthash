import Image from 'next/image';
import Link from 'next/link';

export default function CallToActionSection() {
    return (
        <section className="px-4 pb-20 md:px-6 lg:px-8">
            <div className="relative mx-auto max-w-[1680px] overflow-hidden rounded-xl border border-[#dfcfbf] text-white shadow-[0_30px_80px_rgba(73,45,29,0.22)]">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1800&auto=format&fit=crop"
                        alt="Founder working with team"
                        fill
                        className="object-cover object-center"
                    />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,12,8,0.88)_0%,rgba(20,12,8,0.68)_42%,rgba(20,12,8,0.38)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,144,65,0.16),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(255,144,65,0.14),_transparent_22%)]" />

                <div className="relative z-10 grid gap-8 px-8 py-14 md:px-12 md:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.36em] text-[#f1c9a7]">Founder note</p>
                        <blockquote className="mt-5 max-w-4xl font-serif text-4xl leading-tight md:text-6xl">
                            &ldquo;Great work is remembered when the vision is clear and the delivery feels effortless.&rdquo;
                        </blockquote>
                        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
                            We build calm, premium visual experiences that help people trust the work from the first impression to the final handoff.
                        </p>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Founder led direction</p>
                    </div>

                    <div className="flex flex-col gap-4 lg:items-end">
                        <Link
                            href="/register"
                            className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#231915] transition hover:bg-[#f7e9dc]"
                        >
                            Start your project
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Book a consultation
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
