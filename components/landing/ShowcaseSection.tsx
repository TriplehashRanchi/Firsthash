import Image from 'next/image';
import { showcaseFrames, trustNotes } from './landing-data';
import SectionHeading from './SectionHeading';

export default function ShowcaseSection() {
    return (
        <section className="bg-[#f6eee6] px-4 py-20 md:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
                <SectionHeading
                    eyebrow="Projects"
                    title="Recent work that shows craft, trust, and reliable delivery."
                    description="This section focuses on projects you have done, using real imagery and clear project summaries so visitors can immediately understand your style and what you deliver."
                />

                <div className="mt-12 rounded-[2.4rem] border border-[#dfcfc1] bg-white px-5 py-6 shadow-[0_20px_45px_rgba(76,48,30,0.08)] md:px-7 md:py-8">
                    {/* <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b674f]">Delivered projects</p>
                        <div className="hidden items-center gap-3 md:flex">
                            {trustNotes.map((note) => (
                                <span key={note} className="rounded-full border border-[#ebdbcf] bg-[#faf4ee] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7e604a]">
                                    {note}
                                </span>
                            ))}
                        </div>
                    </div> */}

                    <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {showcaseFrames.map((frame, index) => (
                            <article
                                key={frame.title}
                                className="min-w-[290px] snap-start overflow-hidden rounded-[1.9rem] border border-[#eadbce] bg-[#fffdfa] shadow-[0_16px_35px_rgba(76,48,30,0.07)] sm:min-w-[340px] md:min-w-[380px]"
                            >
                                <div className="relative h-56 w-full">
                                    <Image src={frame.image} alt={frame.title} fill className="object-cover" />
                                </div>
                                <div className="p-6">
                                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#93684a]">
                                        0{index + 1} {frame.eyebrow}
                                    </p>
                                    <h3 className="mt-4 font-serif text-2xl leading-snug text-[#1f1814]">{frame.title}</h3>
                                    <p className="mt-4 text-sm leading-7 text-[#66574d]">{frame.description}</p>
                                    <div className="mt-5 inline-flex rounded-full border border-[#ead9ca] bg-[#faf3ed] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f5f48]">
                                        Delivered project
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
