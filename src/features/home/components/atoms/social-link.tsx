import { ReactNode } from "react";

interface SocialLinkProps {
  href: string;
  label: string;
  children: ReactNode;
  external?: boolean;
}

export function SocialLink({ href, label, children, external = true }: SocialLinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={label}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </a>
  );
}
