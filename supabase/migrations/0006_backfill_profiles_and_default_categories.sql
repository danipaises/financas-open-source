insert into public.profiles(id, full_name, avatar_url)
select id, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;

insert into public.categories(user_id, name, kind, icon, color)
select u.id, v.name, v.kind, v.icon, v.color
from auth.users u
cross join (values
  ('Moradia','expense','🏠','#60a5fa'),
  ('Alimentação','expense','🍽️','#f59e0b'),
  ('Transporte','expense','🚗','#a78bfa'),
  ('Assinaturas','expense','🔄','#ec4899'),
  ('Saúde','expense','❤️','#ef4444'),
  ('Educação','expense','📚','#06b6d4'),
  ('Lazer','expense','🎮','#8b5cf6'),
  ('Compras','expense','🛍️','#f97316'),
  ('Serviços','expense','🧰','#64748b'),
  ('Outros','both','📌','#94a3b8'),
  ('Salário','income','💼','#22c55e'),
  ('Renda extra','income','💰','#10b981')
) as v(name,kind,icon,color)
on conflict (user_id,name) do nothing;
