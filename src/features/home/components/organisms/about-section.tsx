import Link from "next/link";

export function AboutSection() {
  return (
    <section
      className="flex flex-col items-center justify-center py-24 px-6 animate-gentle-fade"
      style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
    >
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
  );
}
