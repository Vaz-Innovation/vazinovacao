import { useState, useEffect, useRef } from "react";
import vazLogo from "@/assets/vaz-logo.png";
import PantherOrbit from "@/components/PantherOrbit";
import RolesMarquee from "@/components/RolesMarquee";

const PHRASE = "Fala comigo, eu resolvo.";

const Index = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [typingDone, setTypingDone] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < PHRASE.length) {
        setDisplayedText(PHRASE.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setTypingDone(true);
          setTimeout(() => setShowContent(true), 600);
        }, 800);
      }
    }, 90);
    return () => clearInterval(interval);
  }, []);

  // Cursor blink stops after typing
  useEffect(() => {
    if (typingDone) {
      const t = setTimeout(() => setShowCursor(false), 1500);
      return () => clearTimeout(t);
    }
  }, [typingDone]);

  return (
    <div className="min-h-screen bg-background text-foreground font-serif">
      {/* Hero - Full viewport typewriter */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 relative">
        <div className="flex items-center justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight text-foreground text-center leading-tight">
            {displayedText}
            {showCursor && (
              <span className="cursor-blink inline-block w-[2px] h-[0.85em] bg-foreground ml-1 align-baseline" />
            )}
          </h1>
        </div>

        {/* Scroll indicator */}
        {typingDone && (
          <div className="absolute bottom-12 animate-gentle-fade">
            <div className="w-[1px] h-16 bg-foreground/20 mx-auto" />
          </div>
        )}
      </section>

      {/* Content section */}
      {showContent && (
        <div ref={contentRef}>
          {/* Panther with orbiting disciplines */}
          <section className="px-6 animate-gentle-fade">
            <PantherOrbit />
          </section>

          {/* Logo */}
          <section className="flex items-center justify-center py-32 px-6 animate-gentle-fade" style={{ animationDelay: "0.9s", opacity: 0, animationFillMode: "forwards" }}>
            <img
              src={vazLogo}
              alt="Vaz Inovação"
              loading="lazy"
              width={400}
              height={400}
              className="w-32 sm:w-40 md:w-48"
            />
          </section>

          {/* Footer */}
          <footer className="py-16 text-center animate-gentle-fade" style={{ animationDelay: "1.2s", opacity: 0, animationFillMode: "forwards" }}>
            <p className="text-sm text-muted-foreground tracking-widest uppercase">
              Vaz Inovação
            </p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Index;
