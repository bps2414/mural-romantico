# Roadmap de Features — Mural Romântico

> **Status atual:** Build ✅ | Feed + Cartinhas + Tempo Juntos ativos  
> **Stack:** Next.js 15 (App Router) + Supabase (Auth/DB/Storage) + Tailwind CSS  
> **Deploy Target:** Vercel (HTTPS obrigatório para PWA/Push)

---

## Arquitetura Atual (Referência)

```
src/
├── app/
│   ├── page.tsx              ← Server Component (getPosts, getNotes, getAuthCookie)
│   ├── actions.ts            ← Server Action (getAuthCookie via cookie)
│   ├── layout.tsx            ← Root Layout (fonts, metadata)
│   ├── (admin)/admin/        ← Client Component (toggle: photo | note)
│   └── (auth)/login/         ← Login page (role-based: admin/tata)
├── components/
│   ├── TabNavigation.tsx     ← Client (2 abas: feed | cartinhas)
│   ├── TimeTogether.tsx      ← Client (contador desde 04/09/2025)
│   ├── LogoutButton.tsx      ← Client (server action logout)
│   ├── feed/                 ← PostCard, LikeButton
│   ├── notes/                ← NotesGrid
│   └── comments/             ← CommentSection
├── lib/
│   ├── actions.ts            ← Server Actions (getPosts, toggleLike, addComment, deletePost, getNotes, deleteNote)
│   ├── admin-actions.ts      ← Client-side (uploadImage, createPost, createNote)
│   └── supabase/             ← createClient (server + client)
└── middleware.ts             ← Auth guard
```

**Padrões Identificados:**
- Auth via cookie `role` (valores: `admin` | `tata`)
- Admin = Bryan (CRUD total) | Tata = leitura + likes/comments
- UI: palette `rose-*`, backdrop-blur header, rounded-2xl cards
- Admin toggle: `type AdminMode = "photo" | "note"` → expandir para novas features
- TabNavigation: `type Tab = "feed" | "cartinhas"` → expandir para novas abas

---

## FASE 1 — 💬 Frase do Dia

**Valor:** Alto. Cria ritual diário. A Tata abre o app toda manhã para ver se tem algo novo.

### 1.1 Banco de Dados

```sql
-- Tabela de mensagens diárias
CREATE TABLE public.daily_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL CHECK (char_length(text) > 0),
  date date NOT NULL UNIQUE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.daily_messages ENABLE ROW LEVEL SECURITY;

-- Admin (Bryan): CRUD total
CREATE POLICY "admin_full_access" ON public.daily_messages
  FOR ALL USING (true) WITH CHECK (true);

-- Tata: Somente leitura de mensagens até hoje
CREATE POLICY "tata_read_today" ON public.daily_messages
  FOR SELECT USING (date <= CURRENT_DATE);
```

> ⚠️ **Timezone:** Supabase usa UTC. O Server Action deve converter para `America/Sao_Paulo` ao determinar "hoje". Usar `new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })` para gerar a data no formato `YYYY-MM-DD`.

### 1.2 Server Actions (Novos)

**Arquivo:** `src/lib/daily-message-actions.ts`

| Action | Tipo | Descrição |
|--------|------|-----------|
| `getDailyMessage()` | Server | Busca a mensagem de `CURRENT_DATE` (TZ-aware) |
| `createDailyMessage(text)` | Server | Insere mensagem. Falha se já existe para hoje (UNIQUE constraint) |
| `markMessageAsRead(id)` | Server | `UPDATE is_read = true` — aciona quando Tata clica |

### 1.3 Admin — Novo modo no toggle

**Arquivo:** `src/app/(admin)/admin/page.tsx`

- Expandir `type AdminMode = "photo" | "note" | "daily"`
- Novo botão no toggle bar: `💬 Frase` (ícone: `MessageCircleHeart` do lucide)
- **Form:** Textarea simples + botão "Enviar Frase de Hoje"
- **Guarda:** Se já enviou hoje → mostrar a frase atual com opção de editar
- **Feedback:** Toast/alerta "Frase enviada com sucesso 💕" + redirect para `/`

### 1.4 Feed da Tata — Componente

**Arquivo:** `src/components/DailyMessage.tsx` (Client Component)

**3 Estados Visuais:**

| Estado | Condição | Visual |
|--------|----------|--------|
| 🔔 **Não lida** | `message && !is_read` | Card com borda glow animada (pulse rosa), ícone de envelope fechado `💌`, texto "Você tem uma frase nova!" — ao clicar: aciona `markMessageAsRead()` e revela |
| ✨ **Lida** | `message && is_read` | Frase em fonte cursive (*Caveat* via Google Fonts), fade-in suave, assinatura `— Bryan 💕` |
| 😢 **Vazia** | `!message` | Card sombreado com opacidade 40%, texto "Bryan ainda não escreveu hoje..." com animação _breathing_ (`opacity` pulsando 0.3→0.5) |

**Posição:** Entre `<TimeTogether />` e `<TabNavigation />` no `page.tsx`

### 1.5 Verificação

- [ ] `npm run build` sem erros
- [ ] Admin: enviar frase → ver no feed da Tata
- [ ] Duplicata no mesmo dia → Supabase retorna erro (UNIQUE)
- [ ] Marcar como lida → envelope se abre, frase aparece
- [ ] Sem mensagem → emoji triste aparece

---

## FASE 2 — 🫙 Potinho do Amor

**Valor:** Médio-Alto. Interação lúdica on-demand. Efeito "dengo digital".

### 2.1 Banco de Dados

```sql
CREATE TABLE public.love_jar_phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase text NOT NULL CHECK (char_length(phrase) > 0),
  category text DEFAULT 'motivo' CHECK (category IN ('motivo', 'lembranca', 'elogio')),
  last_drawn_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.love_jar_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON public.love_jar_phrases
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "tata_read" ON public.love_jar_phrases
  FOR SELECT USING (true);
```

### 2.2 Server Actions

**Arquivo:** `src/lib/love-jar-actions.ts`

| Action | Descrição |
|--------|-----------|
| `addPhrases(text)` | Recebe texto multi-linha, split por `\n`, insere cada linha como frase |
| `drawPhrase()` | `SELECT * WHERE (last_drawn_at IS NULL OR last_drawn_at < NOW() - INTERVAL '3 hours') ORDER BY random() LIMIT 1`, depois `UPDATE last_drawn_at = NOW()` |
| `getPhraseCount()` | Retorna total de frases no pote (feedback visual) |

### 2.3 Admin — Modo "Potinho"

- Expandir `AdminMode` → `"photo" | "note" | "daily" | "jar"`
- Textarea multi-linha: "Uma frase por linha"
- Contador: "Já tem X frases no potinho"
- Categorias: 3 botões radio (`motivo` | `lembrança` | `elogio`)

### 2.4 Feed da Tata — Nova aba

**Arquivo:** `src/components/LoveJar.tsx` (Client Component)

- Expandir `TabNavigation`: `type Tab = "feed" | "cartinhas" | "potinho"`
- **Visual:** SVG de pote com _Glassmorphism_ (`backdrop-blur-xl`, `bg-white/20`, borda translúcida)
- **Botão:** "✨ Sortear um Dengo" — grande, centralizado, com hover scale
- **Animação de Revelação:** CSS-first — Card "papelzinho" faz `scale(0) → rotate(10deg) → scale(1) → rotate(0)` usando `@keyframes unfold`
- **Frase:** Fonte cursive, centralizada, com categoria em chip discreto acima

### 2.5 Verificação

- [ ] Admin cadastra 5+ frases → contador atualiza
- [ ] Tata sorteia → não repete a mesma frase em 3h
- [ ] Animação de revelação funciona em mobile
- [ ] Pote vazio → mensagem "O pote está vazio... peça ao Bryan para enchê-lo 💕"

---

## FASE 3 — 🎵 Trilha Sonora

**Valor:** Médio. Imersão emocional. Músicas que marcaram momentos.

### 3.1 Banco de Dados

```sql
CREATE TABLE public.playlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  spotify_track_id text NOT NULL,
  cover_emoji text DEFAULT '💿',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.playlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON public.playlist
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "tata_read" ON public.playlist
  FOR SELECT USING (true);
```

### 3.2 Server Actions

**Arquivo:** `src/lib/playlist-actions.ts`

| Action | Descrição |
|--------|-----------|
| `addTrack(url, title, artist)` | Extrai `spotify_track_id` via regex do link. Pattern: `/track/([a-zA-Z0-9]+)/` |
| `getTracks()` | Lista todas as músicas ordenadas por `created_at DESC` |
| `deleteTrack(id)` | Remove (admin only) |

### 3.3 Admin — Modo "Música"

- Expandir `AdminMode` → adicionar `"music"`
- Input para link do Spotify + campos de título e artista
- Preview: Embute iframe após validar o link
- Validação: Regex garante que URL é do Spotify

### 3.4 Feed da Tata — Nova aba

**Arquivo:** `src/components/PlaylistTab.tsx`

- Expandir `TabNavigation`: adicionar aba "🎵"
- Cada track: Card com iframe embed do Spotify em modo compact (80px height)
  - URL embed: `https://open.spotify.com/embed/track/{spotify_track_id}?theme=0`
- **Visual Premium:** Cards empilhados simulando discos de vinil com CSS `animation: spin 5s linear infinite` no estado "tocando"

### 3.5 Verificação

- [ ] Admin cola link → extrai track ID corretamente
- [ ] Iframe do Spotify carrega em mobile
- [ ] Lista de músicas renderiza em ordem cronológica

---

## FASE 4 — 📱 PWA (Progressive Web App)

**Valor:** Alto. Transforma o site em "app" instalável. Widget na home screen do celular da Tata.

### 4.1 Manifest

**Arquivo:** `public/manifest.json`

```json
{
  "name": "Nosso Mural 💕",
  "short_name": "Mural",
  "description": "O mural de amor do Bryan e da Tata",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fff1f2",
  "theme_color": "#e11d48",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### 4.2 Service Worker

**Arquivo:** `public/sw.js`

- Estratégia: **Network-first** com fallback para cache
- Cache assets estáticos (CSS, JS, fonts, ícones)
- Página offline fallback: card bonito com "Sem internet, meu bem... 💔" 

### 4.3 Integração com Next.js

- Adicionar `<link rel="manifest" href="/manifest.json">` no `layout.tsx`
- Adicionar meta tags PWA: `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- Registrar Service Worker via `<script>` no layout ou componente client

### 4.4 Ícones

- Gerar ícones 192px e 512px com background rose e coração
- Formato: PNG com `purpose: "any maskable"` para Android/iOS

### 4.5 Verificação

- [ ] Lighthouse PWA score ≥ 90
- [ ] "Adicionar à Tela Inicial" funciona no Chrome Android
- [ ] App abre sem barra do navegador (`display: standalone`)
- [ ] Offline fallback mostra card de "sem internet"

---

## FASE 5 — 🔔 Push Notifications

**Valor:** Máximo. A Tata recebe alertas reais no celular quando Bryan posta.

> ⚠️ **Pré-requisito:** FASE 4 (PWA) concluída + deploy na Vercel com HTTPS.

### 5.1 Banco de Dados

```sql
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent text,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tata_manage_own" ON public.push_subscriptions
  FOR ALL USING (true) WITH CHECK (true);
```

### 5.2 Segurança (VAPID)

- Gerar par de chaves VAPID com `web-push generate-vapid-keys`
- Env vars na Vercel:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` → usada no client para subscription
  - `VAPID_PRIVATE_KEY` → usada no server para enviar push

### 5.3 Service Worker — Push Handler

Estender `public/sw.js`:

```js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Nosso Mural 💕', {
      body: data.body ?? 'Algo novo te espera!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url ?? '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

### 5.4 Componente Opt-In

**Arquivo:** `src/components/NotificationPrompt.tsx` (Client Component)

- **Não** usar o prompt nativo do browser diretamente
- Banner customizado rose com texto: *"Quer que eu te avise quando o Bryan postar algo novo? 💕"*
- Botão "Sim, me avisa!" → `Notification.requestPermission()` → `pushManager.subscribe()` → salvar `subscription` no Supabase
- Botão "Agora não" → dismiss silencioso, mostrar novamente em 3 dias (localStorage)
- Exibir apenas para role `tata`

### 5.5 Triggers — Hooks nos Server Actions

Alterar as actions existentes para disparar notificações:

| Action Existente | Trigger Push |
|------------------|-------------|
| `createPost()` | "📸 Bryan postou uma foto nova!" |
| `createNote()` | "💌 Nova cartinha do Bryan!" |
| `createDailyMessage()` | "💬 Bryan escreveu uma frase pra você!" |
| `addTrack()` | "🎵 Bryan adicionou uma música nova!" |

**Implementação:** Supabase Edge Function `push-notify` invocada pelos Server Actions após insert bem-sucedido.

### 5.6 Verificação

- [ ] Deploy na Vercel → HTTPS ativo
- [ ] Banner customizado aparece para Tata (não para admin)
- [ ] Aceitar notificação → subscription salva no Supabase
- [ ] Bryan posta → Tata recebe push no celular
- [ ] Clicar na notificação → abre o app no conteúdo correto

---

## 🗺️ Roadmap Consolidado

| Fase | Feature | Esforço | Dependência | Status |
|------|---------|---------|-------------|--------|
| **1** | 💬 Frase do Dia | ⭐⭐⭐ | Nenhuma | ⏳ **Próximo** |
| **2** | 🫙 Potinho do Amor | ⭐⭐⭐ | Nenhuma | ⏳ Backlog |
| **3** | 🎵 Trilha Sonora | ⭐⭐ | Nenhuma | ⏳ Backlog |
| **4** | 📱 PWA | ⭐⭐ | Deploy Vercel | ⏳ Backlog |
| **5** | 🔔 Push Notifications | ⭐⭐⭐⭐⭐ | Fase 4 + Vercel | ⏳ Depende Fase 4 |

> **Obs:** Fases 1–3 são independentes entre si e podem ser implementadas em qualquer ordem. Fase 5 depende da Fase 4.
