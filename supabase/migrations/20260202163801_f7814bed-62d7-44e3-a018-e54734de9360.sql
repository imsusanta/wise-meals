-- Fix search_path for the new function
CREATE OR REPLACE FUNCTION public.get_meal_planned_date(meal_plan_item_id uuid)
RETURNS date
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT (mp.week_start + mpi.day_of_week)::date
  FROM public.meal_plan_items mpi
  JOIN public.meal_plans mp ON mp.id = mpi.meal_plan_id
  WHERE mpi.id = meal_plan_item_id
$$;