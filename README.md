# Finanças Open Source

Gerenciador financeiro pessoal open source, responsivo e instalável como PWA.

## Stack

- React + TypeScript + Vite
- Supabase Auth + PostgreSQL + RLS
- Cloudflare Pages para hospedagem
- PWA com `vite-plugin-pwa`

## Recursos planejados

- Receitas e despesas
- Parcelamentos e parcelas futuras
- Assinaturas recorrentes
- Bancos, contas, Pix e cartões
- Calendário financeiro
- Análises mensais
- PWA instalável no Android/desktop
- Exportação futura para CSV/Excel/Google Sheets

## Executar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Preencha no `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## Banco de dados

As migrations estão em `supabase/migrations/`.

Elas criam tabelas, índices, triggers, categorias padrão e políticas RLS por usuário.

## Cloudflare Pages

Veja também [`CLOUDFLARE.md`](./CLOUDFLARE.md).

Configuração recomendada:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 20+
- Variáveis de ambiente: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`

## Segurança

Nunca coloque `service_role`/secret key no frontend. O site usa somente a publishable key e depende de RLS para isolamento dos dados.

## Licença

MIT
