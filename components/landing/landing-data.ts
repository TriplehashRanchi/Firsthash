import {
    Aperture,
    ArrowRight,
    Blend,
    Layers3,
    Sparkles,
    TimerReset,
} from 'lucide-react';

export const heroMetrics = [
    { value: '08+', label: 'delivery streams organized inside one calm workspace' },
    { value: '24h', label: 'clear visibility on active projects, updates, and blockers' },
    { value: '3x', label: 'faster decision rhythm with cleaner operational context' },
];

export const heroSlides = [
    {
        image: 'https://i.pinimg.com/736x/dc/42/3b/dc423b7ab3acbb8518ec0d1f7d156d48.jpg',
        eyebrow: 'Project clarity',
        title: 'See work faster.',
        description: 'A cleaner front page with less noise and stronger visual focus.',
    },
    {
        image: 'https://i.pinimg.com/1200x/e1/94/3e/e1943e20b449965602b0dfd42c2156fe.jpg',
        eyebrow: 'Studio rhythm',
        title: 'Lead with impact.',
        description: 'Short copy, bold composition, and a premium visual first impression.',
    },
    {
        image: 'https://images.unsplash.com/photo-1561220636-3782bcd27c03?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        eyebrow: 'Modern workspace',
        title: 'Built to convert.',
        description: 'Logo, navigation, and calls to action placed exactly where users expect them.',
    },
];

export const aboutUsContent = {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
    eyebrow: 'About Us',
    title: 'Creative photography and visual storytelling with a clean, modern approach.',
    description:
        'We create polished photo experiences for weddings, events, portraits, and brand campaigns with a focus on emotion, composition, and timeless visual quality.',
    ctaLabel: 'Get a quote',
    highlights: ['Wedding shoots', 'Event coverage', 'Portrait sessions', 'Brand campaigns'],
};

export const servicePillars = [
    {
        title: 'Wedding Stories',
        description: 'Candid emotion, portraits, rituals, and album-ready coverage shaped into a polished visual narrative.',
        note: 'Signature',
        accent: 'from-[#f6dfcf] via-[#fbefe7] to-white',
        icon: Aperture,
    },
    {
        title: 'Event Coverage',
        description: 'Fast-moving event photography with clean delivery for conferences, launches, celebrations, and branded moments.',
        note: 'Live',
        accent: 'from-[#dfe8f4] via-[#eef3f8] to-white',
        icon: Blend,
    },
    {
        title: 'Brand Portraits',
        description: 'Portrait-led image sets for founders, teams, creators, and campaigns that need a premium editorial look.',
        note: 'Editorial',
        accent: 'from-[#e8dfd6] via-[#f6f0ea] to-white',
        icon: Sparkles,
    },
];

export const photographyHighlights = [
    'Wedding, portrait, event, and campaign work presented in one cohesive brand system.',
    'Strong visual hierarchy with premium framing instead of generic service blocks.',
    'Built to help visitors understand both style and business readiness at a glance.',
];

export const showcaseFrames = [
    {
        eyebrow: 'Wedding story',
        title: 'Royal wedding coverage with cinematic portraits and full-day storytelling.',
        description: 'From couple portraits to ceremony details, the project delivered a polished emotional gallery ready for album and social use.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop',
    },
    {
        eyebrow: 'Event production',
        title: 'Corporate event photography with fast delivery and clean branded visuals.',
        description: 'A complete event set with stage moments, guest interaction, and keynote highlights delivered in an organized client-ready collection.',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop',
    },
    {
        eyebrow: 'Brand campaign',
        title: 'Portrait-led campaign work for creators, founders, and modern brands.',
        description: 'Studio-style frames, soft color control, and reliable editing made the final delivery useful across web, print, and social assets.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop',
    },
];

export const workflowSteps = [
    {
        title: 'Frame the story',
        description: 'Lead with one strong message, one clear call to action, and a hero layout that feels premium.',
        icon: Aperture,
    },
    {
        title: 'Build with modules',
        description: 'Separate sections into reusable components so content can move without rewriting the page.',
        icon: Blend,
    },
    {
        title: 'Control the pace',
        description: 'Use compact content blocks, supporting metrics, and restrained motion to keep the page composed.',
        icon: TimerReset,
    },
    {
        title: 'Finish with confidence',
        description: 'End with a direct conversion block that makes the next action obvious for visitors.',
        icon: ArrowRight,
    },
];

export const trustNotes = [
    'Trusted project delivery with organized galleries and timely handoff.',
    'Clean editing style that works for wedding, event, and campaign clients.',
    'Simple process from shoot planning to final curated image delivery.',
];

export const spotlightTags = ['Editorial', 'Photographer tone', 'Component based', 'Clear CTA', 'High contrast', 'Responsive'];

export const closingHighlights = [
    {
        label: 'Visual direction',
        value: 'warm studio neutrals',
        icon: Sparkles,
    },
    {
        label: 'Page system',
        value: 'modular section components',
        icon: Layers3,
    },
];

export const footerSections = [
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '/' },
            { label: 'Pricing', href: '/' },
            { label: 'Integrations', href: '/' },
            { label: 'Changelog', href: '/' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'Documentation', href: '/' },
            { label: 'Tutorials', href: '/' },
            { label: 'Blog', href: '/' },
            { label: 'Support', href: '/login' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/' },
            { label: 'Careers', href: '/' },
            { label: 'Contact', href: '/register' },
            { label: 'Partners', href: '/' },
        ],
    },
];
