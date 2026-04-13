import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BlogCard from "@/components/BlogCard";
import NewsletterCard from "@/components/NewsletterCard";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<"blog_posts"> & {
  blog_categories: { name: string; slug: string } | null;
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Tables<"blog_categories">[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filtered = posts.filter((p) => {
    const matchesCategory = selectedCategory
      ? p.blog_categories?.slug === selectedCategory
      : true;
    const matchesSearch = searchQuery
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // Collect unique tags from posts
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags ?? []))
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Vaz Inovação
          </Link>
          <h1 className="text-lg font-semibold">Blog</h1>
        </div>
      </header>

      {/* Filters bar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Tags dropdown - simple select */}
          {allTags.length > 0 && (
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                className="pl-9 pr-8 py-2.5 rounded-lg border border-border bg-card text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                defaultValue=""
              >
                <option value="">Todas as tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* Posts grid */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-24 text-lg">
            Nenhum artigo encontrado.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, index) => (
              <React.Fragment key={post.id}>
                <BlogCard post={post} />
                {index === 2 && <NewsletterCard />}
              </React.Fragment>
            ))}
            {filtered.length <= 2 && <NewsletterCard />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
