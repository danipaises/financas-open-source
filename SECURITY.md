# Segurança

- RLS habilitado nas tabelas privadas.
- A publishable key pode ficar no frontend; nunca use `service_role` no navegador.
- Cartões armazenam apenas últimos 4 dígitos; nunca CVV, senha ou número completo.
- Dados são vinculados ao `auth.uid()` do usuário.
- Vulnerabilidades sensíveis não devem ser publicadas com dados reais em issues públicas.
