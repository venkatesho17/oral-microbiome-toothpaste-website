import Navbar from "../components/navbar";
import HeroSection from "../components/hero-section";
import ProblemSection from "../components/problem-section";
import SolutionSection from "../components/solution-section";
import BenefitsSection from "../components/benefits-section";
import CtaSection from "../components/cta-section";
import Footer from "../components/footer";
import WebGLIndicator from "../components/webgl-indicator";
import MicrobiomeSceneWrapper from "../components/microbiome-scene-wrapper";

export default function Home() {
  return (
    <>
      <WebGLIndicator />
      <MicrobiomeSceneWrapper />
      <Navbar />
      <HeroSection />
      <main>
        <ProblemSection />
        <SolutionSection />
        <BenefitsSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
