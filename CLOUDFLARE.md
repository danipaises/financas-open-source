# Deploy no Cloudflare Pages

1. No Cloudflare Dashboard, abra **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
2. Escolha `danipaises/financas-open-source`.
3. Configure:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
4. Em **Environment variables**, adicione:
   - `VITE_SUPABASE_URL=https://zueipqzurbjlbpyzzlqi.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_CvpWXKPPb3WLV3mFZTdOUw_Rjm4_A_c`
5. Faça o deploy.

## Autenticação

E-mail e senha já usam Supabase Auth.

O botão Google exige habilitar o provedor Google no Supabase com Client ID e Client Secret do Google Cloud. Depois, adicione o domínio final do Cloudflare às Redirect URLs do Supabase.

## Segurança

A publishable key pode ficar no frontend. Nunca coloque `service_role` ou secret key no repositório ou no frontend. O isolamento dos dados é feito por Row Level Security (RLS).
