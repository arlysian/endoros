create table "public"."Feedback" (
  "id" uuid not null default gen_random_uuid(),
  "userId" text not null,
  "mood" text not null,
  "message" text,
  "createdAt" timestamp with time zone not null default now(),
  constraint "Feedback_pkey" primary key ("id")
);

create index "Feedback_userId_idx" on "public"."Feedback" using btree ("userId");

alter table "public"."Feedback" enable row level security;
