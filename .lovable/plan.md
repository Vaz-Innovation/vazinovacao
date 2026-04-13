

## Plano: Newsletter Beehiiv integrada ao blog

### O que será feito

1. **Criar componente `NewsletterCard.tsx`**
   - Card com visual similar ao BlogCard mas com borda diferenciada
   - Título "Fique por dentro" + subtítulo curto
   - Iframe do Beehiiv embutido (`822dceb7-ab66-4012-86cd-ce2fed390c34`)
   - Mesmo tamanho e proporção dos cards de artigo

2. **Inserir o card no grid do Blog (`Blog.tsx`)**
   - Após o 3º artigo (ou no final se houver menos de 3)
   - Flui naturalmente no grid sem quebrar o layout

3. **Adicionar newsletter no final de cada artigo (`BlogPost.tsx`)**
   - Após o conteúdo do artigo e antes do link de referência
   - Seção minimalista com o mesmo iframe do Beehiiv
   - Título tipo "Gostou? Receba mais conteúdos como este"

4. **Adicionar scripts do Beehiiv no `index.html`**
   - Script de embed e attribution antes do `</body>`

### Detalhes técnicos
- Iframe src: `https://subscribe-forms.beehiiv.com/822dceb7-ab66-4012-86cd-ce2fed390c34`
- Scripts: `subscribe-forms.beehiiv.com/embed.js` e `attribution.js`
- Arquivos editados: `index.html`, `Blog.tsx`, `BlogPost.tsx`, novo `NewsletterCard.tsx`

