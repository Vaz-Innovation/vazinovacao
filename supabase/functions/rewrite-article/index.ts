const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, content, summary } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip HTML for AI processing
    const plainText = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    const systemPrompt = `Você é um redator especializado da Vaz Inovação, uma consultoria brasileira de inovação e tecnologia.

Sua tarefa é REESCREVER COMPLETAMENTE um artigo importado, criando um texto ORIGINAL e ÚNICO. 

REGRAS OBRIGATÓRIAS:
1. REESCREVA todo o conteúdo com suas próprias palavras — NÃO copie frases ou parágrafos do original
2. Adapte o conteúdo para a perspectiva da Vaz Inovação, como se fosse uma análise/opinião própria da empresa
3. REMOVA COMPLETAMENTE qualquer menção a:
   - Nomes de publicações originais (Fast Company, Forbes, TechCrunch, etc.)
   - Links para redes sociais de terceiros (Twitter, LinkedIn, Instagram de outras empresas)
   - Créditos de autores externos
   - Referências como "segundo o site X", "de acordo com Y"
   - Qualquer URL externa
4. Use tom profissional mas acessível, em português brasileiro
5. Mantenha a essência do tema mas traga insights e perspectivas originais
6. Estruture com subtítulos (h2), parágrafos curtos e listas quando apropriado
7. O texto deve parecer que foi escrito originalmente pela Vaz Inovação

FORMATO DE SAÍDA: Retorne APENAS HTML limpo usando tags: h2, h3, p, strong, em, ul, ol, li, blockquote. NÃO inclua links (<a>), imagens (<img>), ou qualquer tag com atributos. NÃO inclua o título principal (h1).`;

    const userPrompt = `Reescreva completamente este artigo:\n\nTítulo original: ${title}\n\nConteúdo:\n${plainText.slice(0, 8000)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: `AI error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const rewrittenContent = aiData.choices?.[0]?.message?.content || "";

    // Also generate a new title and summary
    const metaResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "Você é um redator da Vaz Inovação. Responda APENAS em JSON válido, sem markdown.",
          },
          {
            role: "user",
            content: `Com base neste artigo reescrito, gere em JSON:
{"title": "novo título original (max 80 chars)", "summary": "resumo em 2 frases (max 280 chars)", "meta_title": "título SEO (max 60 chars)", "meta_description": "descrição SEO (max 155 chars)"}

Artigo:
${rewrittenContent.slice(0, 3000)}`,
          },
        ],
      }),
    });

    let newTitle = title;
    let newSummary = summary || "";
    let newMetaTitle = "";
    let newMetaDescription = "";

    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      const metaText = metaData.choices?.[0]?.message?.content || "";
      try {
        // Extract JSON from response (may have markdown backticks)
        const jsonMatch = metaText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          newTitle = parsed.title || title;
          newSummary = parsed.summary || summary || "";
          newMetaTitle = parsed.meta_title || "";
          newMetaDescription = parsed.meta_description || "";
        }
      } catch {
        console.error("Failed to parse meta JSON:", metaText);
      }
    }

    return new Response(
      JSON.stringify({
        title: newTitle,
        content: rewrittenContent,
        summary: newSummary,
        meta_title: newMetaTitle,
        meta_description: newMetaDescription,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("rewrite error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
