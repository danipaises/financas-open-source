alter table public.cards add column if not exists card_type text not null default 'credit';

alter table public.cards drop constraint if exists cards_card_type_check;
alter table public.cards add constraint cards_card_type_check check (card_type in ('credit','debit','both'));

alter table public.transactions add column if not exists billing_month date;
alter table public.transactions add column if not exists billing_due_date date;

create index if not exists transactions_user_billing_month_idx on public.transactions(user_id, billing_month);
create index if not exists cards_user_type_idx on public.cards(user_id, card_type);

update public.transactions
set billing_month = date_trunc('month', occurred_on + interval '1 month')::date
where payment_method = 'Cartão de crédito'
  and billing_month is null;

update public.transactions t
set billing_due_date = (
  t.billing_month + (
    least(
      coalesce(c.due_day, 1),
      extract(day from ((t.billing_month + interval '1 month') - interval '1 day'))::int
    ) - 1
  ) * interval '1 day'
)::date
from public.cards c
where t.card_id = c.id
  and t.payment_method = 'Cartão de crédito'
  and t.billing_month is not null
  and t.billing_due_date is null;
