import Image from "next/image";
import phoneIcon from "@/assets/phone-icon.png";

interface WhatsAppButtonProps {
  phoneNumber?: string;
}

export function WhatsAppButton({ phoneNumber = "556132468810" }: WhatsAppButtonProps) {
  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-foreground text-background shadow-lg hover:opacity-80 transition-opacity"
      aria-label="Fale conosco no WhatsApp"
    >
      <Image src={phoneIcon.src} alt="Telefone" width={28} height={28} className="invert" />
    </a>
  );
}
