const BLOG_HTML_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bReading\s*Time\s*:?/gi, "Tempo de leitura:"],
  [/\bRead\s*Time\s*:?/gi, "Tempo de leitura:"],
  [/\bless\s+than\s+1\s+minute\b/gi, "menos de 1 minuto"],
  [/<\s*1\s*minute\b/gi, "< 1 minuto"],
  [/\b(\d+)\s*min\s*read\b/gi, "$1 min de leitura"],
  [/\b1\s+minute\b/gi, "1 minuto"],
  [/\b(\d+)\s+minutes\b/gi, "$1 minutos"],
];

export function localizeBlogHtml(html?: string | null): string {
  if (!html) {
    return "";
  }

  return BLOG_HTML_REPLACEMENTS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    html,
  );
}