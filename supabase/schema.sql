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

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  accent_tone text not null default 'gold' check (accent_tone in ('gold', 'frost', 'ink')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  image_url text,
  gallery_urls jsonb not null default '[]'::jsonb,
  badge text,
  sku text,
  base_price numeric(10, 2) not null default 0,
  sale_price numeric(10, 2),
  compare_at_price numeric(10, 2),
  unit_label text not null default 'unit',
  stock_quantity integer not null default 0,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  is_featured boolean not null default false,
  is_frozen boolean not null default false,
  accent_tone text not null default 'gold' check (accent_tone in ('gold', 'frost', 'ink')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  headline text not null,
  description text,
  savings_label text,
  banner_image_url text,
  banner_tone text not null default 'gold' check (banner_tone in ('gold', 'frost', 'ink')),
  discount_type text,
  discount_value numeric(10, 2),
  starts_at timestamptz,
  ends_at timestamptz,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.deal_items (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (deal_id, product_id)
);

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  delivery_charge numeric(10, 2) not null default 0,
  free_delivery_minimum numeric(10, 2) not null default 0,
  estimated_delivery_time text,
  accent_tone text not null default 'gold' check (accent_tone in ('gold', 'frost', 'ink')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.delivery_zone_areas (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid references public.delivery_zones(id) on delete set null,
  area_name text,
  delivery_charge numeric(10, 2),
  description text
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('HCS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_name text not null,
  phone text not null,
  address text not null,
  note text,
  delivery_zone_id uuid references public.delivery_zones(id) on delete set null,
  delivery_zone_name text not null,
  delivery_charge numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
  whatsapp_message text,
  whatsapp_sent boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10, 2) not null default 0,
  line_total numeric(10, 2) not null default 0,
  item_type text not null default 'product' check (item_type in ('product', 'deal')),
  product_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text,
  email text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved', 'spam')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null,
  tagline text not null,
  whatsapp_number text not null,
  logo_url text,
  business_hours text,
  hero_kicker text not null,
  hero_title text not null,
  hero_subtitle text not null,
  homepage_story_title text not null,
  homepage_story_body text not null,
  products_section_title text,
  deals_section_title text,
  contact_section_title text,
  announcement_bar text,
  contact_email text,
  contact_phone text,
  address text,
  primary_color text,
  secondary_color text,
  background_color text,
  surface_color text,
  currency_code text not null default 'PKR',
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.categories
  add column if not exists image_url text;

alter table public.products
  add column if not exists gallery_urls jsonb not null default '[]'::jsonb;

alter table public.products
  add column if not exists sku text;

alter table public.products
  add column if not exists sale_price numeric(10, 2);

alter table public.products
  add column if not exists stock_quantity integer not null default 0;

alter table public.deals
  add column if not exists banner_image_url text;

alter table public.deals
  add column if not exists discount_type text;

alter table public.deals
  add column if not exists discount_value numeric(10, 2);

alter table public.site_settings
  add column if not exists logo_url text;

alter table public.site_settings
  add column if not exists business_hours text;

alter table public.site_settings
  add column if not exists products_section_title text;

alter table public.site_settings
  add column if not exists deals_section_title text;

alter table public.site_settings
  add column if not exists contact_section_title text;

alter table public.site_settings
  add column if not exists primary_color text;

alter table public.site_settings
  add column if not exists secondary_color text;

alter table public.site_settings
  add column if not exists background_color text;

alter table public.site_settings
  add column if not exists surface_color text;

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(is_featured);
create unique index if not exists products_sku_idx on public.products(sku) where sku is not null;
create index if not exists deals_featured_idx on public.deals(is_featured);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists contact_inquiries_created_at_idx on public.contact_inquiries(created_at desc);
create index if not exists contact_inquiries_status_idx on public.contact_inquiries(status);
create index if not exists delivery_zones_active_idx on public.delivery_zones(is_active, sort_order);
create index if not exists delivery_zone_areas_zone_idx on public.delivery_zone_areas(zone_id);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists deals_set_updated_at on public.deals;
create trigger deals_set_updated_at
before update on public.deals
for each row
execute function public.set_updated_at();

drop trigger if exists delivery_zones_set_updated_at on public.delivery_zones;
create trigger delivery_zones_set_updated_at
before update on public.delivery_zones
for each row
execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

insert into public.site_settings (
  id,
  site_name,
  tagline,
  whatsapp_number,
  logo_url,
  business_hours,
  hero_kicker,
  hero_title,
  hero_subtitle,
  homepage_story_title,
  homepage_story_body,
  products_section_title,
  deals_section_title,
  contact_section_title,
  announcement_bar,
  contact_email,
  contact_phone,
  address,
  primary_color,
  secondary_color,
  background_color,
  surface_color
)
values (
  1,
  'Hyderabad Cheese Store',
  'Curated frozen and dairy essentials, delivered with a luxury finish.',
  '923001234567',
  '',
  'Daily, 11:00 AM to 11:00 PM',
  'Cold chain, curated beautifully',
  'Luxury provisions for a sharper, colder, richer Hyderabad pantry.',
  'Hyderabad Cheese Store blends premium frozen goods, dairy staples, and quick WhatsApp ordering into a polished modern retail experience.',
  'A store built like a tasting room, not a supermarket.',
  'Every shelf is treated like a signature display. Frozen lines feel clean and atmospheric, dairy items feel comforting and rich, and checkout stays fast with WhatsApp-first convenience.',
  'Curated Favourites',
  'Editor''s Deals',
  'Talk To The Store',
  'Fresh deals updated weekly. Delivery zones and charges are managed centrally in Supabase.',
  'hello@hyderabadcheesestore.com',
  '+92 300 1234567',
  'Latifabad, Hyderabad, Sindh',
  '#d7a128',
  '#111111',
  '#f4efe5',
  '#fffaf1'
)
on conflict (id) do update
set
  site_name = excluded.site_name,
  tagline = excluded.tagline,
  whatsapp_number = excluded.whatsapp_number,
  logo_url = excluded.logo_url,
  business_hours = excluded.business_hours,
  hero_kicker = excluded.hero_kicker,
  hero_title = excluded.hero_title,
  hero_subtitle = excluded.hero_subtitle,
  homepage_story_title = excluded.homepage_story_title,
  homepage_story_body = excluded.homepage_story_body,
  products_section_title = excluded.products_section_title,
  deals_section_title = excluded.deals_section_title,
  contact_section_title = excluded.contact_section_title,
  announcement_bar = excluded.announcement_bar,
  contact_email = excluded.contact_email,
  contact_phone = excluded.contact_phone,
  address = excluded.address,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  background_color = excluded.background_color,
  surface_color = excluded.surface_color;

insert into public.categories (slug, name, description, accent_tone, sort_order)
values
  (
    'frozen-food',
    'Frozen Food',
    'Cold-chain favourites with frosted tones, quick-cook convenience, and clean premium packaging.',
    'frost',
    1
  ),
  (
    'dairy-items',
    'Dairy Items',
    'Cheese, cream, butter, and table-ready staples presented with a richer, golden warmth.',
    'gold',
    2
  ),
  (
    'extra-items',
    'Extra Items',
    'Curated pantry extras and companion products that round out the order without visual clutter.',
    'ink',
    3
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  accent_tone = excluded.accent_tone,
  sort_order = excluded.sort_order;

insert into public.delivery_zones (
  slug,
  name,
  description,
  delivery_charge,
  free_delivery_minimum,
  estimated_delivery_time,
  accent_tone,
  sort_order,
  is_active
)
values
  (
    'latifabad',
    'Latifabad',
    'Fast-turn delivery for the core Hyderabad catchment.',
    220,
    5000,
    '30-45 mins',
    'gold',
    1,
    true
  ),
  (
    'qasimabad',
    'Qasimabad',
    'Balanced route timing with same-day cold-chain handling.',
    320,
    6500,
    '45-60 mins',
    'frost',
    2,
    true
  ),
  (
    'city-edge',
    'City Edge',
    'Outer Hyderabad radius with extended route coordination.',
    450,
    8000,
    '60-90 mins',
    'ink',
    3,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  delivery_charge = excluded.delivery_charge,
  free_delivery_minimum = excluded.free_delivery_minimum,
  estimated_delivery_time = excluded.estimated_delivery_time,
  accent_tone = excluded.accent_tone,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.delivery_zone_areas (
  zone_id,
  area_name,
  delivery_charge,
  description
)
select
  z.id,
  seeded.area_name,
  seeded.delivery_charge,
  seeded.description
from (
  values
    ('latifabad', 'Unit 6', 220, 'Core area'),
    ('latifabad', 'Unit 7', 260, 'Mid zone'),
    ('latifabad', 'Autobahn Road', 300, 'Outer route'),
    ('qasimabad', 'Phase 1', 320, 'Core area'),
    ('qasimabad', 'Phase 2', 360, 'Mid zone'),
    ('qasimabad', 'Phase 3', 410, 'Outer route'),
    ('city-edge', 'Ring Road', 450, 'Primary edge route'),
    ('city-edge', 'Hosiery Market', 520, 'Extended route'),
    ('city-edge', 'Bypass Corridor', 600, 'Long-distance edge route')
) as seeded(zone_slug, area_name, delivery_charge, description)
join public.delivery_zones z on z.slug = seeded.zone_slug
where not exists (
  select 1
  from public.delivery_zone_areas existing
  where existing.zone_id = z.id
    and existing.area_name = seeded.area_name
);

-- Add RLS and policies once admin authentication roles are finalized.
