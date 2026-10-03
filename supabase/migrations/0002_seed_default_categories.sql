create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles(id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  insert into public.categories(user_id, name, kind, icon, color)
  values
    (new.id, 'Moradia', 'expense', '🏠', '#60a5fa'),
    (new.id, 'Alimentação', 'expense', '🍽️', '#f59e0b'),
    (new.id, 'Transporte', 'expense', '🚗', '#a78bfa'),
    (new.id, 'Assinaturas', 'expense', '🔄', '#ec4899'),
    (new.id, 'Saúde', 'expense', '❤️', '#ef4444'),
    (new.id, 'Educação', 'expense', '📚', '#06b6d4'),
    (new.id, 'Lazer', 'expense', '🎮', '#8b5cf6'),
    (new.id, 'Compras', 'expense', '🛍️', '#f97316'),
    (new.id, 'Serviços', 'expense', '🧰', '#64748b'),
    (new.id, 'Outros', 'both', '📌', '#94a3b8'),
    (new.id, 'Salário', 'income', '💼', '#22c55e'),
    (new.id, 'Renda extra', 'income', '💰', '#10b981')
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;
