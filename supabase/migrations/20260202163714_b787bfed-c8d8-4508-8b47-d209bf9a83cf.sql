-- Add planned_date column to meal_plan_items for date-specific planning
ALTER TABLE public.meal_plan_items 
ADD COLUMN planned_date date;

-- Create index for faster date-based queries
CREATE INDEX idx_meal_plan_items_planned_date ON public.meal_plan_items(planned_date);

-- Create a function to calculate planned_date from meal_plan week_start and day_of_week
-- This will be useful for both viewing and querying
CREATE OR REPLACE FUNCTION public.get_meal_planned_date(meal_plan_item_id uuid)
RETURNS date
LANGUAGE sql
STABLE
AS $$
  SELECT (mp.week_start + mpi.day_of_week)::date
  FROM public.meal_plan_items mpi
  JOIN public.meal_plans mp ON mp.id = mpi.meal_plan_id
  WHERE mpi.id = meal_plan_item_id
$$;