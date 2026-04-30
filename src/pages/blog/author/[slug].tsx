import type { VariablesOf } from "@graphql-typed-document-node/core";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import {
  BlogPostCard,
  BlogPostCardFragment,
} from "@/features/blog/components/blog-post-card";
import { BLOG_PAGE_SIZE } from "@/features/blog/constants";
import {
  BlogAuthorCard,
  BlogAuthorCardAuthorFragment,
} from "@/features/blog/components/organisms/blog-author-card";
import { useFragment as readFragment } from "@/graphql/__gen__";
import { execute } from "@/graphql/execute";
import { resolveWpLanguage } from "@/graphql/locale-to-wp-language";
import { gqlQueryOptions } from "@/graphql/gqlpc";
import {
  BlogAuthorPageOnQueryFragment,
  BlogAuthorPageQuery,
  BlogAuthorSlugsQuery,
} from "@/graphql/pages/blog-author.query";

interface BlogAuthorPageProps {
  queryInput: VariablesOf<typeof BlogAuthorPageQuery>;
}

export default function BlogAuthorPage({ queryInput }: BlogAuthorPageProps) {
  const { data, isLoading } = useQuery(
    gqlQueryOptions(BlogAuthorPageQuery, { input: queryInput }),
  );
  const queryData = readFragment(BlogAuthorPageOnQueryFragment, data);

  const authorNode =
    (queryData?.blogAuthor?.nodes || []).filter(Boolean)[0] || null;
  const authorData = authorNode
    ? readFragment(BlogAuthorCardAuthorFragment, authorNode)
    : null;
  const posts = (queryData?.authorPosts?.nodes || [])
    .filter(Boolean)
    .map((postNode) => ({
      node: postNode!,
      data: readFragment(BlogPostCardFragment, postNode!),
    }));

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg text-muted-foreground">Carregando autor...</p>
      </div>
    );
  }

  if (!authorNode || !authorData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-serif gap-6">
        <p className="text-2xl">Autor não encontrado</p>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Voltar ao blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${authorData.name || "Autor"} | Vaz Inovação`}</title>
        <meta
          name="description"
          content={
            authorData.description ||
            "Perfil de autor e artigos publicados no blog."
          }
        />
      </Head>

      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border sticky top-0 z-[99] bg-background">
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

        <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
          <BlogAuthorCard author={authorNode} />

          <section>
            <h2 className="text-2xl font-semibold mb-6">
              Artigos de {authorData.name || "autor"}
            </h2>

            {posts.length === 0 ? (
              <p className="text-muted-foreground">
                Este autor ainda não publicou artigos visíveis.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <BlogPostCard
                    key={
                      post.data.id ||
                      `${post.data.slug || "author-post"}-${index}`
                    }
                    post={post.node}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<BlogAuthorPageProps> = async ({
  params,
  locale,
}) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";

  if (!slug) {
    return {
      notFound: true,
      revalidate: 30,
    };
  }

  const queryClient = new QueryClient();
  const queryInput: VariablesOf<typeof BlogAuthorPageQuery> = {
    slug,
    first: BLOG_PAGE_SIZE,
    language: resolveWpLanguage(locale),
  };

  try {
    const data = await queryClient.fetchQuery(
      gqlQueryOptions(BlogAuthorPageQuery, { input: queryInput }),
    );
    const queryData = readFragment(BlogAuthorPageOnQueryFragment, data);

    const authorNode = (queryData?.blogAuthor?.nodes || []).filter(Boolean)[0];
    if (!authorNode) {
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
      queryInput,
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const hasLocales = Boolean(locales?.length);
  const activeLocales = hasLocales ? locales! : ["pt-BR"];

  const paths: Array<{ params: { slug: string }; locale?: string }> = [];

  for (const locale of activeLocales) {
    try {
      let afterCursor: string | undefined;

      while (true) {
        const data = await execute(BlogAuthorSlugsQuery, {
          first: 100,
          after: afterCursor,
        });

        const localePaths = (data.users?.nodes || [])
          .map((node) => node?.slug)
          .filter((value): value is string => Boolean(value))
          .map((value) =>
            hasLocales
              ? { params: { slug: value }, locale }
              : { params: { slug: value } },
          );

        paths.push(...localePaths);

        const pageInfo = data.users?.pageInfo;
        if (!pageInfo?.hasNextPage || !pageInfo.endCursor) {
          break;
        }

        afterCursor = pageInfo.endCursor;
      }
    } catch {
      // Ignore author slug discovery errors during build.
    }
  }

  return {
    paths,
    fallback: "blocking",
  };
};
