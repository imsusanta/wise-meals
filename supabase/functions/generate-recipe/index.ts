import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecipeRequest {
  prompt: string;
  dietary_restrictions?: string[];
  allergies?: string[];
  servings?: number;
  max_prep_time?: number;
  cooking_skill?: string;
}

async function generateRecipeImage(title: string, description: string, apiKey: string): Promise<string | null> {
  try {
    const imagePrompt = `Professional food photography of "${title}". ${description}. Beautifully plated dish on a clean modern table setting, natural lighting, shallow depth of field, appetizing and delicious looking, high-end restaurant quality presentation. Ultra high resolution.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          { role: "user", content: imagePrompt }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      console.error("Image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    return imageUrl || null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      dietary_restrictions = [], 
      allergies = [], 
      servings = 2,
      max_prep_time,
      cooking_skill = "comfortable"
    }: RecipeRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a nutrition-focused recipe generator for health-conscious adults aged 30 and older. 
Create recipes that are:
- Easy to read with clear, simple instructions
- Health-conscious and suitable for busy lifestyles
- Balanced nutrition with attention to protein, fiber, and vitamins
- Scaled for ${servings} serving(s)
${max_prep_time ? `- Able to be prepared in ${max_prep_time} minutes or less` : ""}
${cooking_skill === "beginner" ? "- Simple with basic techniques only" : ""}
${dietary_restrictions.length > 0 ? `- Compliant with these dietary needs: ${dietary_restrictions.join(", ")}` : ""}
${allergies.length > 0 ? `- FREE of these allergens: ${allergies.join(", ")}` : ""}

IMPORTANT: Always return a valid JSON object with this exact structure:
{
  "title": "Recipe Name",
  "description": "Brief 1-2 sentence description",
  "prep_time_minutes": number,
  "cook_time_minutes": number,
  "servings": number,
  "difficulty": 1-3 (1=easy, 2=medium, 3=hard),
  "ingredients": [
    {"name": "ingredient name", "amount": "1 cup", "notes": "optional prep notes"}
  ],
  "instructions": [
    {"step": 1, "text": "Step description", "time_minutes": optional number}
  ],
  "nutrition": {
    "calories": number,
    "protein_g": number,
    "fiber_g": number,
    "sodium_mg": number,
    "calcium_mg": number
  },
  "health_tags": ["diabetes-friendly", "heart-healthy", etc.],
  "storage_instructions": "How to store leftovers",
  "freezer_friendly": boolean
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON from the response
    let recipe;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, content];
      recipe = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error("Failed to parse recipe JSON:", content);
      throw new Error("Failed to parse recipe from AI response");
    }

    // Generate image for the recipe
    const imageUrl = await generateRecipeImage(recipe.title, recipe.description, LOVABLE_API_KEY);
    if (imageUrl) {
      recipe.image_url = imageUrl;
    }

    return new Response(
      JSON.stringify({ recipe }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-recipe error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
