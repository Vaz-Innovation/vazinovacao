import { DepthLine } from "../atoms/depth-line";

export function DepthLineSection() {
  return (
    <section
      className="flex items-center justify-center px-6 py-12 animate-gentle-fade"
      style={{ animationDelay: "0.75s", opacity: 0, animationFillMode: "forwards" }}
    >
      <DepthLine />
    </section>
  );
}
