


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."Platform" AS ENUM (
    'INSTAGRAM',
    'FACEBOOK',
    'YOUTUBE',
    'TIKTOK'
);


ALTER TYPE "public"."Platform" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Achievement" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "date" "text",
    "category" "text",
    "createdAt" timestamp with time zone DEFAULT "now"(),
    "updatedAt" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."Achievement" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."AudienceDemographics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "connectedAccountId" "text" NOT NULL,
    "type" "text" NOT NULL,
    "label" "text" NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "now"(),
    "value" integer
);


ALTER TABLE "public"."AudienceDemographics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Collaboration" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "text" NOT NULL,
    "brand" "text" NOT NULL,
    "campaign" "text",
    "date" "text",
    "type" "text",
    "createdAt" timestamp with time zone DEFAULT "now"(),
    "updatedAt" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."Collaboration" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ConnectedAccount" (
    "id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "userId" "text" NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "platformUserId" "text" NOT NULL,
    "username" "text",
    "isPrimary" boolean DEFAULT false,
    "accessToken" "text",
    "refreshToken" "text",
    "tokenExpiresAt" timestamp with time zone,
    "pageId" "text",
    "pageAccessToken" "text",
    "instagramBusinessId" "text",
    "scopes" "text"[],
    "createdAt" timestamp with time zone DEFAULT "now"(),
    "updatedAt" timestamp with time zone DEFAULT "now"(),
    "profileLink" "text"
);


ALTER TABLE "public"."ConnectedAccount" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."PlatformMetrics" (
    "id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "connectedAccountId" "text" NOT NULL,
    "date" "date" NOT NULL,
    "followers" integer DEFAULT 0,
    "engagementRate" double precision DEFAULT 0,
    "avgViews" integer DEFAULT 0,
    "reach" integer DEFAULT 0,
    "total_likes" integer DEFAULT 0,
    "total_comments" integer DEFAULT 0,
    "total_shares" integer DEFAULT 0,
    "total_saves" integer DEFAULT 0,
    "profileVisits" integer DEFAULT 0,
    "impressions" integer DEFAULT 0,
    "linkClicks" integer DEFAULT 0,
    "createdAt" timestamp with time zone DEFAULT "now"(),
    "newFollows" integer DEFAULT 0,
    "unfollows" integer DEFAULT 0,
    "videoCount" integer,
    "likes" integer DEFAULT 0,
    "shares" integer DEFAULT 0,
    "comments" integer DEFAULT 0,
    "saves" integer DEFAULT 0
);


ALTER TABLE "public"."PlatformMetrics" OWNER TO "postgres";


COMMENT ON COLUMN "public"."PlatformMetrics"."newFollows" IS 'yesterday''s new followers';



COMMENT ON COLUMN "public"."PlatformMetrics"."unfollows" IS 'yesterday''s unfollows';



COMMENT ON COLUMN "public"."PlatformMetrics"."videoCount" IS 'videoCount';



CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "firstName" "text",
    "lastName" "text",
    "userName" "text",
    "category" "text",
    "bio" "text",
    "website" "text",
    "location" "text",
    "profileImageUrl" "text",
    "coverImageUrl" "text",
    "audienceSummary" "text",
    "customUrl" "text",
    "isMediaKitPublic" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "onboardingCompleted" boolean DEFAULT false NOT NULL,
    "phone" "text"
);


ALTER TABLE "public"."User" OWNER TO "postgres";


ALTER TABLE ONLY "public"."Achievement"
    ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."AudienceDemographics"
    ADD CONSTRAINT "AudienceDemographics_connectedAccountId_type_label_key" UNIQUE ("connectedAccountId", "type", "label");



ALTER TABLE ONLY "public"."AudienceDemographics"
    ADD CONSTRAINT "AudienceDemographics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Collaboration"
    ADD CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ConnectedAccount"
    ADD CONSTRAINT "ConnectedAccount_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ConnectedAccount"
    ADD CONSTRAINT "ConnectedAccount_userId_platform_platformUserId_key" UNIQUE ("userId", "platform", "platformUserId");



ALTER TABLE ONLY "public"."PlatformMetrics"
    ADD CONSTRAINT "PlatformMetrics_connectedAccountId_date_key" UNIQUE ("connectedAccountId", "date");



ALTER TABLE ONLY "public"."PlatformMetrics"
    ADD CONSTRAINT "PlatformMetrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_userName_key1" UNIQUE ("userName");



CREATE UNIQUE INDEX "User_customUrl_key" ON "public"."User" USING "btree" ("customUrl");



CREATE UNIQUE INDEX "User_email_key" ON "public"."User" USING "btree" ("email");



CREATE UNIQUE INDEX "User_userName_key" ON "public"."User" USING "btree" ("userName");



CREATE INDEX "idx_achievement_user_id" ON "public"."Achievement" USING "btree" ("userId");



CREATE INDEX "idx_collaboration_user_id" ON "public"."Collaboration" USING "btree" ("userId");



CREATE INDEX "idx_connected_account_user" ON "public"."ConnectedAccount" USING "btree" ("userId");



CREATE INDEX "idx_platform_metrics_account" ON "public"."PlatformMetrics" USING "btree" ("connectedAccountId");



CREATE INDEX "idx_platform_metrics_date" ON "public"."PlatformMetrics" USING "btree" ("date");



ALTER TABLE ONLY "public"."Achievement"
    ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."AudienceDemographics"
    ADD CONSTRAINT "AudienceDemographics_connectedAccountId_fkey" FOREIGN KEY ("connectedAccountId") REFERENCES "public"."ConnectedAccount"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Collaboration"
    ADD CONSTRAINT "Collaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ConnectedAccount"
    ADD CONSTRAINT "ConnectedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."PlatformMetrics"
    ADD CONSTRAINT "PlatformMetrics_connectedAccountId_fkey" FOREIGN KEY ("connectedAccountId") REFERENCES "public"."ConnectedAccount"("id") ON DELETE CASCADE;



ALTER TABLE "public"."Achievement" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."AudienceDemographics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Collaboration" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ConnectedAccount" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."PlatformMetrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."Achievement" TO "anon";
GRANT ALL ON TABLE "public"."Achievement" TO "authenticated";
GRANT ALL ON TABLE "public"."Achievement" TO "service_role";



GRANT ALL ON TABLE "public"."AudienceDemographics" TO "anon";
GRANT ALL ON TABLE "public"."AudienceDemographics" TO "authenticated";
GRANT ALL ON TABLE "public"."AudienceDemographics" TO "service_role";



GRANT ALL ON TABLE "public"."Collaboration" TO "anon";
GRANT ALL ON TABLE "public"."Collaboration" TO "authenticated";
GRANT ALL ON TABLE "public"."Collaboration" TO "service_role";



GRANT ALL ON TABLE "public"."ConnectedAccount" TO "anon";
GRANT ALL ON TABLE "public"."ConnectedAccount" TO "authenticated";
GRANT ALL ON TABLE "public"."ConnectedAccount" TO "service_role";



GRANT ALL ON TABLE "public"."PlatformMetrics" TO "anon";
GRANT ALL ON TABLE "public"."PlatformMetrics" TO "authenticated";
GRANT ALL ON TABLE "public"."PlatformMetrics" TO "service_role";



GRANT ALL ON TABLE "public"."User" TO "anon";
GRANT ALL ON TABLE "public"."User" TO "authenticated";
GRANT ALL ON TABLE "public"."User" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































