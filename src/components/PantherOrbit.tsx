import { useEffect, useRef, useState } from "react";
import pantherImg from "@/assets/panther.png";

const ROLES = [
  "estrategistas",
  "designers",
  "engenheiros",
  "desenvolvedores",
  "consultores",
  "criativos",
  "inovadores",
];

// Duplicate for seamless ring
const RING_ITEMS = [...ROLES, ...ROLES];

const PantherOrbit = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer for reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Subtle parallax on mouse
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const tiltX = mousePos.y * -5;
  const tiltY = mousePos.x * 8;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{
        width: "100%",
        height: "80vh",
        minHeight: "500px",
        perspective: "1200px",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 1.5s ease-out",
      }}
    >
      {/* 3D scene container */}
      <div
        style={{
          position: "relative",
          width: "400px",
          height: "400px",
          transformStyle: "preserve-3d",
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {/* Panther - centered with breathing animation */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            zIndex: 10,
            animation: "panther-breathe 4s ease-in-out infinite",
          }}
        >
          <img
            src={pantherImg}
            alt="Pantera negra"
            width={1024}
            height={768}
            className="w-72 sm:w-80 md:w-96 drop-shadow-2xl select-none pointer-events-none"
            style={{
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))",
            }}
          />
        </div>

        {/* Orbiting ring 1 - main ring */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(75deg)",
            animation: "orbit-spin 30s linear infinite",
          }}
        >
          {RING_ITEMS.map((role, i) => {
            const angle = (360 / RING_ITEMS.length) * i;
            const radius = 280;
            return (
              <span
                key={`ring1-${i}`}
                className="absolute font-serif italic text-foreground/60 whitespace-nowrap"
                style={{
                  left: "50%",
                  top: "50%",
                  fontSize: "clamp(0.7rem, 1.2vw, 1rem)",
                  letterSpacing: "0.15em",
                  transform: `
                    translate(-50%, -50%)
                    rotateZ(${angle}deg)
                    translateX(${radius}px)
                    rotateZ(${-angle}deg)
                    rotateX(-75deg)
                  `,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                {role}
              </span>
            );
          })}
        </div>

        {/* Orbiting ring 2 - counter-rotating, slightly tilted, more transparent */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(70deg) rotateZ(15deg)",
            animation: "orbit-spin-reverse 45s linear infinite",
          }}
        >
          {ROLES.map((role, i) => {
            const angle = (360 / ROLES.length) * i;
            const radius = 340;
            return (
              <span
                key={`ring2-${i}`}
                className="absolute font-serif italic text-foreground/25 whitespace-nowrap"
                style={{
                  left: "50%",
                  top: "50%",
                  fontSize: "clamp(0.6rem, 1vw, 0.85rem)",
                  letterSpacing: "0.2em",
                  transform: `
                    translate(-50%, -50%)
                    rotateZ(${angle}deg)
                    translateX(${radius}px)
                    rotateZ(${-angle}deg)
                    rotateX(-70deg)
                  `,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                {role}
              </span>
            );
          })}
        </div>

        {/* Subtle dot ring - orbital particles */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(78deg) rotateZ(-10deg)",
            animation: "orbit-spin 20s linear infinite",
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (360 / 24) * i;
            const radius = 260;
            return (
              <span
                key={`dot-${i}`}
                className="absolute rounded-full bg-foreground/15"
                style={{
                  width: i % 3 === 0 ? "3px" : "2px",
                  height: i % 3 === 0 ? "3px" : "2px",
                  left: "50%",
                  top: "50%",
                  transform: `
                    translate(-50%, -50%)
                    rotateZ(${angle}deg)
                    translateX(${radius}px)
                  `,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PantherOrbit;
