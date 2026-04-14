import { LanguageCodeFilterEnum } from "@/graphql/__gen__/graphql";

export const localeToWpLanguage = {
  "pt-BR": LanguageCodeFilterEnum.Pt,
  "en-US": LanguageCodeFilterEnum.En,
} as const;

export type SupportedLocale = keyof typeof localeToWpLanguage;

export function resolveWpLanguage(locale?: string): (typeof localeToWpLanguage)[SupportedLocale] {
  if (!locale) {
    return localeToWpLanguage["pt-BR"];
  }

  return localeToWpLanguage[locale as SupportedLocale] ?? localeToWpLanguage["pt-BR"];
}
