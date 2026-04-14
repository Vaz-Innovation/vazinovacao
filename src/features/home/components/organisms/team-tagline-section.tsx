export function TeamTaglineSection() {
  return (
    <section
      className="flex items-center justify-center py-16 px-6 animate-gentle-fade"
      style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards" }}
    >
      <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center italic tracking-wide leading-relaxed">
        estrategistas · designers · engenheiros · desenvolvedores · criativos · inovadores · resistentes · forasteiros
      </p>
    </section>
  );
}
