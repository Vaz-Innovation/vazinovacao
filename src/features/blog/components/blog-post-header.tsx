import Image from "next/image";

import { type FragmentType, graphql, useFragment } from "@/graphql/__gen__";
import { TaxonomyChip } from "@/features/blog/components/taxonomy-chip";
import { formatPostDate } from "@/features/blog/utils/format-post-date";
import { localizeBlogHtml } from "@/features/blog/utils/localize-blog-html";

export const BlogPostHeaderFragment = graphql(/* GraphQL */ `
  fragment BlogPostHeader_PostFragment on Post {
    id
    slug
    title
    excerpt
    date
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
    categories {
      nodes {
        ...TaxonomyChip_TermFragment
      }
    }
    tags {
      nodes {
        ...TaxonomyChip_TermFragment
      }
    }
  }
`);

interface BlogPostHeaderProps {
  post: FragmentType<typeof BlogPostHeaderFragment>;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const postData = useFragment(BlogPostHeaderFragment, post);

  const date = formatPostDate(postData.date);
  const localizedExcerpt = localizeBlogHtml(postData.excerpt);

  return (
    <div className="mb-12 space-y-4">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal leading-tight">
        {postData.title}
      </h1>

      {localizedExcerpt && (
        <div
          className="text-lg text-muted-foreground leading-relaxed mt-4"
          dangerouslySetInnerHTML={{ __html: localizedExcerpt }}
        />
      )}

      {date && <p className="text-sm text-muted-foreground/60">{date}</p>}

      <div className="flex flex-wrap gap-2 mt-4">
        {(postData.categories?.nodes || []).filter(Boolean).map((category, index) => (
          <TaxonomyChip
            key={`category-${index}`}
            term={category!}
          />
        ))}
        {(postData.tags?.nodes || []).filter(Boolean).map((tag, index) => (
          <TaxonomyChip
            key={`tag-${index}`}
            term={tag!}
          />
        ))}
      </div>

      {postData.featuredImage?.node?.sourceUrl && (
        <div className="pt-4">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
            src={postData.featuredImage.node.sourceUrl}
            alt={postData.featuredImage.node.altText || postData.title || "Imagem destacada"}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
