import { useState, useEffect, useRef } from "react";
import vazLogo from "@/assets/vaz-logo.png";
import pantherImg from "@/assets/panther.png";
import phoneIcon from "@/assets/phone-icon.png";

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
          {/* Panther */}
          <section className="flex items-center justify-center py-24 px-6 animate-gentle-fade">
            <img
              src={pantherImg}
              alt="Pantera negra"
              width={1024}
              height={768}
              className="w-full max-w-lg opacity-90"
            />
          </section>

          {/* About */}
          <section className="flex flex-col items-center justify-center py-24 px-6 animate-gentle-fade" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
            <p className="text-xl sm:text-2xl md:text-3xl text-foreground text-center max-w-3xl leading-relaxed font-normal">
              Vaz Inovação é um{" "}
              <em className="italic text-muted-foreground">coletivo criativo.</em>
            </p>
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
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 italic">
              Simplificando a tecnologia, ampliando a inteligência humana.
            </p>
          </footer>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-foreground text-background shadow-lg hover:opacity-80 transition-opacity"
            aria-label="Fale conosco no WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default Index;
