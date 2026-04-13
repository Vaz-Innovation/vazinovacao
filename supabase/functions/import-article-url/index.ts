const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try Firecrawl first, fallback to basic fetch
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");

    let title = "";
    let content = "";
    let summary = "";
    let meta_title = "";
    let meta_description = "";

    if (apiKey) {
      // Use Firecrawl
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["html", "markdown"],
          onlyMainContent: true,
        }),
      });

      const data = await response.json();
      const scraped = data.data || data;

      title = scraped?.metadata?.title || "";
      meta_description = scraped?.metadata?.description || "";
      meta_title = title.slice(0, 60);

      // Convert markdown to clean HTML
      const markdown = scraped?.markdown || "";
      content = markdownToHtml(markdown);
      summary = (meta_description || markdown.slice(0, 300)).slice(0, 300);
    } else {
      // Basic fetch fallback
      const response = await fetch(url);
      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
      title = titleMatch ? titleMatch[1].trim() : "";
      meta_title = title.slice(0, 60);

      // Extract meta description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/is);
      meta_description = descMatch ? descMatch[1].slice(0, 160) : "";

      // Extract article body
      const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/is) ||
                          html.match(/<main[^>]*>([\s\S]*?)<\/main>/is);
      const rawContent = articleMatch ? articleMatch[1] : "";

      // Clean HTML
      content = rawContent
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      summary = meta_description || content.replace(/<[^>]+>/g, "").slice(0, 300);
    }

    return new Response(
      JSON.stringify({ title, content, summary, meta_title, meta_description }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h2>$1</h2>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/^> (.*$)/gim, "<blockquote><p>$1</p></blockquote>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hulo]|<block|<img)(.*)/gim, "<p>$1</p>")
    .replace(/<p><\/p>/g, "")
    .replace(/<p>\s*<\/p>/g, "");
}
