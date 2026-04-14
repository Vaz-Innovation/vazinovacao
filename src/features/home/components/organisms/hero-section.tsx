import { useState, useEffect } from "react";

const PHRASE = "Fala comigo, eu resolvo.";

interface HeroSectionProps {
  onTypingComplete?: () => void;
}

export function HeroSection({ onTypingComplete }: HeroSectionProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [typingDone, setTypingDone] = useState(false);

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
          setTimeout(() => onTypingComplete?.(), 600);
        }, 800);
      }
    }, 90);
    return () => clearInterval(interval);
  }, [onTypingComplete]);

  // Cursor blink stops after typing
  useEffect(() => {
    if (typingDone) {
      const t = setTimeout(() => setShowCursor(false), 1500);
      return () => clearTimeout(t);
    }
  }, [typingDone]);

  return (
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
  );
}
