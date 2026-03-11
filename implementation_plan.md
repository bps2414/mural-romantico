# Plano de Features Futuras — Mural Romântico

> Status atual: Build ✅ | Feed + Cartinhas + Tempo Juntos implementados

---

## 1. ⏳ Tempo Juntos ✅ (JÁ IMPLEMENTADO)

Contador vivo desde **04/09/2025** exibido entre o header e as abas. Mostra "X meses e Y dias juntos". Atualiza a cada minuto.

---

## 2. 💬 Frase do Dia

**O que é:** Bryan envia UMA mensagem por dia. Tata abre e vê. Se Bryan não enviou, aparece carinha triste 😢.

### Banco de Dados
```sql
CREATE TABLE public.daily_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE UNIQUE, -- 1 por dia
  created_at timestamptz DEFAULT now()
);
```

### Como funciona
- **Admin:** Novo modo no toggle → "Frase do Dia"
  - Se já enviou hoje → mostra a frase e impede duplicata
  - Se ainda não → campo pra escrever
- **Tata:** Seção especial no topo do feed
  - ✅ **Tem mensagem:** Card com ✨ animação, frase handwriting, "— Bryan 💕"
  - ❌ **Não tem:** Card com 😢 *"Bryan ainda não escreveu hoje..."*

### Componentes
- `DailyMessage.tsx` — client component, exibe mensagem ou estado vazio
- Admin: modo "Frase do Dia" no toggle

---

## 3. 🫙 Potinho do Amor

**O que é:** Bryan cadastra frases curtas. Tata aperta botão e "pesca" uma frase aleatória.

### Banco de Dados
```sql
CREATE TABLE public.love_jar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Como funciona
- **Admin:** Novo modo no toggle → "Potinho"
  - Formulário simples: textarea + botão "Adicionar ao potinho"
  - Pode cadastrar várias frases ao longo do tempo
- **Tata:** Nova aba ou seção → botão grande "🫙 Pescar uma frase"
  - Animação de revelação (fade in, scale up)
  - Pode pescar várias vezes
  - Cada vez mostra uma frase aleatória diferente

### Componentes
- `LoveJar.tsx` — tela com botão + frase revelada
- Admin: modo "Potinho" no toggle

---

## 4. 🎵 Trilha Sonora

**O que é:** Bryan seleciona músicas especiais. Tata pode ouvir enquanto navega.

### Banco de Dados
```sql
CREATE TABLE public.playlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text,
  spotify_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Como funciona
- **Admin:** Modo "Música" no toggle → adiciona título, artista e link do Spotify
- **Tata:** Nova aba "🎵" ou player mini no footer
  - Embed compacto do Spotify (iframe) para cada música
  - Ou link que abre direto no Spotify do celular

### Componentes
- `PlaylistTab.tsx` — lista de músicas com Spotify embeds
- Admin: modo "Música" no toggle

---

## 5. 🔔 Push Notifications

**O que é:** Tata permite notificações. Quando Bryan posta algo, ela recebe push no celular.

### Arquitetura
```
[Bryan posta] → [Server Action] → [Supabase Edge Function]
                                         ↓
                              [Web Push API → Push no celular da Tata]
```

### Requisitos Técnicos
1. **Service Worker** (`public/sw.js`) — registra browser para pushes
2. **Manifest** (`public/manifest.json`) — PWA mínimo
3. **VAPID Keys** — par de chaves para Web Push
4. **Tabela `push_subscriptions`:**

```sql
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription jsonb NOT NULL,
  role text DEFAULT 'tata',
  created_at timestamptz DEFAULT now()
);
```

### Triggers de Notificação
Após cada ação do Bryan:
- 📸 Foto nova: *"Bryan postou uma foto nova!"*
- 💌 Cartinha: *"Nova cartinha do Bryan!"*
- 💬 Frase do dia: *"Bryan escreveu pra você hoje!"*

### Componentes
- `NotificationPrompt.tsx` — banner "Quer receber avisos?" com botão
- Supabase Edge Function: `push-notify`
- `public/sw.js` + `public/manifest.json`

### ⚠️ Importante
- Push Notifications só funciona com **HTTPS** (Vercel, não localhost)
- Precisa de deploy antes de testar essa feature

---

## 📋 Ordem de Implementação

| # | Feature | Complexidade | Status |
|---|---|---|---|
| 1 | ⏳ Tempo Juntos | ⭐ | ✅ Feito |
| 2 | 💬 Frase do Dia | ⭐⭐ | ⏳ Próximo |
| 3 | 🫙 Potinho do Amor | ⭐⭐ | ⏳ |
| 4 | 🎵 Trilha Sonora | ⭐⭐ | ⏳ |
| 5 | 🔔 Push Notifications | ⭐⭐⭐⭐ | ⏳ |
