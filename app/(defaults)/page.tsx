import { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
    title: 'Firsthash | Studio-grade project operations',
    description: 'A premium landing page for Firsthash with an editorial, photographer-inspired layout and a reusable section-based architecture.',
};

export default function HomePage() {
    return <LandingPage />;
}
