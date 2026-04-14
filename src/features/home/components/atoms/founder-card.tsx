import Image from "next/image";

interface FounderCardProps {
  name: string;
  role: string;
  imageSrc: string;
  imageAlt?: string;
  rotation?: string;
  textAlign?: "left" | "right";
  elevated?: boolean;
}

export function FounderCard({
  name,
  role,
  imageSrc,
  imageAlt,
  rotation = "0deg",
  textAlign = "left",
  elevated = false,
}: FounderCardProps) {
  return (
    <div className={`group relative ${elevated ? "lg:-mt-8 z-10" : ""}`}>
      <div
        className={`relative bg-background border border-foreground/10 p-3 transition-transform duration-500 hover:scale-105 ${
          elevated ? "shadow-xl" : ""
        }`}
        style={{
          ["--hover-rotation" as string]: rotation,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = `rotate(${rotation}) scale(1.05)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "rotate(0deg) scale(1)";
        }}
      >
        <div className="relative w-64 h-80 overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt || name}
            fill
            className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <div className={`pt-4 pb-2 px-1 ${textAlign === "right" ? "text-right" : ""}`}>
          <p className="text-lg font-normal text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground italic">{role}</p>
        </div>
      </div>
    </div>
  );
}
