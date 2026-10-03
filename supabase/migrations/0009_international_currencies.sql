alter table public.transactions add column if not exists currency_code text not null default 'BRL';
alter table public.transactions add column if not exists exchange_rate_to_brl numeric(18,6) not null default 1 check (exchange_rate_to_brl > 0);

alter table public.subscriptions add column if not exists currency_code text not null default 'BRL';
alter table public.subscriptions add column if not exists exchange_rate_to_brl numeric(18,6) not null default 1 check (exchange_rate_to_brl > 0);

alter table public.installment_plans add column if not exists currency_code text not null default 'BRL';
alter table public.installment_plans add column if not exists exchange_rate_to_brl numeric(18,6) not null default 1 check (exchange_rate_to_brl > 0);

alter table public.recurring_incomes add column if not exists currency_code text not null default 'BRL';
alter table public.recurring_incomes add column if not exists exchange_rate_to_brl numeric(18,6) not null default 1 check (exchange_rate_to_brl > 0);
