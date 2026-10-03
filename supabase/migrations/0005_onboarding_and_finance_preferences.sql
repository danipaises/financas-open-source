alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
alter table public.profiles add column if not exists currency text not null default 'BRL';
alter table public.profiles add column if not exists locale text not null default 'pt-BR';
alter table public.profiles add column if not exists monthly_income numeric(14,2);
