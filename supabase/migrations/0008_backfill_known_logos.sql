update public.accounts set logo_url = case
when lower(institution_name)='nubank' then 'https://www.google.com/s2/favicons?domain=nubank.com.br&sz=128'
when lower(institution_name) in ('banco do brasil','bb') then 'https://www.google.com/s2/favicons?domain=bb.com.br&sz=128'
when lower(institution_name) in ('itaú','itau') then 'https://www.google.com/s2/favicons?domain=itau.com.br&sz=128'
when lower(institution_name)='bradesco' then 'https://www.google.com/s2/favicons?domain=bradesco.com.br&sz=128'
when lower(institution_name)='caixa' then 'https://www.google.com/s2/favicons?domain=caixa.gov.br&sz=128'
when lower(institution_name)='santander' then 'https://www.google.com/s2/favicons?domain=santander.com.br&sz=128'
when lower(institution_name)='inter' then 'https://www.google.com/s2/favicons?domain=inter.co&sz=128'
when lower(institution_name)='c6 bank' then 'https://www.google.com/s2/favicons?domain=c6bank.com.br&sz=128'
when lower(institution_name)='mercado pago' then 'https://www.google.com/s2/favicons?domain=mercadopago.com.br&sz=128'
when lower(institution_name)='picpay' then 'https://www.google.com/s2/favicons?domain=picpay.com&sz=128'
else logo_url end where logo_url is null;

update public.subscriptions set logo_url = case
when lower(name) like '%chatgpt%' then 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=128'
when lower(name) like '%netflix%' then 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128'
when lower(name) like '%spotify%' then 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128'
when lower(name) like '%youtube%' then 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128'
when lower(name) like '%google one%' then 'https://www.google.com/s2/favicons?domain=one.google.com&sz=128'
when lower(name) like '%prime%' then 'https://www.google.com/s2/favicons?domain=amazon.com.br&sz=128'
when lower(name) like '%disney%' then 'https://www.google.com/s2/favicons?domain=disneyplus.com&sz=128'
when lower(name) like '%canva%' then 'https://www.google.com/s2/favicons?domain=canva.com&sz=128'
else logo_url end where logo_url is null;
