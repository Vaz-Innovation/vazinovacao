import { FounderCard } from "../atoms/founder-card";

const founders = [
  {
    name: "Manuel Antunes",
    role: "Founder & CTO",
    imageSrc: "/founders/manuel-antunes.png",
    rotation: "-2deg",
    textAlign: "left" as const,
  },
  {
    name: "Isa Vaz",
    role: "Founder, CVO & CHIO",
    imageSrc: "/founders/isa-vaz.png",
    rotation: "1deg",
    textAlign: "right" as const,
    elevated: true,
  },
  {
    name: "Marvin Couto",
    role: "Founder & Chief of Staff",
    imageSrc: "/founders/marvin-couto.png",
    rotation: "3deg",
    textAlign: "left" as const,
  },
];

export function FoundersSection() {
  return (
    <section
      className="py-24 px-6 animate-gentle-fade"
      style={{ animationDelay: "0.45s", opacity: 0, animationFillMode: "forwards" }}
    >
      <p className="text-center text-sm uppercase tracking-[0.3em] text-muted-foreground mb-16">
        Fundadores
      </p>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4">
          {founders.map((founder) => (
            <FounderCard key={founder.name} {...founder} />
          ))}
        </div>
      </div>
    </section>
  );
}
