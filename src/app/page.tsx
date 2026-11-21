import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FooterExtra from "@/components/layout/FooterExtra";
import SoundToggle from "@/components/layout/SoundToggle";
import About from "@/components/sections/About";
import CvBanner from "@/components/sections/CvBanner";
import DeskStage from "@/components/sections/DeskStage";
import HabitCatcher from "@/components/sections/HabitCatcher";
import Hero from "@/components/sections/Hero";
import ProjectExplorer from "@/components/sections/ProjectExplorer";
import Skills from "@/components/sections/Skills";
import ViolinCorner from "@/components/sections/ViolinCorner";
import DividerAboutDesk from "@/components/dividers/DividerAboutDesk";
import DividerHeroAbout from "@/components/dividers/DividerHeroAbout";
import DividerPreFooter from "@/components/dividers/DividerPreFooter";
import LegacyInteractions from "@/components/LegacyInteractions";

export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full bg-surface min-h-[calc(100vh-80px)] pt-16">
        <div className="flex flex-col w-full text-on-surface">
          <Hero />
          <DividerHeroAbout />
          <About />
          <DividerAboutDesk />
          <DeskStage />
          <Skills />
          <ProjectExplorer />
          <ViolinCorner />
          <HabitCatcher />
          <CvBanner />
          <DividerPreFooter />
          <Footer />
          <LegacyInteractions />
        </div>
      </main>
      <SoundToggle />
      <FooterExtra />
    </>
  );
}
