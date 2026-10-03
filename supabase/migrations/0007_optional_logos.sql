alter table public.accounts add column if not exists logo_url text;
alter table public.cards add column if not exists logo_url text;
alter table public.subscriptions add column if not exists logo_url text;
alter table public.installment_plans add column if not exists logo_url text;
alter table public.transactions add column if not exists logo_url text;
alter table public.categories add column if not exists logo_url text;
