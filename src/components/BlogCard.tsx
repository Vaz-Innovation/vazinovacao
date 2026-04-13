import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
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
      <article className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
        {post.featured_image_url && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          <h2 className="text-lg font-semibold text-foreground leading-snug line-clamp-2 mb-3">
            {post.title}
          </h2>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{date}</span>
          </div>

          {post.summary && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
              {post.summary}
            </p>
          )}

          <div className="flex items-center gap-1 text-sm font-medium text-primary mt-auto">
            Ler mais <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
