import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

const AdminBlog = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");

  // Data
  const [categories, setCategories] = useState<Tables<"blog_categories">[]>([]);
  const [posts, setPosts] = useState<Tables<"blog_posts">[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("blog_categories").select("*").order("name");
    if (data) setCategories(data);
  };

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingId) setSlug(generateSlug(value));
  };

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-article-url", {
        body: { url: importUrl },
      });
      if (error) throw error;
      if (data) {
        if (data.title) { setTitle(data.title); setSlug(generateSlug(data.title)); }
        if (data.content) setContent(data.content);
        if (data.summary) setSummary(data.summary);
        if (data.meta_title) setMetaTitle(data.meta_title);
        if (data.meta_description) setMetaDescription(data.meta_description);
        toast({ title: "Conteúdo importado com sucesso" });
      }
    } catch {
      toast({ title: "Erro ao importar", description: "Verifique a URL e tente novamente.", variant: "destructive" });
    }
    setImporting(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
      setFeaturedImageUrl(urlData.publicUrl);
      toast({ title: "Imagem enviada" });
    }
    setUploading(false);
  };

  const resetForm = () => {
    setTitle(""); setSlug(""); setSummary(""); setContent("");
    setFeaturedImageUrl(""); setCategoryId(""); setTagsInput("");
    setMetaTitle(""); setMetaDescription(""); setPublished(false);
    setEditingId(null); setImportUrl("");
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ title: "Preencha título e slug", variant: "destructive" });
      return;
    }
    setSaving(true);

    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

    const postData = {
      title, slug, summary: summary || null, content: content || null,
      featured_image_url: featuredImageUrl || null,
      category_id: categoryId || null, tags,
      meta_title: metaTitle || null, meta_description: metaDescription || null,
      published, author_id: user?.id,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("blog_posts").update(postData).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(postData));
    }

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Artigo atualizado" : "Artigo criado" });
      resetForm();
      fetchPosts();
    }
    setSaving(false);
  };

  const handleEdit = (post: Tables<"blog_posts">) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setSummary(post.summary || "");
    setContent(post.content || "");
    setFeaturedImageUrl(post.featured_image_url || "");
    setCategoryId(post.category_id || "");
    setTagsInput((post.tags || []).join(", "));
    setMetaTitle(post.meta_title || "");
    setMetaDescription(post.meta_description || "");
    setPublished(post.published);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este artigo?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Artigo excluído" });
      fetchPosts();
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-serif">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
              Vaz Inovação
            </Link>
            <span className="text-foreground/20">|</span>
            <span className="text-sm">Admin Blog</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Ver Blog
            </Link>
            <Button variant="ghost" onClick={signOut} className="text-sm text-muted-foreground">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-normal mb-8">
          {editingId ? "Editar Artigo" : "Novo Artigo"}
        </h1>

        {/* Import URL */}
        <div className="border border-foreground/10 p-6 mb-8">
          <label className="text-sm text-muted-foreground block mb-2">Importar de URL</label>
          <div className="flex gap-3">
            <Input
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://exemplo.com/artigo"
              className="border-foreground/20"
            />
            <Button onClick={handleImport} disabled={importing} className="bg-foreground text-background hover:bg-foreground/90 whitespace-nowrap">
              {importing ? "Importando..." : "Importar"}
            </Button>
          </div>
        </div>

        {/* Form - Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-foreground/10 p-6 space-y-6">
              <h2 className="text-lg font-normal text-foreground mb-2">Conteúdo</h2>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Título *</label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="border-foreground/20 text-lg"
                  placeholder="Título do artigo"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Slug (URL) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/blog/</span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="border-foreground/20"
                    placeholder="titulo-do-artigo"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Resumo <span className="text-muted-foreground/50">({summary.length}/300)</span>
                </label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value.slice(0, 300))}
                  className="border-foreground/20 min-h-[100px]"
                  placeholder="Breve resumo do artigo..."
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Conteúdo * <span className="text-muted-foreground/50">(suporta HTML)</span>
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border-foreground/20 min-h-[400px] font-mono text-sm"
                  placeholder="<h2>Subtítulo</h2><p>Conteúdo do artigo...</p>"
                />
                <p className="text-xs text-muted-foreground/50 mt-2">
                  Tags suportadas: h2, h3, p, strong, em, a, ul, ol, li, blockquote, img, br
                </p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Featured image */}
            <div className="border border-foreground/10 p-6 space-y-4">
              <h2 className="text-lg font-normal text-foreground">Imagem Destacada</h2>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setImageMode("upload")}
                  className={`text-xs px-3 py-1 border transition-colors ${
                    imageMode === "upload" ? "border-foreground text-foreground" : "border-foreground/20 text-muted-foreground"
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setImageMode("url")}
                  className={`text-xs px-3 py-1 border transition-colors ${
                    imageMode === "url" ? "border-foreground text-foreground" : "border-foreground/20 text-muted-foreground"
                  }`}
                >
                  URL
                </button>
              </div>

              {imageMode === "upload" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border border-dashed border-foreground/20 py-8 text-sm text-muted-foreground hover:border-foreground/40 transition-colors"
                  >
                    {uploading ? "Enviando..." : "Clique para enviar imagem"}
                  </button>
                </div>
              ) : (
                <Input
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="border-foreground/20"
                />
              )}

              {featuredImageUrl && (
                <div className="mt-2">
                  <img src={featuredImageUrl} alt="Preview" className="w-full aspect-video object-cover" />
                  <button onClick={() => setFeaturedImageUrl("")} className="text-xs text-muted-foreground mt-2 hover:text-foreground">
                    Remover imagem
                  </button>
                </div>
              )}
            </div>

            {/* Organization */}
            <div className="border border-foreground/10 p-6 space-y-4">
              <h2 className="text-lg font-normal text-foreground">Organização</h2>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-foreground/20 bg-background text-foreground px-3 py-2 text-sm"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Tags</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tecnologia, inovação, design"
                  className="border-foreground/20"
                />
                <p className="text-xs text-muted-foreground/50 mt-1">Separe por vírgula</p>
              </div>
            </div>

            {/* SEO */}
            <div className="border border-foreground/10 p-6 space-y-4">
              <h2 className="text-lg font-normal text-foreground">SEO</h2>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Meta Título <span className="text-muted-foreground/50">({metaTitle.length}/60)</span>
                </label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                  className="border-foreground/20"
                  placeholder="Título para mecanismos de busca"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Meta Descrição <span className="text-muted-foreground/50">({metaDescription.length}/160)</span>
                </label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                  className="border-foreground/20 min-h-[80px]"
                  placeholder="Descrição para mecanismos de busca"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="border border-foreground/10 p-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Publicar artigo</span>
              </label>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                >
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={resetForm} className="border-foreground/20">
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts list */}
        <div className="mt-16 border-t border-foreground/10 pt-8">
          <h2 className="text-xl font-normal mb-6">Artigos</h2>
          {posts.length === 0 ? (
            <p className="text-muted-foreground italic">Nenhum artigo ainda.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between border-b border-foreground/5 pb-4">
                  <div>
                    <p className="text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      /blog/{post.slug} · {post.published ? "Publicado" : "Rascunho"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(post)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminBlog;
