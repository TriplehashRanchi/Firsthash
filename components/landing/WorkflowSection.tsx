import { closingHighlights, workflowSteps } from './landing-data';
import SectionHeading from './SectionHeading';

export default function WorkflowSection() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                    <SectionHeading
                        eyebrow="Build system"
                        title="Component-based structure is the correct approach for a landing page you will keep improving."
                        description="Instead of designing one massive file, the page is broken into independent sections. That keeps future edits fast and prevents the homepage from becoming fragile."
                    />

                    <div className="mt-10 grid gap-4">
                        {closingHighlights.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div key={item.label} className="rounded-[1.5rem] border border-[#eadccf] bg-[#fbf8f4] p-5">
                                    <div className="flex items-center gap-3 text-[#8a5b39]">
                                        <Icon className="h-5 w-5" />
                                        <span className="text-xs font-semibold uppercase tracking-[0.28em]">{item.label}</span>
                                    </div>
                                    <p className="mt-4 font-serif text-3xl text-[#1f1814]">{item.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-5">
                    {workflowSteps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <article
                                key={step.title}
                                className="grid gap-5 rounded-[1.75rem] border border-[#eadccf] bg-white p-6 shadow-[0_18px_34px_rgba(60,35,20,0.05)] md:grid-cols-[auto_1fr]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6ece3] text-[#8a5b39]">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="font-serif text-4xl text-[#d4c1b1]">{`0${index + 1}`}</div>
                                </div>
                                <div>
                                    <h3 className="font-serif text-3xl text-[#1f1814]">{step.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-[#685a50]">{step.description}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
