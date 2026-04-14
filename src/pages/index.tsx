import Head from "next/head";
import { useState, useRef, useCallback } from "react";
import {
  HeroSection,
  PantherSection,
  AboutSection,
  FoundersSection,
  TeamTaglineSection,
  DepthLineSection,
  LogoSection,
  FooterSection,
  WhatsAppButton,
} from "@/features/home/components";

const Index = () => {
  const [showContent, setShowContent] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTypingComplete = useCallback(() => {
    setShowContent(true);
  }, []);

  return (
    <>
      <Head>
        <title>Vaz Inovacao</title>
        <meta
          name="description"
          content="Simplificando a tecnologia e ampliando a inteligencia humana."
        />
      </Head>

      <div className="min-h-screen bg-background text-foreground font-serif">
        {/* Hero - Full viewport typewriter */}
        <HeroSection onTypingComplete={handleTypingComplete} />

        {/* Content section */}
        {showContent && (
          <div ref={contentRef}>
            <PantherSection />
            <AboutSection />
            <FoundersSection />
            <TeamTaglineSection />
            <DepthLineSection />
            <LogoSection />
            <FooterSection />
            <WhatsAppButton />
          </div>
        )}
      </div>
    </>
  );
};

export default Index;
