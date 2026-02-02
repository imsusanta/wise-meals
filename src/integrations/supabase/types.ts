export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      emergency_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_tips: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      hydration_logs: {
        Row: {
          glasses: number | null
          id: string
          logged_at: string | null
          user_id: string
        }
        Insert: {
          glasses?: number | null
          id?: string
          logged_at?: string | null
          user_id: string
        }
        Update: {
          glasses?: number | null
          id?: string
          logged_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          created_at: string | null
          custom_meal_name: string | null
          day_of_week: number
          id: string
          is_prepared: boolean | null
          is_skipped: boolean | null
          meal_plan_id: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes: string | null
          planned_date: string | null
          recipe_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_meal_name?: string | null
          day_of_week: number
          id?: string
          is_prepared?: boolean | null
          is_skipped?: boolean | null
          meal_plan_id: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          planned_date?: string | null
          recipe_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_meal_name?: string | null
          day_of_week?: number
          id?: string
          is_prepared?: boolean | null
          is_skipped?: boolean | null
          meal_plan_id?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          planned_date?: string | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string | null
          food_interactions: string[] | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          take_with_food: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          food_interactions?: string[] | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          take_with_food?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          food_interactions?: string[] | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          take_with_food?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: Database["public"]["Enums"]["age_range"] | null
          allergies: string[] | null
          cooking_for_one_mode: boolean | null
          cooking_skill: Database["public"]["Enums"]["cooking_skill"] | null
          created_at: string | null
          dietary_restrictions: string[] | null
          font_size_preference: string | null
          full_name: string | null
          household_size: Database["public"]["Enums"]["household_size"] | null
          id: string
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          updated_at: string | null
          user_id: string
          weekly_budget: Database["public"]["Enums"]["weekly_budget"] | null
        }
        Insert: {
          age_range?: Database["public"]["Enums"]["age_range"] | null
          allergies?: string[] | null
          cooking_for_one_mode?: boolean | null
          cooking_skill?: Database["public"]["Enums"]["cooking_skill"] | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          font_size_preference?: string | null
          full_name?: string | null
          household_size?: Database["public"]["Enums"]["household_size"] | null
          id?: string
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_budget?: Database["public"]["Enums"]["weekly_budget"] | null
        }
        Update: {
          age_range?: Database["public"]["Enums"]["age_range"] | null
          allergies?: string[] | null
          cooking_for_one_mode?: boolean | null
          cooking_skill?: Database["public"]["Enums"]["cooking_skill"] | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          font_size_preference?: string | null
          full_name?: string | null
          household_size?: Database["public"]["Enums"]["household_size"] | null
          id?: string
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_budget?: Database["public"]["Enums"]["weekly_budget"] | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          cook_time_minutes: number | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          difficulty: number | null
          freezer_friendly: boolean | null
          health_tags: string[] | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: Json
          is_ai_generated: boolean | null
          is_favorite: boolean | null
          nutrition: Json | null
          prep_time_minutes: number | null
          servings: number | null
          storage_instructions: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cook_time_minutes?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          difficulty?: number | null
          freezer_friendly?: boolean | null
          health_tags?: string[] | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_ai_generated?: boolean | null
          is_favorite?: boolean | null
          nutrition?: Json | null
          prep_time_minutes?: number | null
          servings?: number | null
          storage_instructions?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cook_time_minutes?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          difficulty?: number | null
          freezer_friendly?: boolean | null
          health_tags?: string[] | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_ai_generated?: boolean | null
          is_favorite?: boolean | null
          nutrition?: Json | null
          prep_time_minutes?: number | null
          servings?: number | null
          storage_instructions?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          category: Database["public"]["Enums"]["grocery_category"] | null
          created_at: string | null
          estimated_price: number | null
          id: string
          is_checked: boolean | null
          name: string
          notes: string | null
          quantity: string | null
          shopping_list_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["grocery_category"] | null
          created_at?: string | null
          estimated_price?: number | null
          id?: string
          is_checked?: boolean | null
          name: string
          notes?: string | null
          quantity?: string | null
          shopping_list_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["grocery_category"] | null
          created_at?: string | null
          estimated_price?: number | null
          id?: string
          is_checked?: boolean | null
          name?: string
          notes?: string | null
          quantity?: string | null
          shopping_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string | null
          estimated_cost: number | null
          id: string
          is_active: boolean | null
          meal_plan_id: string | null
          name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          is_active?: boolean | null
          meal_plan_id?: string | null
          name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          is_active?: boolean | null
          meal_plan_id?: string | null
          name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_meal_planned_date: {
        Args: { meal_plan_item_id: string }
        Returns: string
      }
      owns_meal_plan: { Args: { _meal_plan_id: string }; Returns: boolean }
      owns_shopping_list: {
        Args: { _shopping_list_id: string }
        Returns: boolean
      }
    }
    Enums: {
      age_range:
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
        | "80+"
      cooking_skill: "beginner" | "comfortable" | "experienced"
      grocery_category:
        | "produce"
        | "dairy"
        | "proteins"
        | "grains"
        | "pantry"
        | "frozen"
        | "beverages"
        | "other"
      household_size: "1" | "2" | "3-4" | "5+"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
      weekly_budget: "budget-friendly" | "moderate" | "flexible"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      age_range: [
        "30-34",
        "35-39",
        "40-44",
        "45-49",
        "50-54",
        "55-59",
        "60-64",
        "65-69",
        "70-74",
        "75-79",
        "80+",
      ],
      cooking_skill: ["beginner", "comfortable", "experienced"],
      grocery_category: [
        "produce",
        "dairy",
        "proteins",
        "grains",
        "pantry",
        "frozen",
        "beverages",
        "other",
      ],
      household_size: ["1", "2", "3-4", "5+"],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
      weekly_budget: ["budget-friendly", "moderate", "flexible"],
    },
  },
} as const
