alter table public.transactions add column if not exists is_transfer boolean not null default false;
alter table public.transactions add column if not exists transfer_group_id uuid;
create index if not exists transactions_transfer_group_idx on public.transactions(user_id, transfer_group_id) where transfer_group_id is not null;
create index if not exists transactions_account_paid_idx on public.transactions(user_id, account_id, status) where account_id is not null;
