-- =============================================
-- NourishWise Database Schema
-- =============================================

-- Create enum types for health profile
CREATE TYPE public.age_range AS ENUM (
  '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'
);

CREATE TYPE public.cooking_skill AS ENUM (
  'beginner', 'comfortable', 'experienced'
);

CREATE TYPE public.household_size AS ENUM (
  '1', '2', '3-4', '5+'
);

CREATE TYPE public.weekly_budget AS ENUM (
  'budget-friendly', 'moderate', 'flexible'
);

CREATE TYPE public.meal_type AS ENUM (
  'breakfast', 'lunch', 'dinner', 'snack'
);

CREATE TYPE public.grocery_category AS ENUM (
  'produce', 'dairy', 'proteins', 'grains', 'pantry', 'frozen', 'beverages', 'other'
);

-- =============================================
-- Profiles Table (Health Settings)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  age_range public.age_range,
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  cooking_skill public.cooking_skill DEFAULT 'comfortable',
  household_size public.household_size DEFAULT '2',
  weekly_budget public.weekly_budget DEFAULT 'moderate',
  cooking_for_one_mode BOOLEAN DEFAULT FALSE,
  font_size_preference TEXT DEFAULT 'medium',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- Medications Table (for food interaction alerts)
-- =============================================
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  take_with_food BOOLEAN DEFAULT FALSE,
  food_interactions TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own medications"
  ON public.medications FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- Recipes Table
-- =============================================
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time_minutes INTEGER DEFAULT 30,
  cook_time_minutes INTEGER DEFAULT 30,
  servings INTEGER DEFAULT 2,
  difficulty INTEGER DEFAULT 2 CHECK (difficulty >= 1 AND difficulty <= 3),
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions JSONB NOT NULL DEFAULT '[]',
  nutrition JSONB DEFAULT '{}',
  health_tags TEXT[] DEFAULT '{}',
  cuisine TEXT,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  freezer_friendly BOOLEAN DEFAULT FALSE,
  storage_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Users can view their own recipes and public/shared recipes
CREATE POLICY "Users can view own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Meal Plans Table (Weekly Plans)
-- =============================================
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON public.meal_plans FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- Meal Plan Items Table (Individual Meals)
-- =============================================
CREATE TABLE public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type public.meal_type NOT NULL,
  custom_meal_name TEXT,
  is_prepared BOOLEAN DEFAULT FALSE,
  is_skipped BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

-- Security definer function for meal plan items
CREATE OR REPLACE FUNCTION public.owns_meal_plan(_meal_plan_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.meal_plans
    WHERE id = _meal_plan_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY "Users can manage own meal plan items"
  ON public.meal_plan_items FOR ALL
  USING (public.owns_meal_plan(meal_plan_id));

-- =============================================
-- Shopping Lists Table
-- =============================================
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE SET NULL,
  name TEXT DEFAULT 'My Shopping List',
  is_active BOOLEAN DEFAULT TRUE,
  estimated_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping lists"
  ON public.shopping_lists FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- Shopping List Items Table
-- =============================================
CREATE TABLE public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  category public.grocery_category DEFAULT 'other',
  is_checked BOOLEAN DEFAULT FALSE,
  estimated_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Security definer function for shopping list items
CREATE OR REPLACE FUNCTION public.owns_shopping_list(_shopping_list_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shopping_lists
    WHERE id = _shopping_list_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY "Users can manage own shopping list items"
  ON public.shopping_list_items FOR ALL
  USING (public.owns_shopping_list(shopping_list_id));

-- =============================================
-- Hydration Tracking Table
-- =============================================
CREATE TABLE public.hydration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  glasses INTEGER DEFAULT 1,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own hydration logs"
  ON public.hydration_logs FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- Health Tips Table (Pre-populated content)
-- =============================================
CREATE TABLE public.health_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.health_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view health tips"
  ON public.health_tips FOR SELECT
  USING (is_active = TRUE);

-- =============================================
-- Emergency Contacts Table
-- =============================================
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emergency contacts"
  ON public.emergency_contacts FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- Triggers for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Insert default health tips
-- =============================================
INSERT INTO public.health_tips (content, category) VALUES
  ('Drinking water before meals can help with digestion and prevent overeating.', 'hydration'),
  ('Adding colorful vegetables to your plate ensures a variety of vitamins and minerals.', 'nutrition'),
  ('Eating protein at breakfast helps maintain muscle mass and keeps you feeling full longer.', 'nutrition'),
  ('Calcium and Vitamin D work together for bone health - try fortified foods or supplements.', 'bone-health'),
  ('Reducing sodium intake can help manage blood pressure. Try herbs and spices instead!', 'heart-health'),
  ('Fiber-rich foods like oats, beans, and vegetables support digestive health.', 'digestion'),
  ('Omega-3 fatty acids from fish can help reduce inflammation and support heart health.', 'heart-health'),
  ('Small, frequent meals may be easier to digest than three large meals.', 'digestion'),
  ('Staying hydrated helps your body absorb nutrients more effectively.', 'hydration'),
  ('Walking after meals can help with digestion and blood sugar control.', 'diabetes');