import type { GetServerSideProps } from "next";

import { execute } from "@/graphql/execute";
import {
  localeToWpLanguage,
  resolveWpLanguage,
  type SupportedLocale,
} from "@/graphql/locale-to-wp-language";
import { BlogAuthorSlugsQuery } from "@/graphql/pages/blog-author.query";
import { BlogPostSlugsQuery } from "@/graphql/pages/blog-post.query";



function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

const DEFAULT_SITE_URL = "https://vazinovacao.vercel.app";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

function localePrefix(locale: SupportedLocale): string {
  return locale === "pt-BR" ? "" : `/${locale}`;
}

async function fetchAllPostSlugs(locale: SupportedLocale): Promise<string[]> {
  const slugs: string[] = [];
  let afterCursor: string | null = null;

  while (true) {
    const data = await execute(BlogPostSlugsQuery, {
      language: resolveWpLanguage(locale),
      first: 100,
      after: afterCursor,
    });

    const nodes = data.posts?.nodes || [];
    for (const node of nodes) {
      if (node?.slug) {
        slugs.push(node.slug);
      }
    }

    const pageInfo = data.posts?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) {
      break;
    }

    afterCursor = pageInfo.endCursor;
  }

  return slugs;
}

async function fetchAllAuthorSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let afterCursor: string | null = null;

  while (true) {
    const data = await execute(BlogAuthorSlugsQuery, {
      first: 100,
      after: afterCursor,
    });

    const nodes = data.users?.nodes || [];
    for (const node of nodes) {
      if (node?.slug) {
        slugs.push(node.slug);
      }
    }

    const pageInfo = data.users?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) {
      break;
    }

    afterCursor = pageInfo.endCursor;
  }

  return slugs;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const baseUrl = resolveBaseUrl(req);
  const locales = Object.keys(localeToWpLanguage) as SupportedLocale[];

  const [postsByLocale, authorSlugs] = await Promise.all([
    Promise.all(
      locales.map(async (locale) => ({
        locale,
        slugs: await fetchAllPostSlugs(locale),
      })),
    ),
    fetchAllAuthorSlugs(),
  ]);

  const urls = new Set<string>();
  for (const locale of locales) {
    const prefix = localePrefix(locale);
    urls.add(`${baseUrl}${prefix}/`);
    urls.add(`${baseUrl}${prefix}/blog`);
  }

  for (const { locale, slugs } of postsByLocale) {
    const prefix = localePrefix(locale);
    for (const slug of slugs) {
      urls.add(`${baseUrl}${prefix}/blog/${slug}`);
    }
  }

  for (const authorSlug of authorSlugs) {
    urls.add(`${baseUrl}/blog/author/${authorSlug}`);
    urls.add(`${baseUrl}/en-US/blog/author/${authorSlug}`);
  }

  const urlEntries = Array.from(urls)
    .sort((a, b) => a.localeCompare(b))
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;