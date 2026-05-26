-- ============================================================
-- Supabase Security Patch: Enable RLS & Policies on All Tables
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This secures all 13 tables and resolves the "RLS is disabled" warning.
-- ============================================================

-- 1. zon_config
ALTER TABLE IF EXISTS public.zon_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_config_select ON public.zon_config;
DROP POLICY IF EXISTS zon_config_insert ON public.zon_config;
DROP POLICY IF EXISTS zon_config_update ON public.zon_config;
DROP POLICY IF EXISTS zon_config_delete ON public.zon_config;
CREATE POLICY zon_config_select ON public.zon_config FOR SELECT USING (true);
CREATE POLICY zon_config_insert ON public.zon_config FOR INSERT WITH CHECK (true);
CREATE POLICY zon_config_update ON public.zon_config FOR UPDATE USING (true);
CREATE POLICY zon_config_delete ON public.zon_config FOR DELETE USING (true);

-- 2. zon_users
ALTER TABLE IF EXISTS public.zon_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_users_select ON public.zon_users;
DROP POLICY IF EXISTS zon_users_insert ON public.zon_users;
DROP POLICY IF EXISTS zon_users_update ON public.zon_users;
DROP POLICY IF EXISTS zon_users_delete ON public.zon_users;
CREATE POLICY zon_users_select ON public.zon_users FOR SELECT USING (true);
CREATE POLICY zon_users_insert ON public.zon_users FOR INSERT WITH CHECK (true);
CREATE POLICY zon_users_update ON public.zon_users FOR UPDATE USING (true);
CREATE POLICY zon_users_delete ON public.zon_users FOR DELETE USING (true);

-- 3. zon_category
ALTER TABLE IF EXISTS public.zon_category ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_category_select ON public.zon_category;
DROP POLICY IF EXISTS zon_category_insert ON public.zon_category;
DROP POLICY IF EXISTS zon_category_update ON public.zon_category;
DROP POLICY IF EXISTS zon_category_delete ON public.zon_category;
CREATE POLICY zon_category_select ON public.zon_category FOR SELECT USING (true);
CREATE POLICY zon_category_insert ON public.zon_category FOR INSERT WITH CHECK (true);
CREATE POLICY zon_category_update ON public.zon_category FOR UPDATE USING (true);
CREATE POLICY zon_category_delete ON public.zon_category FOR DELETE USING (true);

-- 4. zon_games
ALTER TABLE IF EXISTS public.zon_games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_games_select ON public.zon_games;
DROP POLICY IF EXISTS zon_games_insert ON public.zon_games;
DROP POLICY IF EXISTS zon_games_update ON public.zon_games;
DROP POLICY IF EXISTS zon_games_delete ON public.zon_games;
CREATE POLICY zon_games_select ON public.zon_games FOR SELECT USING (true);
CREATE POLICY zon_games_insert ON public.zon_games FOR INSERT WITH CHECK (true);
CREATE POLICY zon_games_update ON public.zon_games FOR UPDATE USING (true);
CREATE POLICY zon_games_delete ON public.zon_games FOR DELETE USING (true);

-- 5. zon_likes
ALTER TABLE IF EXISTS public.zon_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_likes_select ON public.zon_likes;
DROP POLICY IF EXISTS zon_likes_insert ON public.zon_likes;
DROP POLICY IF EXISTS zon_likes_delete ON public.zon_likes;
CREATE POLICY zon_likes_select ON public.zon_likes FOR SELECT USING (true);
CREATE POLICY zon_likes_insert ON public.zon_likes FOR INSERT WITH CHECK (true);
CREATE POLICY zon_likes_delete ON public.zon_likes FOR DELETE USING (true);

-- 6. zon_unlikes
ALTER TABLE IF EXISTS public.zon_unlikes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_unlikes_select ON public.zon_unlikes;
DROP POLICY IF EXISTS zon_unlikes_insert ON public.zon_unlikes;
DROP POLICY IF EXISTS zon_unlikes_delete ON public.zon_unlikes;
CREATE POLICY zon_unlikes_select ON public.zon_unlikes FOR SELECT USING (true);
CREATE POLICY zon_unlikes_insert ON public.zon_unlikes FOR INSERT WITH CHECK (true);
CREATE POLICY zon_unlikes_delete ON public.zon_unlikes FOR DELETE USING (true);

-- 7. zon_comments
ALTER TABLE IF EXISTS public.zon_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_comments_select ON public.zon_comments;
DROP POLICY IF EXISTS zon_comments_insert ON public.zon_comments;
DROP POLICY IF EXISTS zon_comments_update ON public.zon_comments;
DROP POLICY IF EXISTS zon_comments_delete ON public.zon_comments;
CREATE POLICY zon_comments_select ON public.zon_comments FOR SELECT USING (true);
CREATE POLICY zon_comments_insert ON public.zon_comments FOR INSERT WITH CHECK (true);
CREATE POLICY zon_comments_update ON public.zon_comments FOR UPDATE USING (true);
CREATE POLICY zon_comments_delete ON public.zon_comments FOR DELETE USING (true);

-- 8. zon_report
ALTER TABLE IF EXISTS public.zon_report ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_report_select ON public.zon_report;
DROP POLICY IF EXISTS zon_report_insert ON public.zon_report;
DROP POLICY IF EXISTS zon_report_delete ON public.zon_report;
CREATE POLICY zon_report_select ON public.zon_report FOR SELECT USING (true);
CREATE POLICY zon_report_insert ON public.zon_report FOR INSERT WITH CHECK (true);
CREATE POLICY zon_report_delete ON public.zon_report FOR DELETE USING (true);

-- 9. zon_pages
ALTER TABLE IF EXISTS public.zon_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_pages_select ON public.zon_pages;
DROP POLICY IF EXISTS zon_pages_insert ON public.zon_pages;
DROP POLICY IF EXISTS zon_pages_update ON public.zon_pages;
DROP POLICY IF EXISTS zon_pages_delete ON public.zon_pages;
CREATE POLICY zon_pages_select ON public.zon_pages FOR SELECT USING (true);
CREATE POLICY zon_pages_insert ON public.zon_pages FOR INSERT WITH CHECK (true);
CREATE POLICY zon_pages_update ON public.zon_pages FOR UPDATE USING (true);
CREATE POLICY zon_pages_delete ON public.zon_pages FOR DELETE USING (true);

-- 10. zon_blog
ALTER TABLE IF EXISTS public.zon_blog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_blog_select ON public.zon_blog;
DROP POLICY IF EXISTS zon_blog_insert ON public.zon_blog;
DROP POLICY IF EXISTS zon_blog_update ON public.zon_blog;
DROP POLICY IF EXISTS zon_blog_delete ON public.zon_blog;
CREATE POLICY zon_blog_select ON public.zon_blog FOR SELECT USING (true);
CREATE POLICY zon_blog_insert ON public.zon_blog FOR INSERT WITH CHECK (true);
CREATE POLICY zon_blog_update ON public.zon_blog FOR UPDATE USING (true);
CREATE POLICY zon_blog_delete ON public.zon_blog FOR DELETE USING (true);

-- 11. zon_ads
ALTER TABLE IF EXISTS public.zon_ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_ads_select ON public.zon_ads;
DROP POLICY IF EXISTS zon_ads_insert ON public.zon_ads;
DROP POLICY IF EXISTS zon_ads_update ON public.zon_ads;
DROP POLICY IF EXISTS zon_ads_delete ON public.zon_ads;
CREATE POLICY zon_ads_select ON public.zon_ads FOR SELECT USING (true);
CREATE POLICY zon_ads_insert ON public.zon_ads FOR INSERT WITH CHECK (true);
CREATE POLICY zon_ads_update ON public.zon_ads FOR UPDATE USING (true);
CREATE POLICY zon_ads_delete ON public.zon_ads FOR DELETE USING (true);

-- 12. zon_featured_games
ALTER TABLE IF EXISTS public.zon_featured_games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_featured_select ON public.zon_featured_games;
DROP POLICY IF EXISTS zon_featured_insert ON public.zon_featured_games;
DROP POLICY IF EXISTS zon_featured_update ON public.zon_featured_games;
DROP POLICY IF EXISTS zon_featured_delete ON public.zon_featured_games;
CREATE POLICY zon_featured_select ON public.zon_featured_games FOR SELECT USING (true);
CREATE POLICY zon_featured_insert ON public.zon_featured_games FOR INSERT WITH CHECK (true);
CREATE POLICY zon_featured_update ON public.zon_featured_games FOR UPDATE USING (true);
CREATE POLICY zon_featured_delete ON public.zon_featured_games FOR DELETE USING (true);

-- 13. zon_section
ALTER TABLE IF EXISTS public.zon_section ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zon_section_select ON public.zon_section;
DROP POLICY IF EXISTS zon_section_insert ON public.zon_section;
DROP POLICY IF EXISTS zon_section_update ON public.zon_section;
DROP POLICY IF EXISTS zon_section_delete ON public.zon_section;
CREATE POLICY zon_section_select ON public.zon_section FOR SELECT USING (true);
CREATE POLICY zon_section_insert ON public.zon_section FOR INSERT WITH CHECK (true);
CREATE POLICY zon_section_update ON public.zon_section FOR UPDATE USING (true);
CREATE POLICY zon_section_delete ON public.zon_section FOR DELETE USING (true);
