import Image from "next/image";
import vazLogo from "@/assets/vaz-logo.png";

export function LogoSection() {
  return (
    <section
      className="flex items-center justify-center py-32 px-6 animate-gentle-fade"
      style={{ animationDelay: "0.9s", opacity: 0, animationFillMode: "forwards" }}
    >
      <Image
        src={vazLogo.src}
        alt="Vaz Inovação"
        width={400}
        height={400}
        className="w-32 sm:w-40 md:w-48"
      />
    </section>
  );
}
