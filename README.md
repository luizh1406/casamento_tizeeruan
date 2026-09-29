# Site de casamento + lista de presentes via Pix

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Postgres · pronto para Vercel.

## Rodar localmente
```bash
npm install
npm run dev        # http://localhost:3000
```
Sem `DATABASE_URL`, o dev usa um Postgres embutido (PGlite, em `./.data`). Login local do painel: `admin@casamento.local` / `admin123` (só em desenvolvimento). O schema e os 7 presentes de exemplo são criados automaticamente.

## Deploy na Vercel
1. Crie um Postgres (Supabase, Neon ou Vercel Postgres) e copie a connection string.
2. Na Vercel, defina as variáveis de `.env.example`: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (obrigatórias).
3. Deploy. Entre em `/admin`, vá em **Configurações** e preencha nomes, data, local, fotos e **chave Pix**.

## Arquitetura
```
src/app/            páginas (site, /admin) e rotas de API (/api/*)
src/components/     UI reutilizável (Gifts, RsvpForm, Gallery, Countdown…) e /admin
src/server/         db (pg/PGlite), schema, auth/sessão (JWT), pix (BR Code + QR), settings, http (rate-limit, CSRF)
src/lib/            tipos, formatação, limites (compartilhado)
```
Tabelas: `settings` (JSON do site), `gifts`, `gift_orders`, `rsvps`, `media` (fotos enviadas, otimizadas com sharp), `rate_limits`.

Fluxo do convidado: site → RSVP (`POST /api/rsvp`) → mapa → "Presentear" → `POST /api/gifts/orders` (valor validado no servidor, gera Pix copia-e-cola + QR) → paga no app do banco → "Já fiz o pagamento" (`reported`) → noivos confirmam em **Presentes recebidos** → convidado vê "Presente enviado ❤️".

## Sobre a confirmação de pagamento (importante)
Não há integração com instituição de pagamento; **nada é confirmado automaticamente**. O QR é um Pix estático com a chave dos noivos. O convidado pode avisar que pagou, mas só o painel (ou o webhook) muda o status para *confirmado*; só confirmados entram nos totais.

Se sua instituição oferecer API Pix (padrão BCB), defina `PIX_WEBHOOK_SECRET` e cadastre `https://SEU_SITE/api/webhooks/pix?secret=...` no PSP. O webhook confirma pedidos pelo `txid` e valor. Para o `txid` coincidir, a cobrança precisa ser criada pela API do PSP — isso exige adaptar `src/server/pix.ts` ao provedor escolhido.

## Segurança
Sessão admin em cookie httpOnly assinado (JWT) + middleware + verificação em cada rota `/api/admin/*`; validação com zod; valores/preços definidos no servidor; rate limit persistido no banco (login, RSVP, pedidos); honeypot e tempo mínimo no RSVP; checagem de origem; exportação CSV protegida contra injeção de fórmulas; nenhum segredo no frontend.

## Testes
Com o servidor rodando: `BASE=http://localhost:3000 node scripts/e2e.mjs` (usa o login de dev).
