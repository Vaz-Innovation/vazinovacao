import Image from "next/image";
import pantherImg from "@/assets/panther.png";

export function PantherSection() {
  return (
    <section className="flex items-center justify-center py-24 px-6 animate-gentle-fade">
      <Image
        src={pantherImg.src}
        alt="Pantera negra"
        width={1024}
        height={768}
        className="w-full max-w-lg opacity-90"
      />
    </section>
  );
}
