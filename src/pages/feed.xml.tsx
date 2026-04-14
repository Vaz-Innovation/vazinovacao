import type { GetServerSideProps } from "next";

import { useFragment as readFragment } from "@/graphql/__gen__";
import { BlogPostCardFragment } from "@/features/blog/components/blog-post-card";
import { TaxonomyChipFragment } from "@/features/blog/components/taxonomy-chip";
import { execute } from "@/graphql/execute";
import { resolveWpLanguage } from "@/graphql/locale-to-wp-language";
import {
  BlogListOnQueryFragment,
  BlogListPageQuery,
} from "@/graphql/pages/blog-list.query";
import { BLOG_PAGE_SIZE } from "@/features/blog/constants";

function Feed() {
  // getServerSideProps will do the heavy lifting
}

const DEFAULT_SITE_NAME = "Vaz Inovacao";
const DEFAULT_SITE_DESCRIPTION =
  "Simplificando a tecnologia e ampliando a inteligencia humana.";
const DEFAULT_SITE_URL = "https://vazinovacao.vercel.app";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toBrasiliaRssDate(dateInput?: string | null): string {
  const baseDate = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(baseDate.getTime())) {
    return new Date().toUTCString();
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "shortOffset",
  }).formatToParts(baseDate);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  const weekday = get("weekday") || "Mon";
  const day = get("day") || "01";
  const month = get("month") || "Jan";
  const year = get("year") || "1970";
  const hour = get("hour") || "00";
  const minute = get("minute") || "00";
  const second = get("second") || "00";
  const tz = get("timeZoneName") || "GMT-3";

  const numericOffset = tz.replace("GMT", "").replace(":", "") || "-3";
  const normalizedOffset = numericOffset.includes("+") || numericOffset.includes("-")
    ? numericOffset
    : `-${numericOffset}`;
  const sign = normalizedOffset.startsWith("-") ? "-" : "+";
  const absolute = normalizedOffset.replace(/[+-]/g, "");
  const [offsetHoursRaw, offsetMinutesRaw] = absolute.split(/(?<=^\d{1,2})(?=\d{2}$)/);
  const offsetHours = (offsetHoursRaw || absolute || "0").padStart(2, "0");
  const offsetMinutes = (offsetMinutesRaw || "00").padStart(2, "0");

  return `${weekday}, ${day} ${month} ${year} ${hour}:${minute}:${second} ${sign}${offsetHours}${offsetMinutes}`;
}

function resolveBaseUrl(req: Parameters<GetServerSideProps>[0]["req"]): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/$/, "");
  }

  const protoHeader = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(protoHeader)
    ? protoHeader[0]
    : protoHeader?.split(",")[0] || "https";

  const hostHeader = req.headers["x-forwarded-host"] || req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

  if (!host) {
    return DEFAULT_SITE_URL;
  }

  return `${protocol}://${host}`.replace(/\/$/, "");
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale,
}) => {
  const resolvedLocale = locale || "pt-BR";
  const baseUrl = resolveBaseUrl(req);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME;
  const siteDescription =
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || DEFAULT_SITE_DESCRIPTION;
  const localePrefix = resolvedLocale === "pt-BR" ? "" : `/${resolvedLocale}`;

  const data = await execute(BlogListPageQuery, {
    first: BLOG_PAGE_SIZE,
    language: resolveWpLanguage(resolvedLocale),
  });
  const queryData = readFragment(BlogListOnQueryFragment, data);
  const posts = (queryData?.blogPosts?.nodes || []).filter(Boolean);

  const feedUrl = `${baseUrl}${localePrefix}/feed.xml`;
  const now = toBrasiliaRssDate();

  const itemsXml = posts
    .map((postNode) => {
      const post = readFragment(BlogPostCardFragment, postNode!);
      const title = escapeXml(post.title || "Sem titulo");
      const slug = post.slug ? escapeXml(post.slug) : "";
      const link = `${baseUrl}${localePrefix}/blog/${slug}`;
      const description = escapeXml(post.excerpt || "");
      const categories = (post.categories?.nodes || [])
        .filter(Boolean)
        .map((category) => {
          const term = readFragment(TaxonomyChipFragment, category!);
          return `<category>${escapeXml(term.name || "")}</category>`;
        })
        .join("\n      ");

      return `<item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toBrasiliaRssDate(post.date)}</pubDate>
      <description><![CDATA[${description}]]></description>
      ${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>${escapeXml(resolvedLocale)}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.write(xml);
  res.end();

  return {
    props: {},
  };
};

export default Feed;
