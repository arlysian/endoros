drop extension if exists "pg_net";


  create table "public"."modash_profiles" (
    "id" text not null,
    "username" text not null,
    "followers" integer default 0,
    "engagements" integer default 0,
    "is_verified" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "platform" text not null default 'ig'::text,
    "account_type" text
      );


alter table "public"."modash_profiles" enable row level security;


  create table "public"."profile_emails" (
    "id" bigint generated always as identity not null,
    "profile_id" text not null,
    "email" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."profile_emails" enable row level security;


  create table "public"."scrape_jobs" (
    "id" uuid not null default gen_random_uuid(),
    "status" text not null default 'running'::text,
    "filters" jsonb not null,
    "sort" jsonb,
    "follower_min" integer not null,
    "follower_max" integer not null,
    "total_profiles" integer default 0,
    "total_pages" integer default 0,
    "last_page_scraped" integer default 0,
    "profiles_inserted" integer default 0,
    "error_message" text,
    "started_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "platform" text not null default 'ig'::text
      );


alter table "public"."scrape_jobs" enable row level security;

CREATE INDEX idx_modash_profiles_account_type ON public.modash_profiles USING btree (account_type);

CREATE INDEX idx_modash_profiles_followers ON public.modash_profiles USING btree (followers);

CREATE INDEX idx_modash_profiles_platform ON public.modash_profiles USING btree (platform);

CREATE INDEX idx_modash_profiles_username ON public.modash_profiles USING btree (username);

CREATE INDEX idx_profile_emails_email ON public.profile_emails USING btree (email);

CREATE INDEX idx_profile_emails_profile_id ON public.profile_emails USING btree (profile_id);

CREATE INDEX idx_scrape_jobs_follower_range ON public.scrape_jobs USING btree (follower_min, follower_max);

CREATE INDEX idx_scrape_jobs_status ON public.scrape_jobs USING btree (status);

CREATE UNIQUE INDEX modash_profiles_pkey ON public.modash_profiles USING btree (id);

CREATE UNIQUE INDEX modash_profiles_username_platform_key ON public.modash_profiles USING btree (username, platform);

CREATE UNIQUE INDEX profile_emails_pkey ON public.profile_emails USING btree (id);

CREATE UNIQUE INDEX profile_emails_profile_email_key ON public.profile_emails USING btree (profile_id, email);

CREATE UNIQUE INDEX scrape_jobs_pkey ON public.scrape_jobs USING btree (id);

alter table "public"."modash_profiles" add constraint "modash_profiles_pkey" PRIMARY KEY using index "modash_profiles_pkey";

alter table "public"."profile_emails" add constraint "profile_emails_pkey" PRIMARY KEY using index "profile_emails_pkey";

alter table "public"."scrape_jobs" add constraint "scrape_jobs_pkey" PRIMARY KEY using index "scrape_jobs_pkey";

alter table "public"."modash_profiles" add constraint "modash_profiles_username_platform_key" UNIQUE using index "modash_profiles_username_platform_key";

alter table "public"."profile_emails" add constraint "profile_emails_profile_email_key" UNIQUE using index "profile_emails_profile_email_key";

alter table "public"."profile_emails" add constraint "profile_emails_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES public.modash_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."profile_emails" validate constraint "profile_emails_profile_id_fkey";

alter table "public"."scrape_jobs" add constraint "scrape_jobs_status_check" CHECK ((status = ANY (ARRAY['running'::text, 'paused'::text, 'completed'::text, 'failed'::text]))) not valid;

alter table "public"."scrape_jobs" validate constraint "scrape_jobs_status_check";

create or replace view "public"."email_export" as  SELECT p.username,
    e.email,
    p.followers,
    p.engagements,
    p.is_verified,
    p.platform,
    p.account_type
   FROM (public.profile_emails e
     JOIN public.modash_profiles p ON ((p.id = e.profile_id)))
  ORDER BY p.followers DESC;


grant delete on table "public"."modash_profiles" to "service_role";

grant insert on table "public"."modash_profiles" to "service_role";

grant references on table "public"."modash_profiles" to "service_role";

grant select on table "public"."modash_profiles" to "service_role";

grant trigger on table "public"."modash_profiles" to "service_role";

grant truncate on table "public"."modash_profiles" to "service_role";

grant update on table "public"."modash_profiles" to "service_role";

grant delete on table "public"."profile_emails" to "anon";

grant insert on table "public"."profile_emails" to "anon";

grant references on table "public"."profile_emails" to "anon";

grant select on table "public"."profile_emails" to "anon";

grant trigger on table "public"."profile_emails" to "anon";

grant truncate on table "public"."profile_emails" to "anon";

grant update on table "public"."profile_emails" to "anon";

grant delete on table "public"."profile_emails" to "authenticated";

grant insert on table "public"."profile_emails" to "authenticated";

grant references on table "public"."profile_emails" to "authenticated";

grant select on table "public"."profile_emails" to "authenticated";

grant trigger on table "public"."profile_emails" to "authenticated";

grant truncate on table "public"."profile_emails" to "authenticated";

grant update on table "public"."profile_emails" to "authenticated";

grant delete on table "public"."profile_emails" to "service_role";

grant insert on table "public"."profile_emails" to "service_role";

grant references on table "public"."profile_emails" to "service_role";

grant select on table "public"."profile_emails" to "service_role";

grant trigger on table "public"."profile_emails" to "service_role";

grant truncate on table "public"."profile_emails" to "service_role";

grant update on table "public"."profile_emails" to "service_role";

grant delete on table "public"."scrape_jobs" to "service_role";

grant insert on table "public"."scrape_jobs" to "service_role";

grant references on table "public"."scrape_jobs" to "service_role";

grant select on table "public"."scrape_jobs" to "service_role";

grant trigger on table "public"."scrape_jobs" to "service_role";

grant truncate on table "public"."scrape_jobs" to "service_role";

grant update on table "public"."scrape_jobs" to "service_role";


