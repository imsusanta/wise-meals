-- First, drop the constraint if it exists
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_age_range_check;

-- Now alter the enum type to add new values (PostgreSQL doesn't support ALTER TYPE ADD VALUE in transaction, so we recreate)
-- First create a new enum type with all values
DO $$ 
BEGIN
  -- Check if we need to add new values
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = '30-34' AND enumtypid = 'public.age_range'::regtype) THEN
    ALTER TYPE public.age_range ADD VALUE '30-34' BEFORE '50-54';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = '35-39' AND enumtypid = 'public.age_range'::regtype) THEN
    ALTER TYPE public.age_range ADD VALUE '35-39' BEFORE '50-54';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = '40-44' AND enumtypid = 'public.age_range'::regtype) THEN
    ALTER TYPE public.age_range ADD VALUE '40-44' BEFORE '50-54';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = '45-49' AND enumtypid = 'public.age_range'::regtype) THEN
    ALTER TYPE public.age_range ADD VALUE '45-49' BEFORE '50-54';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;