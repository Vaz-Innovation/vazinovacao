import { Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { type FragmentType, graphql, useFragment } from "@/graphql/__gen__";
import { formatPostDate } from "@/features/blog/utils/format-post-date";
import { localizeBlogHtml } from "@/features/blog/utils/localize-blog-html";

export const BlogPostCardFragment = graphql(/* GraphQL */ `
  fragment BlogPostCard_PostFragment on Post {
    id
    title
    slug
    date
    excerpt
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
    tags {
      nodes {
        ...TaxonomyChip_TermFragment
      }
    }
    categories {
      nodes {
        ...TaxonomyChip_TermFragment
      }
    }
  }
`);

interface BlogPostCardProps {
  post: FragmentType<typeof BlogPostCardFragment>;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const postData = useFragment(BlogPostCardFragment, post);

  if (!postData.slug) {
    return null;
  }

  const date = formatPostDate(postData.date);
  const localizedExcerpt = localizeBlogHtml(postData.excerpt);

  return (
    <Link href={`/blog/${postData.slug}`} className="group block">
      <article className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {postData.featuredImage?.node?.sourceUrl ? (
            <Image
              src={postData.featuredImage.node.sourceUrl}
              alt={postData.featuredImage.node.altText || postData.title || "Imagem destacada"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <svg
                className="w-12 h-12 text-muted-foreground/40"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h2 className="text-lg font-semibold text-foreground leading-snug line-clamp-2 mb-3">
            {postData.title}
          </h2>

          {date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
          )}

          {localizedExcerpt && (
            <div
              className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1"
              dangerouslySetInnerHTML={{ __html: localizedExcerpt }}
            />
          )}

          <div className="flex items-center gap-1 text-sm font-medium text-primary mt-auto">
            Ler mais <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </article>
    </Link>
  );
}
