import { photographyHighlights, servicePillars } from './landing-data';
import SectionHeading from './SectionHeading';

export default function PillarsSection() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
            <SectionHeading
                eyebrow="What we shoot"
                title="Photographer-style work categories presented like a curated portfolio."
                description="This section now focuses on real shoot types instead of generic service text, so visitors immediately understand the kind of work you do and the visual quality you want to represent."
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {servicePillars.map((pillar) => {
                        const Icon = pillar.icon;

                        return (
                            <article
                                key={pillar.title}
                                className="group overflow-hidden rounded-[1.9rem] border border-[#eadccf] bg-white shadow-[0_18px_40px_rgba(59,37,22,0.06)] transition hover:-translate-y-1"
                            >
                                <div className={`h-44 bg-gradient-to-br ${pillar.accent}`} />
                                <div className="p-7">
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ede4] text-[#8a5834]">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#8b6b57]">{pillar.note}</span>
                                    </div>
                                    <h3 className="mt-6 font-serif text-3xl text-[#1f1814]">{pillar.title}</h3>
                                    <p className="mt-4 text-sm leading-7 text-[#645850]">{pillar.description}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <aside className="rounded-[2rem] border border-[#e2d3c6] bg-[linear-gradient(180deg,#1d1410_0%,#3a281f_100%)] p-8 text-white shadow-[0_24px_60px_rgba(42,24,15,0.16)]">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[#f0c7a3]">Shoot list</p>
                    <h3 className="mt-5 font-serif text-4xl leading-tight">Visual work that feels premium before anyone reads too much.</h3>
                    <p className="mt-5 text-sm leading-7 text-white/75">
                        Use this area to show the kind of projects you handle. For a photography-first landing page, this works better than abstract service cards.
                    </p>

                    <div className="mt-8 space-y-3">
                        {photographyHighlights.map((item) => (
                            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-6 text-white/82">
                                {item}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Style</p>
                            <p className="mt-2 font-serif text-3xl text-white">Cinematic</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Approach</p>
                            <p className="mt-2 font-serif text-3xl text-white">Editorial</p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
