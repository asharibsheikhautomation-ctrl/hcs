create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  discount_type text not null check (discount_type in ('fixed', 'percentage')),
  discount_value numeric(10, 2) not null default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  max_uses integer,
  times_used integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.orders
  add column if not exists voucher_id uuid references public.vouchers(id) on delete set null;

alter table public.orders
  add column if not exists voucher_code text;

alter table public.orders
  add column if not exists discount_amount numeric(10, 2) not null default 0;

create index if not exists vouchers_active_idx
  on public.vouchers(is_active, valid_until);

drop trigger if exists vouchers_set_updated_at on public.vouchers;
create trigger vouchers_set_updated_at
before update on public.vouchers
for each row
execute function public.set_updated_at();
