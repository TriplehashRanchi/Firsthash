import AboutUsSection from './AboutUsSection';
import CallToActionSection from './CallToActionSection';
import HeroSection from './HeroSection';
import LandingFooter from './LandingFooter';
import ShowcaseSection from './ShowcaseSection';
import WorkflowSection from './WorkflowSection';

export default function LandingPage() {
    return (
        <main className="bg-[#fbf7f2] text-[#1f1814]">
            <HeroSection />
            <AboutUsSection />
            <ShowcaseSection />
            <WorkflowSection />
            <CallToActionSection />
            <LandingFooter />
        </main>
    );
}
