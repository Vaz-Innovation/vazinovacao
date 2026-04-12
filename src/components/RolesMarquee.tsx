import { useEffect, useRef, useState } from "react";

const ROLES = [
  "estrategistas",
  "designers",
  "engenheiros",
  "desenvolvedores",
  "consultores",
  "criativos",
  "inovadores",
];

// Each role gets a unique "description" that reveals on hover
const ROLE_DESCRIPTIONS: Record<string, string> = {
  estrategistas: "pensam três passos à frente",
  designers: "transformam caos em clareza",
  engenheiros: "constroem o impossível",
  desenvolvedores: "dão vida ao código",
  consultores: "enxergam o que ninguém vê",
  criativos: "quebram todas as regras",
  inovadores: "inventam o futuro",
};

const MarqueeRow = ({
  roles,
  speed,
  direction,
  size,
  opacity,
  showDescriptions,
}: {
  roles: string[];
  speed: number;
  direction: "left" | "right";
  size: string;
  opacity: number;
  showDescriptions?: boolean;
}) => {
  const duplicated = [...roles, ...roles, ...roles, ...roles];
  const animName = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div className="overflow-hidden whitespace-nowrap w-full">
      <div
        className="inline-flex items-baseline gap-8 sm:gap-12 md:gap-16"
        style={{
          animation: `${animName} ${speed}s linear infinite`,
          opacity,
        }}
      >
        {duplicated.map((role, i) => (
          <span key={`${role}-${i}`} className="group relative inline-block">
            <span
              className={`font-serif italic tracking-wider text-foreground select-none ${size}`}
              style={{
                transition: "opacity 0.4s ease",
              }}
            >
              {role}
            </span>
            {showDescriptions && (
              <span
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs sm:text-sm text-muted-foreground tracking-widest opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none font-serif"
                style={{ transition: "opacity 0.5s ease" }}
              >
                — {ROLE_DESCRIPTIONS[role]}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

const RolesMarquee = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative py-20 sm:py-28 md:py-36 overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--background)), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, hsl(var(--background)), transparent)",
        }}
      />

      {/* Row 1 — Large, bold, primary */}
      <div className="mb-6 sm:mb-10">
        <MarqueeRow
          roles={ROLES}
          speed={35}
          direction="left"
          size="text-3xl sm:text-4xl md:text-6xl lg:text-7xl"
          opacity={1}
          showDescriptions
        />
      </div>

      {/* Row 2 — Medium, reversed, muted */}
      <div className="mb-6 sm:mb-10">
        <MarqueeRow
          roles={[...ROLES].reverse()}
          speed={50}
          direction="right"
          size="text-lg sm:text-xl md:text-3xl lg:text-4xl"
          opacity={0.3}
        />
      </div>

      {/* Row 3 — Small, ghost-like, fast */}
      <div>
        <MarqueeRow
          roles={ROLES}
          speed={25}
          direction="left"
          size="text-sm sm:text-base md:text-xl"
          opacity={0.12}
        />
      </div>

      {/* Center accent line */}
      <div className="flex justify-center mt-12 sm:mt-16">
        <div
          className="h-[1px] bg-foreground/10"
          style={{
            width: isVisible ? "200px" : "0px",
            transition: "width 2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s",
          }}
        />
      </div>
    </div>
  );
};

export default RolesMarquee;
