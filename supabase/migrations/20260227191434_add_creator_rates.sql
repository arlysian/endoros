-- Creator rates: per-platform pricing for media kit
create table "public"."CreatorRate" (
  "id" uuid not null default gen_random_uuid(),
  "userId" text not null,
  "platform" text not null,
  "contentType" text not null,
  "price" numeric(10,2) not null,
  "currency" text not null default 'USD',
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now(),
  constraint "CreatorRate_pkey" primary key ("id"),
  constraint "CreatorRate_userId_fkey" foreign key ("userId") references "public"."User"("id") on delete cascade
);

-- Index for fast lookups by user
create index "CreatorRate_userId_idx" on "public"."CreatorRate" ("userId");

-- Enable RLS
alter table "public"."CreatorRate" enable row level security;

-- Allow public read (media kit is public)
create policy "Anyone can read creator rates"
  on "public"."CreatorRate"
  for select
  using (true);
