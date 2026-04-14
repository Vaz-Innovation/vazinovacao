import type { VariablesOf } from "@graphql-typed-document-node/core";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";

import { BlogFilters } from "@/features/blog/components/blog-filters";
import {
  BlogPostCard,
  BlogPostCardFragment,
} from "@/features/blog/components/blog-post-card";
import { BLOG_PAGE_SIZE } from "@/features/blog/constants";
import { NewsletterSubscribeCard } from "@/features/blog/components/newsletter-subscribe-card";
import { TaxonomyChipFragment } from "@/features/blog/components/taxonomy-chip";
import { useFragment as readFragment } from "@/graphql/__gen__";
import { execute } from "@/graphql/execute";
import { resolveWpLanguage } from "@/graphql/locale-to-wp-language";
import { gqlQueryOptions } from "@/graphql/gqlpc";
import {
  BlogListOnQueryFragment,
  BlogListPageInfoQuery,
  BlogListPageQuery,
} from "@/graphql/pages/blog-list.query";

interface BlogPaginatedPageProps {
  queryInput: VariablesOf<typeof BlogListPageQuery>;
  page: number;
}

function hrefForBlogPage(page: number): string {
  if (page <= 1) {
    return "/blog";
  }

  return `/blog/page/${page}`;
}

async function getCursorBeforePage(
  page: number,
  language?: VariablesOf<typeof BlogListPageInfoQuery>["language"],
) {
  let afterCursor: string | undefined;

  if (page <= 1) {
    return { hasPage: true, afterCursor };
  }

  for (let index = 1; index < page; index += 1) {
    const data = await execute(BlogListPageInfoQuery, {
      language,
      first: BLOG_PAGE_SIZE,
      after: afterCursor,
    });

    const pageInfo = data.posts?.pageInfo;
    const hasNextPage = Boolean(pageInfo?.hasNextPage);
    const endCursor = pageInfo?.endCursor || undefined;

    if (!hasNextPage || !endCursor) {
      return { hasPage: false, afterCursor };
    }

    afterCursor = endCursor;
  }

  return { hasPage: true, afterCursor };
}

export default function BlogPaginatedPage({
  queryInput,
  page,
}: BlogPaginatedPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const { data, isLoading } = useQuery(
    gqlQueryOptions(BlogListPageQuery, { input: queryInput }),
  );
  const queryData = readFragment(BlogListOnQueryFragment, data);

  const postNodes = useMemo(
    () => (queryData?.blogPosts?.nodes || []).filter(Boolean),
    [queryData?.blogPosts?.nodes],
  );

  const posts = useMemo(
    () =>
      postNodes.map((postNode) => ({
        node: postNode!,
        data: readFragment(BlogPostCardFragment, postNode!),
      })),
    [postNodes],
  );

  const tags = useMemo(
    () =>
      Array.from(
        new Set(
          posts.flatMap((post) =>
            (post.data.tags?.nodes || [])
              .map((tag) => (tag ? readFragment(TaxonomyChipFragment, tag).name : null))
              .filter((tagName): tagName is string => Boolean(tagName)),
          ),
        ),
      ).sort(),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const postTitle = post.data.title?.toLowerCase() || "";
      const postExcerpt = post.data.excerpt?.toLowerCase() || "";
      const normalizedSearch = searchQuery.trim().toLowerCase();

      const matchesSearch = normalizedSearch
        ? postTitle.includes(normalizedSearch) || postExcerpt.includes(normalizedSearch)
        : true;

      const matchesTag = selectedTag
        ? (post.data.tags?.nodes || []).some((tag) => {
            if (!tag) {
              return false;
            }
            return readFragment(TaxonomyChipFragment, tag).name === selectedTag;
          })
        : true;

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  const hasNextPage = Boolean(queryData?.blogPosts?.pageInfo?.hasNextPage);

  return (
    <>
      <Head>
        <title>{`Blog | Pagina ${page} | Vaz Inovação`}</title>
        <meta
          name="description"
          content="Artigos, análises e experimentos sobre tecnologia, criatividade e inovação."
        />
      </Head>

      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link
              href="/"
              className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Vaz Inovação
            </Link>
            <h1 className="text-lg font-semibold">Blog</h1>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-6 py-6">
          <BlogFilters
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedTag={selectedTag}
            onSelectedTagChange={setSelectedTag}
            tags={tags}
          />
        </section>

        <main className="max-w-7xl mx-auto px-6 pb-16">
          {isLoading && !data ? (
            <p className="text-center text-muted-foreground py-24 text-lg">Carregando artigos...</p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-24 text-lg">
              Nenhum artigo encontrado.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <div key={post.data.id || `${post.data.slug || "post"}-${index}`}>
                  <BlogPostCard post={post.node} />
                  {index === 2 && <NewsletterSubscribeCard compact />}
                </div>
              ))}
              {filteredPosts.length <= 2 && <NewsletterSubscribeCard compact />}
            </div>
          )}

          <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Paginacao do blog">
            {page > 1 && (
              <Link
                href={hrefForBlogPage(page - 1)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-foreground/10 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                Anterior
              </Link>
            )}

            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-foreground/30 px-3 text-sm font-medium">
              {page}
            </span>

            {hasNextPage && (
              <Link
                href={hrefForBlogPage(page + 1)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-foreground/10 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                Proxima
              </Link>
            )}
          </nav>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<BlogPaginatedPageProps> = async ({
  locale,
  params,
}) => {
  const queryClient = new QueryClient();
  const pageParam = typeof params?.page === "string" ? Number(params.page) : Number.NaN;

  if (!Number.isInteger(pageParam) || pageParam < 1) {
    return {
      notFound: true,
      revalidate: 30,
    };
  }

  const language = resolveWpLanguage(locale);
  const cursorState = await getCursorBeforePage(pageParam, language);

  if (!cursorState.hasPage) {
    return {
      notFound: true,
      revalidate: 30,
    };
  }

  const queryInput: VariablesOf<typeof BlogListPageQuery> = {
    first: BLOG_PAGE_SIZE,
    after: cursorState.afterCursor ?? null,
    language,
  };

  try {
    const data = await queryClient.fetchQuery(
      gqlQueryOptions(BlogListPageQuery, { input: queryInput }),
    );
    const queryData = readFragment(BlogListOnQueryFragment, data);

    const hasPosts = Boolean((queryData?.blogPosts?.nodes || []).filter(Boolean).length);
    if (!hasPosts) {
      return {
        notFound: true,
        revalidate: 30,
      };
    }
  } catch {
    return {
      notFound: true,
      revalidate: 30,
    };
  }

  return {
    props: {
      page: pageParam,
      queryInput,
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const hasLocales = Boolean(locales?.length);
  const activeLocales = hasLocales ? locales! : ["pt-BR"];

  const paths: Array<{ params: { page: string }; locale?: string }> = [];

  for (const locale of activeLocales) {
    try {
      let page = 1;
      let afterCursor: string | undefined;

      while (true) {
        if (hasLocales) {
          paths.push({ params: { page: String(page) }, locale });
        } else {
          paths.push({ params: { page: String(page) } });
        }

        const data = await execute(BlogListPageInfoQuery, {
          language: resolveWpLanguage(locale),
          first: BLOG_PAGE_SIZE,
          after: afterCursor,
        });

        const pageInfo = data.posts?.pageInfo;
        if (!pageInfo?.hasNextPage || !pageInfo.endCursor) {
          break;
        }

        afterCursor = pageInfo.endCursor;
        page += 1;
      }
    } catch {
      if (hasLocales) {
        paths.push({ params: { page: "1" }, locale });
      } else {
        paths.push({ params: { page: "1" } });
      }
    }
  }

  return {
    paths,
    fallback: "blocking",
  };
};
