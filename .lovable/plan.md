

## Plano: Sistema de Blog com Autenticação e Admin

Este plano cobre a criação completa de um sistema de blog com autenticação, painel admin para cadastro de artigos, e página pública de listagem — tudo na identidade visual monocromática do site.

### Infraestrutura necessária

**Lovable Cloud (Supabase)** — será ativado para fornecer:
- Autenticação (email/senha)
- Banco de dados (tabelas: `blog_posts`, `blog_categories`)
- Storage (upload de imagens destacadas)
- Edge Function para importação de URL via Firecrawl

### Estrutura de páginas e rotas

```text
/blog          → Listagem pública dos artigos (cards minimalistas)
/blog/:slug    → Artigo individual completo
/auth          → Login (email/senha) — estilo clean preto e branco
/admin/blog    → Painel admin (protegido) — formulário de cadastro/edição
```

### Banco de dados

**Tabela `blog_categories`**: id, name, slug

**Tabela `blog_posts`**: id, title, slug, summary (max 300 chars), content (HTML), featured_image_url, category_id, tags (text[]), meta_title (max 60 chars), meta_description (max 160 chars), published (boolean), author_id, created_at, updated_at

**Tabela `user_roles`**: id, user_id, role (enum: admin, user) — para proteger o acesso admin via RLS

### Formulário Admin (referência da imagem)

Layout em duas colunas conforme a referência:

**Coluna esquerda:**
- Importar de URL — campo + botão "Importar" (usa Firecrawl para preencher título, resumo e conteúdo automaticamente com HTML bem formatado)
- Conteúdo: Título*, Slug (URL)* com preview "/blog/slug", Resumo (textarea, 0/300 caracteres), Conteúdo* (textarea grande com suporte HTML + dica de tags suportadas)

**Coluna direita:**
- Imagem Destacada: drag & drop para upload OU campo de URL
- Organização: Categoria (select), Tags (input com separação por vírgula)
- SEO: Meta Título (0/60 chars), Meta Descrição (0/160 chars)

### Página pública /blog

Listagem minimalista estilo editorial:
- Cards com imagem destacada, título, resumo, categoria, data
- Tipografia Playfair Display consistente com a home
- Fundo branco, textos pretos, espaçamento generoso
- Filtro por categoria

### Página do artigo /blog/:slug

- Imagem destacada em destaque
- Título grande em Playfair Display
- Data, categoria e tags
- Conteúdo HTML renderizado com tipografia agradável (prose styling)
- Meta tags SEO dinâmicas

### Importação de URL

- Edge Function `import-article-url` que usa Firecrawl para scrape da URL
- Retorna título, conteúdo completo em HTML limpo e resumo
- O conteúdo precisa ser extenso e contextualizado (não breve)

### Arquivos a criar/editar

1. **Migrations**: tabelas `blog_categories`, `blog_posts`, `user_roles` com RLS
2. **`src/pages/Auth.tsx`**: página de login minimalista
3. **`src/pages/Blog.tsx`**: listagem pública
4. **`src/pages/BlogPost.tsx`**: artigo individual
5. **`src/pages/AdminBlog.tsx`**: formulário admin (duas colunas)
6. **`src/components/BlogCard.tsx`**: card de artigo
7. **`src/components/AdminBlogForm.tsx`**: formulário completo
8. **`src/components/ProtectedRoute.tsx`**: wrapper de rota protegida
9. **`src/App.tsx`**: adicionar rotas
10. **Edge Function `import-article-url`**: scrape via Firecrawl
11. **Supabase integration files**: client, types

### Identidade visual

Mesma da home: fundo branco (#fff), textos pretos, Playfair Display, sem cores, bordas sutis em cinza claro, espaçamento generoso, animações suaves de fade-in.

