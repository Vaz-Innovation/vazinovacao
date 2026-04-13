import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BlogCard from "@/components/BlogCard";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<"blog_posts"> & {
  blog_categories: { name: string; slug: string } | null;
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Tables<"blog_categories">[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [postsRes, catsRes] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("*, blog_categories(name, slug)")
          .eq("published", true)
          .order("created_at", { ascending: false }),
        supabase.from("blog_categories").select("*").order("name"),
      ]);

      if (postsRes.data) setPosts(postsRes.data as BlogPost[]);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = selectedCategory
    ? posts.filter((p) => p.blog_categories?.slug === selectedCategory)
    : posts;

  return (
    <div className="min-h-screen bg-background text-foreground font-serif">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
          <Link to="/" className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
            Vaz Inovação
          </Link>
          <h1 className="text-lg font-normal">Blog</h1>
        </div>
      </header>

      {/* Categories filter */}
      {categories.length > 0 && (
        <nav className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-xs tracking-widest uppercase transition-colors ${
                !selectedCategory ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`text-xs tracking-widest uppercase transition-colors ${
                  selectedCategory === cat.slug ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Posts */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-24 text-lg italic">
            Nenhum artigo publicado ainda.
          </p>
        ) : (
          <div>
            {filtered.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
