import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import DOMPurify from "dompurify";

type BlogPostData = Tables<"blog_posts"> & {
  blog_categories: { name: string; slug: string } | null;
};

/**
 * Cleans raw HTML from scraped articles:
 * - Strips social share divs, nav, script, style, iframe
 * - Removes class/style/id/data-* attributes
 * - Ensures paragraphs have proper spacing
 */
const cleanArticleHtml = (raw: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "text/html");

  // Remove unwanted elements
  const removeSelectors = [
    "script", "style", "iframe", "nav", "footer", "header",
    ".social", ".share", ".fcbr_social", "[class*=social]",
    "[class*=share]", "[class*=newsletter]", "[class*=sidebar]",
    "[class*=related]", "[class*=comment]", "[class*=ad-]",
    "[class*=advertisement]", "svg",
    "[class*=author]", "[class*=byline]", "[class*=credit]",
    "[class*=source]", "[class*=origin]", "[class*=logo]",
    "[class*=brand]", "[class*=masthead]", "[class*=site-name]",
    "[class*=publisher]", "[class*=copyright]",
  ];
  removeSelectors.forEach((sel) => {
    try {
      doc.querySelectorAll(sel).forEach((el) => el.remove());
    } catch { /* ignore invalid selectors */ }
  });

  // Clean attributes from all elements
  const allElements = doc.body.querySelectorAll("*");
  allElements.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    // Remove all attributes except href/src/alt
    const attrs = [...el.attributes];
    attrs.forEach((attr) => {
      if (!["href", "src", "alt"].includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
    // Convert divs with only text to paragraphs
    if (tag === "div" && el.children.length === 0 && el.textContent?.trim()) {
      const p = doc.createElement("p");
      p.innerHTML = el.innerHTML;
      el.replaceWith(p);
    }
  });

  // Remove all links - replace <a> tags with just their text content
  const allLinks = doc.body.querySelectorAll("a");
  allLinks.forEach((a) => {
    const text = doc.createTextNode(a.textContent || "");
    a.replaceWith(text);
  });

  // Get the cleaned HTML
  let html = doc.body.innerHTML;

  // Remove references to original source names (common patterns)
  html = html.replace(/Fast\s*Company\s*(Brasil)?/gi, "");
  html = html.replace(/Publicado\s*(originalmente\s*)?(em|por)\s*[^<.]*/gi, "");
  html = html.replace(/Fonte:\s*[^<.]*/gi, "");
  html = html.replace(/Via:\s*[^<.]*/gi, "");

  // If no <p> tags, wrap text blocks in paragraphs
  if (!html.includes("<p")) {
    html = html
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => (block.startsWith("<") ? block : `<p>${block}</p>`))
      .join("\n");
  }

  // Remove empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
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

  const cleanedContent = post.content ? cleanArticleHtml(post.content) : "";

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
        <div className="mb-12 space-y-4">
          {post.blog_categories && (
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              {post.blog_categories.name}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal leading-tight">
            {post.title}
          </h1>
          {post.summary && (
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              {post.summary}
            </p>
          )}
          <p className="text-sm text-muted-foreground/60">{date}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
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
        {cleanedContent && (
          <div
            className="blog-article-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cleanedContent) }}
          />
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 pt-8 border-t border-foreground/10 text-center">
          <h3 className="text-xl font-normal mb-2">Gostou? Receba mais conteúdos como este</h3>
          <p className="text-sm text-muted-foreground mb-4">Insights semanais sobre tecnologia e inovação.</p>
          <iframe
            src="https://subscribe-forms.beehiiv.com/822dceb7-ab66-4012-86cd-ce2fed390c34"
            className="beehiiv-embed mx-auto w-full max-w-md"
            data-test-id="beehiiv-embed"
            frameBorder="0"
            scrolling="no"
            style={{ height: 100, background: "transparent", border: "none" }}
          />
        </div>

        {/* Reference link */}
        {(post as any).source_url && (
          <div className="mt-16 pt-8 border-t border-foreground/10">
            <p className="text-sm text-muted-foreground">
              Artigo de referência:{" "}
              <a
                href={(post as any).source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                {(post as any).source_url}
              </a>
            </p>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
