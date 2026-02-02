export interface HealthProfile {
  id?: string;
  user_id?: string;
  age_range: AgeRange;
  dietary_restrictions: DietaryRestriction[];
  allergies: Allergy[];
  cooking_skill: CookingSkill;
  household_size: HouseholdSize;
  weekly_budget: WeeklyBudget;
  cooking_for_one_mode: boolean;
  created_at?: string;
  updated_at?: string;
}

export type AgeRange = 
  | "30-34"
  | "35-39"
  | "40-44"
  | "45-49"
  | "50-54" 
  | "55-59" 
  | "60-64" 
  | "65-69" 
  | "70-74" 
  | "75-79" 
  | "80+";

export type DietaryRestriction = 
  | "diabetes-friendly"
  | "heart-healthy"
  | "low-sodium"
  | "bone-health"
  | "anti-inflammatory"
  | "high-fiber"
  | "kidney-friendly"
  | "gerd-friendly"
  | "vegetarian"
  | "vegan"
  | "gluten-free";

export type Allergy = 
  | "nuts"
  | "peanuts"
  | "dairy"
  | "eggs"
  | "gluten"
  | "soy"
  | "shellfish"
  | "fish"
  | "sesame"
  | "sulfites";

export type CookingSkill = 
  | "beginner" 
  | "comfortable" 
  | "experienced";

export type HouseholdSize = 
  | "1" 
  | "2" 
  | "3-4" 
  | "5+";

export type WeeklyBudget = 
  | "budget-friendly" 
  | "moderate" 
  | "flexible";

export const DIETARY_RESTRICTION_LABELS: Record<DietaryRestriction, string> = {
  "diabetes-friendly": "Diabetes-Friendly",
  "heart-healthy": "Heart-Healthy",
  "low-sodium": "Low Sodium",
  "bone-health": "Bone Health",
  "anti-inflammatory": "Anti-Inflammatory",
  "high-fiber": "High Fiber",
  "kidney-friendly": "Kidney-Friendly",
  "gerd-friendly": "GERD/Acid Reflux Friendly",
  "vegetarian": "Vegetarian",
  "vegan": "Vegan",
  "gluten-free": "Gluten-Free",
};

export const ALLERGY_LABELS: Record<Allergy, string> = {
  "nuts": "Tree Nuts",
  "peanuts": "Peanuts",
  "dairy": "Dairy",
  "eggs": "Eggs",
  "gluten": "Gluten/Wheat",
  "soy": "Soy",
  "shellfish": "Shellfish",
  "fish": "Fish",
  "sesame": "Sesame",
  "sulfites": "Sulfites",
};

export const COOKING_SKILL_LABELS: Record<CookingSkill, { label: string; description: string }> = {
  "beginner": { 
    label: "Beginner", 
    description: "Simple recipes with basic techniques" 
  },
  "comfortable": { 
    label: "Comfortable", 
    description: "Most recipes, some advanced techniques" 
  },
  "experienced": { 
    label: "Experienced", 
    description: "Complex recipes and techniques" 
  },
};

export const HOUSEHOLD_SIZE_LABELS: Record<HouseholdSize, string> = {
  "1": "Just me",
  "2": "Two people",
  "3-4": "3-4 people",
  "5+": "5 or more",
};

export const WEEKLY_BUDGET_LABELS: Record<WeeklyBudget, { label: string; description: string }> = {
  "budget-friendly": { 
    label: "Budget-Friendly", 
    description: "Focus on affordable ingredients" 
  },
  "moderate": { 
    label: "Moderate", 
    description: "Balance of cost and variety" 
  },
  "flexible": { 
    label: "Flexible", 
    description: "Quality and variety are priorities" 
  },
};
