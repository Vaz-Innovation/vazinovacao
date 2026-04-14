import { Calendar, ArrowRight } from "lucide-react";
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
        {postData.featuredImage?.node?.sourceUrl && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={postData.featuredImage.node.sourceUrl}
              alt={postData.featuredImage.node.altText || postData.title || "Imagem destacada"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}

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
