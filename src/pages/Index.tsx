import Head from "next/head";
import Link from "next/link";
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
              src={pantherImg.src}
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

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full border border-foreground bg-foreground px-6 py-3 text-sm uppercase tracking-wider text-background transition-opacity hover:opacity-85"
              >
                Explorar o blog
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full border border-foreground/30 px-6 py-3 text-sm uppercase tracking-wider text-foreground transition-colors hover:border-foreground"
              >
                Ver artigos recentes
              </Link>
            </div>
          </section>

          {/* Integrantes */}
          <section className="flex items-center justify-center py-16 px-6 animate-gentle-fade" style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards" }}>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center italic tracking-wide leading-relaxed">
              estrategistas · designers · engenheiros · desenvolvedores · criativos · inovadores · resistentes · forasteiros
            </p>
          </section>

          {/* Infinite depth line */}
          <section className="flex items-center justify-center px-6 py-12 animate-gentle-fade" style={{ animationDelay: "0.75s", opacity: 0, animationFillMode: "forwards" }}>
            <div className="infinite-depth-line max-w-2xl">
              <div className="line-ray" />
              <div className="depth-shadow" />
            </div>
          </section>

          {/* Logo */}
          <section className="flex items-center justify-center py-32 px-6 animate-gentle-fade" style={{ animationDelay: "0.9s", opacity: 0, animationFillMode: "forwards" }}>
            <img
              src={vazLogo.src}
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
            <div className="flex items-center justify-center gap-6 mt-8">
              <a href="mailto:contato@vazinovacao.com.br" aria-label="E-mail" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
              <a href="https://www.instagram.com/vaz_por_todos?igsh=YzhmNGx3c2VmbGc2&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/vaz-inova%C3%A7%C3%A3o/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://medium.com/@vaz_por_todos" target="_blank" rel="noopener noreferrer" aria-label="Medium" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
              </a>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-sm tracking-widest uppercase font-normal">
                Blog
              </Link>
            </div>
            <div className="mt-12 pt-8 border-t border-foreground/10">
              <p className="text-xs text-muted-foreground">
                © 2026 Todos os direitos reservados
              </p>
            </div>
          </footer>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/556132468810"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-foreground text-background shadow-lg hover:opacity-80 transition-opacity"
            aria-label="Fale conosco no WhatsApp"
          >
            <img src={phoneIcon.src} alt="Telefone" width={28} height={28} className="invert" />
          </a>
        </div>
      )}
      </div>
    </>
  );
};

export default Index;
