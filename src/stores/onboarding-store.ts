import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { 
  HealthProfile, 
  AgeRange, 
  DietaryRestriction, 
  Allergy, 
  CookingSkill, 
  HouseholdSize, 
  WeeklyBudget 
} from "@/types/health-profile";

interface OnboardingState {
  currentStep: number;
  profile: Partial<HealthProfile>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setAgeRange: (age: AgeRange) => void;
  setDietaryRestrictions: (restrictions: DietaryRestriction[]) => void;
  toggleDietaryRestriction: (restriction: DietaryRestriction) => void;
  setAllergies: (allergies: Allergy[]) => void;
  toggleAllergy: (allergy: Allergy) => void;
  setCookingSkill: (skill: CookingSkill) => void;
  setHouseholdSize: (size: HouseholdSize) => void;
  setWeeklyBudget: (budget: WeeklyBudget) => void;
  reset: () => void;
}

const initialProfile: Partial<HealthProfile> = {
  age_range: undefined,
  dietary_restrictions: [],
  allergies: [],
  cooking_skill: undefined,
  household_size: undefined,
  weekly_budget: undefined,
  cooking_for_one_mode: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      profile: initialProfile,
      
      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 4) 
      })),
      
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 0) 
      })),
      
      setAgeRange: (age_range) => set((state) => ({ 
        profile: { ...state.profile, age_range } 
      })),
      
      setDietaryRestrictions: (dietary_restrictions) => set((state) => ({ 
        profile: { ...state.profile, dietary_restrictions } 
      })),
      
      toggleDietaryRestriction: (restriction) => set((state) => {
        const current = state.profile.dietary_restrictions || [];
        const updated = current.includes(restriction)
          ? current.filter(r => r !== restriction)
          : [...current, restriction];
        return { profile: { ...state.profile, dietary_restrictions: updated } };
      }),
      
      setAllergies: (allergies) => set((state) => ({ 
        profile: { ...state.profile, allergies } 
      })),
      
      toggleAllergy: (allergy) => set((state) => {
        const current = state.profile.allergies || [];
        const updated = current.includes(allergy)
          ? current.filter(a => a !== allergy)
          : [...current, allergy];
        return { profile: { ...state.profile, allergies: updated } };
      }),
      
      setCookingSkill: (cooking_skill) => set((state) => {
        const cooking_for_one_mode = state.profile.household_size === "1";
        return { profile: { ...state.profile, cooking_skill, cooking_for_one_mode } };
      }),
      
      setHouseholdSize: (household_size) => set((state) => {
        const cooking_for_one_mode = household_size === "1";
        return { profile: { ...state.profile, household_size, cooking_for_one_mode } };
      }),
      
      setWeeklyBudget: (weekly_budget) => set((state) => ({ 
        profile: { ...state.profile, weekly_budget } 
      })),
      
      reset: () => set({ currentStep: 0, profile: initialProfile }),
    }),
    {
      name: "nourishwise-onboarding",
    }
  )
);
