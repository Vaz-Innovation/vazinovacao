import type { VariablesOf } from "@graphql-typed-document-node/core";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { BlogPostCard } from "@/features/blog/components/blog-post-card";
import { BlogPostCardFragment } from "@/features/blog/components/blog-post-card";
import {
  BlogPostHeader,
  BlogPostHeaderFragment,
} from "@/features/blog/components/blog-post-header";
import { BlogAuthorCard } from "@/features/blog/components/organisms/blog-author-card";
import { NewsletterSubscribeCard } from "@/features/blog/components/newsletter-subscribe-card";
import { stripHtml } from "@/features/blog/utils/strip-html";
import { useFragment as readFragment } from "@/graphql/__gen__";
import { execute } from "@/graphql/execute";
import { resolveWpLanguage } from "@/graphql/locale-to-wp-language";
import { gqlQueryOptions } from "@/graphql/gqlpc";
import {
  BlogPostOnQueryFragment,
  BlogPostPageQuery,
  BlogPostSlugsQuery,
} from "@/graphql/pages/blog-post.query";
import { localizeBlogHtml } from "@/features/blog/utils/localize-blog-html";

interface BlogPostPageProps {
  queryInput: VariablesOf<typeof BlogPostPageQuery>;
}

export default function BlogPostPage({ queryInput }: BlogPostPageProps) {
  const { data, isLoading } = useQuery(
    gqlQueryOptions(BlogPostPageQuery, { input: queryInput }),
  );
  const queryData = readFragment(BlogPostOnQueryFragment, data);

  const post = queryData?.post;

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg text-muted-foreground">Carregando artigo...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-serif gap-6">
        <p className="text-2xl">Artigo não encontrado</p>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Voltar ao blog
        </Link>
      </div>
    );
  }

  const postHeaderData = readFragment(BlogPostHeaderFragment, post);
  const authorNode = post.author?.node;

  const relatedPosts = (queryData?.relatedPosts?.nodes || [])
    .filter(Boolean)
    .map((candidate) => ({
      node: candidate!,
      data: readFragment(BlogPostCardFragment, candidate!),
    }))
    .filter(
      (candidate) =>
        candidate.data.slug && candidate.data.slug !== postHeaderData.slug,
    )
    .slice(0, 3);

  const title = postHeaderData.title || "Artigo";
  const description =
    stripHtml(postHeaderData.excerpt) || "Conteudo do blog da Vaz Inovacao.";

  return (
    <>
      <Head>
        <title>{`${title} | Vaz Inovação`}</title>
        <meta name="description" content={description} />
      </Head>

      <div className="relative min-h-screen bg-background text-foreground font-serif">
        <header className="border-b border-foreground/10 sticky top-0 z-[99] bg-background">
          <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
            <Link
              href="/blog"
              className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Blog
            </Link>
          </div>
        </header>

        <article className="max-w-3xl mx-auto px-6 py-16">
          <BlogPostHeader post={post} />

          {authorNode && (
            <div className="mb-10">
              <BlogAuthorCard author={authorNode} />
            </div>
          )}

          {post.content && (
            <div
              className="blog-article-content"
              dangerouslySetInnerHTML={{
                __html: localizeBlogHtml(post.content),
              }}
            />
          )}

          <NewsletterSubscribeCard />
        </article>

        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 pb-16">
            <h2 className="text-2xl font-normal mb-6">
              Conteúdos relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <BlogPostCard
                  key={
                    relatedPost.data.id ||
                    `${relatedPost.data.slug || "related"}-${index}`
                  }
                  post={relatedPost.node}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const allPaths = [] as Array<{ params: { slug: string }; locale?: string }>;
  const hasLocales = Boolean(locales?.length);
  const activeLocales = hasLocales ? locales! : ["pt-BR"];

  for (const locale of activeLocales) {
    try {
      let afterCursor: string | undefined;

      while (true) {
        const data = await execute(BlogPostSlugsQuery, {
          language: resolveWpLanguage(locale),
          first: 100,
          after: afterCursor,
        });

        const localePaths = (data.posts?.nodes || [])
          .map((node) => node?.slug)
          .filter((value): value is string => Boolean(value))
          .map((value) =>
            hasLocales
              ? { params: { slug: value }, locale }
              : { params: { slug: value } },
          );

        allPaths.push(...localePaths);

        const pageInfo = data.posts?.pageInfo;
        if (!pageInfo?.hasNextPage || !pageInfo.endCursor) {
          break;
        }

        afterCursor = pageInfo.endCursor;
      }
    } catch {
      // Ignore locale-specific static path discovery errors during build.
    }
  }

  return {
    paths: allPaths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({
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
  const queryInput: VariablesOf<typeof BlogPostPageQuery> = {
    slug,
    language: resolveWpLanguage(locale),
  };

  try {
    const data = await queryClient.fetchQuery(
      gqlQueryOptions(BlogPostPageQuery, { input: queryInput }),
    );
    const queryData = readFragment(BlogPostOnQueryFragment, data);

    if (!queryData.post) {
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
