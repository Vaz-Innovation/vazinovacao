import Link from "next/link";
import { SocialLink } from "../atoms/social-link";
import { MailIcon, InstagramIcon, LinkedInIcon, MediumIcon } from "../atoms/social-icons";

export function FooterSection() {
  return (
    <footer
      className="py-16 text-center animate-gentle-fade"
      style={{ animationDelay: "1.2s", opacity: 0, animationFillMode: "forwards" }}
    >
      <p className="text-sm text-muted-foreground tracking-widest uppercase">
        Vaz Inovação
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground mt-4 italic">
        Simplificando a tecnologia, ampliando a inteligência humana.
      </p>
      <div className="flex items-center justify-center gap-6 mt-8">
        <SocialLink href="mailto:contato@vazinovacao.com.br" label="E-mail" external={false}>
          <MailIcon />
        </SocialLink>
        <SocialLink href="https://www.instagram.com/vaz_por_todos?igsh=YzhmNGx3c2VmbGc2&utm_source=qr" label="Instagram">
          <InstagramIcon />
        </SocialLink>
        <SocialLink href="https://www.linkedin.com/company/vaz-inova%C3%A7%C3%A3o/" label="LinkedIn">
          <LinkedInIcon />
        </SocialLink>
        <SocialLink href="https://medium.com/@vaz_por_todos" label="Medium">
          <MediumIcon />
        </SocialLink>
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground transition-colors text-sm tracking-widest uppercase font-normal"
        >
          Blog
        </Link>
      </div>
      <div className="mt-12 pt-8 border-t border-foreground/10">
        <p className="text-xs text-muted-foreground">
          Inteligência Humana Ampliada © 2026
        </p>
      </div>
    </footer>
  );
}
