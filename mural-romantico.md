# Mural Romântico

## Overview
Um site/app mobile-first para compartilhar declarações, recados e fotos com a namorada. O usuário ("criador") tem acesso administrativo para postar, e a namorada ("espectadora") entra com uma senha simples para ver o feed, curtir e comentar. O design será fofo, romântico e com animações suaves.

## Project Type
WEB (Mobile-First)

## Success Criteria
- O site carrega perfeitamente em dispositivos móveis como um app nativo.
- Login simples via "senha secreta" ou data para a espectadora.
- Acesso à rota secreta (`/admin`) para o criador adicionar novas fotos e recados.
- Feed infinito puxando dados do Supabase.
- Animações românticas nas interações de "curtir" (chuva de corações).
- Comentários sendo salvos e exibidos em tempo real ou após recarregar a página.

## Tech Stack
- **Framework:** Next.js (App Router) + React 19 (Performance e SSR)
- **Styling:** Tailwind CSS (Estilos utilitários rápidos)
- **Database & Auth & Storage:** Supabase (Backend as a Service leve e gratuito)
- **UI Components & Icons:** Lucide React (Ícones fofos) + Framer Motion (Micro-animações de curtidas e abertura de modais)
- **Deployment:** Vercel (Hospedagem gratuita e CI/CD)

## File Structure
```
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx       # Tela da senha "Qual o nosso segredo?"
│   │   ├── (feed)/
│   │   │   └── page.tsx             # Feed principal da espectadora
│   │   ├── admin/
│   │   │   └── page.tsx             # Tela de postar fotos e textos (protegida)
│   │   ├── api/                     # Rotas de API caso necessário (Supabase Server)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      # Botões, Inputs básicos
│   │   ├── layout/                  # Navbar / Footer mobile
│   │   ├── feed/
│   │   │   ├── PostCard.tsx         # O Card da foto + texto + botões interativos
│   │   │   └── LikeAnim.tsx         # Animação de coração
│   │   └── admin/
│   │       └── CreatePostForm.tsx   # Formulário para o admin criar os posts
│   └── lib/
│       └── supabase/                # Clientes Supabase (browser e server)
├── public/                          # Imagens fixas e assets
└── tailwind.config.ts
```

## Task Breakdown

- [ ] Task 1: Scaffolding Inicial
  - **Agent:** `frontend-specialist`
  - **Skill:** `app-builder`, `nextjs-best-practices`
  - **Ação:** Criar base Next.js com Tailwind CSS, limpar os arquivos padrão e configurar as fontes estilizadas.
  - **Verify:** `npm run dev` abre uma página em branco sem erros.

- [ ] Task 2: Configuração e Schemas do Supabase
  - **Agent:** `database-architect`
  - **Skill:** `database-design`
  - **Ação:** Criar as tabelas no Supabase (`posts`, `comments`, `likes`), configurar o Storage para as imagens e habilitar Row Level Security (RLS). Obter chaves de ambiente.
  - **Verify:** Dashboard do Supabase reflete a estrutura exata de dados e os `.env.local` conectam o app localmente.

- [ ] Task 3: Integração do Supabase no Next.js
  - **Agent:** `backend-specialist`
  - **Skill:** `nextjs-supabase-auth`
  - **Ação:** Criar os hooks ou helpers do Supabase Client. Integrar na autenticação simples por chave de acesso/data de namoro.
  - **Verify:** O cliente do Supabase consegue inserir um "post teste" pelo código e consultar.

- [ ] Task 4: Criar Tela de Login Romântica (`/login`)
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **Ação:** Desenhar a tela inicial com a pergunta "Qual o nosso segredo?", lidar com o input do cliente, setar cookie de sessão temporária se a senha for validada.
  - **Verify:** Preencher a senha correta redireciona para a raiz (`/`). A senha errada mostra um shake text / feedback visual.

- [ ] Task 5: Componente PostCard e Feed Principal
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`, `scroll-experience`
  - **Ação:** Desenvolver o esqueleto do post (imagem, mensagem, reações). Buscar dados do Supabase. Animar com Framer Motion ao aparecer na tela.
  - **Verify:** Feed principal exibe cards estáticos mockados provisoriamente (ou o teste do Supabase). Visualmente testado via browser simulator em formato mobile.

- [ ] Task 6: Implementar Likes e Comentários (Interatividade)
  - **Agent:** `frontend-specialist` & `backend-specialist`
  - **Skill:** `react-patterns`
  - **Ação:** No `PostCard`, quando ela tocar no ❤️, salvar no banco e acionar a animação na UI. Quando ela comentar no modal, inserir linha na tabela de `comments` atrelada ao post id e mostrar na UI.
  - **Verify:** Clicar no botão curtir atualiza o contador e persiste ao dar f5. Comentar aparece na lista.

- [ ] Task 7: Tela Secreta Admin (`/admin`)
  - **Agent:** `frontend-specialist`
  - **Skill:** `react-patterns`
  - **Ação:** Formulário protegido para envio de foto (Upload pro Supabase Storage) e texto do recado. Cria uma nova linha na tabela `posts`.
  - **Verify:** Postando via `/admin`, o post aparece instantaneamente ou ao atualizar no `/` feed principal. Imagem carrega perfeitamente.

## Phase X: Verification (MANDATORY SCRIPT EXECUTION)
- [ ] Segurança e Proteção de Rotas (apenas a chave correta entra no feed, acesso `/admin` bem restrito).
- [ ] Validação Visual Extrema: Testar o scroll do feed num viewport de celular no browser, conferir que nada espreme ou quebra na tela.
- [ ] Confirmação de Upload: Imagens sobem e reduzem tamanho para não explodir armazenamento grátis?
- [ ] Lint: ✅ Pass (usar `npm run lint`)
- [ ] Build: ✅ Success (usar `npm run build`)
