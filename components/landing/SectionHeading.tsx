type SectionHeadingProps = {
    eyebrow: string;
    title: string;
    description: string;
    align?: 'left' | 'center';
};

export default function SectionHeading({ eyebrow, title, description, align = 'left' }: SectionHeadingProps) {
    const alignment = align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl';

    return (
        <div className={alignment}>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#9f5d32]">{eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-[#1f1814] md:text-5xl">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f544d] md:text-base">{description}</p>
        </div>
    );
}
