import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<"blog_posts"> & {
  blog_categories?: { name: string; slug: string } | null;
};

const BlogCard = ({ post }: { post: BlogPost }) => {
  const date = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <article className="border-b border-foreground/10 pb-8 mb-8">
        {post.featured_image_url && (
          <div className="aspect-[16/9] overflow-hidden mb-6">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              loading="lazy"
            />
          </div>
        )}

        <div className="space-y-3">
          {post.blog_categories && (
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              {post.blog_categories.name}
            </span>
          )}

          <h2 className="text-2xl md:text-3xl font-normal font-serif text-foreground group-hover:text-muted-foreground transition-colors leading-tight">
            {post.title}
          </h2>

          {post.summary && (
            <p className="text-base text-muted-foreground leading-relaxed line-clamp-3">
              {post.summary}
            </p>
          )}

          <p className="text-xs text-muted-foreground/60">{date}</p>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
