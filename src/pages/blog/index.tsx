import type { VariablesOf } from "@graphql-typed-document-node/core";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";

import { BlogFilters } from "@/features/blog/components/blog-filters";
import { BLOG_PAGE_SIZE } from "@/features/blog/constants";
import {
  BlogPostCard,
  BlogPostCardFragment,
} from "@/features/blog/components/blog-post-card";
import { NewsletterSubscribeCard } from "@/features/blog/components/newsletter-subscribe-card";
import { TaxonomyChipFragment } from "@/features/blog/components/taxonomy-chip";
import { useFragment as readFragment } from "@/graphql/__gen__";
import { resolveWpLanguage } from "@/graphql/locale-to-wp-language";
import { gqlQueryOptions } from "@/graphql/gqlpc";
import {
  BlogListOnQueryFragment,
  BlogListPageQuery,
} from "@/graphql/pages/blog-list.query";

interface BlogPageProps {
  queryInput: VariablesOf<typeof BlogListPageQuery>;
}

export default function BlogPage({ queryInput }: BlogPageProps) {
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

  const hasNextPage = Boolean(queryData?.blogPosts?.pageInfo?.hasNextPage);

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

  return (
    <>
      <Head>
        <title>Blog | Vaz Inovação</title>
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

          {hasNextPage && (
            <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Paginacao do blog">
              <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-foreground/30 px-3 text-sm font-medium">
                1
              </span>
              <Link
                href="/blog/page/2"
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-foreground/10 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                2
              </Link>
            </nav>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<BlogPageProps> = async ({ locale }) => {
  const queryClient = new QueryClient();

  const queryInput: VariablesOf<typeof BlogListPageQuery> = {
    first: BLOG_PAGE_SIZE,
    language: resolveWpLanguage(locale),
  };

  try {
    await queryClient.fetchQuery(gqlQueryOptions(BlogListPageQuery, { input: queryInput }));
  } catch {
    // Build can proceed even if WordPress is unreachable; page will re-fetch at runtime.
  }

  return {
    props: {
      queryInput,
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
};
