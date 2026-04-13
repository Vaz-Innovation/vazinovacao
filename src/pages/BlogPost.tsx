import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import DOMPurify from "dompurify";

type BlogPostData = Tables<"blog_posts"> & {
  blog_categories: { name: string; slug: string } | null;
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(name, slug)")
        .eq("slug", slug!)
        .eq("published", true)
        .maybeSingle();

      setPost(data as BlogPostData | null);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  // Dynamic meta tags
  useEffect(() => {
    if (post) {
      document.title = post.meta_title || post.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", post.meta_description || post.summary || "");
      }
    }
    return () => {
      document.title = "Vaz Inovação";
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-serif gap-6">
        <p className="text-2xl">Artigo não encontrado</p>
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground underline">
          Voltar ao blog
        </Link>
      </div>
    );
  }

  const date = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-serif">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
          <Link to="/blog" className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
            ← Blog
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Meta */}
        <div className="mb-8 space-y-4">
          {post.blog_categories && (
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              {post.blog_categories.name}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-tight">
            {post.title}
          </h1>
          <p className="text-sm text-muted-foreground/60">{date}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs border border-foreground/10 px-3 py-1 text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Featured image */}
        {post.featured_image_url && (
          <div className="mb-12">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full"
            />
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div
            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-foreground prose-a:underline prose-img:rounded-none prose-blockquote:border-foreground/20 prose-blockquote:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        )}
      </article>
    </div>
  );
};

export default BlogPost;
