alter table public.deal_items
  alter column product_id drop not null;

alter table public.deal_items
  add column if not exists custom_name text;

alter table public.deal_items
  add column if not exists custom_price numeric(10, 2);

alter table public.deal_items
  add column if not exists custom_unit_label text;

alter table public.deal_items
  add column if not exists custom_image_url text;
