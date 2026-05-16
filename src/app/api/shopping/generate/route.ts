import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Ingredient } from "@/types/database";

export async function POST(request: NextRequest) {
  const familyId = request.headers.get("x-family-id");
  if (!familyId) {
    return NextResponse.json({ error: "Missing family ID" }, { status: 400 });
  }

  try {
    const { weekStart } = await request.json();
    const supabase = createServerClient();

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const { data: mealPlans } = await supabase
      .from("meal_plans")
      .select("id, dish:dishes(name, ingredients)")
      .eq("family_id", familyId)
      .gte("meal_date", weekStart)
      .lte("meal_date", weekEndStr);

    if (!mealPlans || mealPlans.length === 0) {
      return NextResponse.json(
        { error: "No meals planned this week" },
        { status: 400 }
      );
    }

    // Collect all ingredients from planned dishes
    const ingredientMap = new Map<string, { quantity: string; category: string; mealPlanId: string }>();

    for (const mp of mealPlans) {
      const dish = mp.dish as { name: string; ingredients: Ingredient[] } | null;
      if (!dish?.ingredients) continue;

      for (const ing of dish.ingredients) {
        if (!ing.name.trim()) continue;
        const key = ing.name.toLowerCase().trim();
        const existing = ingredientMap.get(key);

        if (existing) {
          // Combine quantities if both exist
          if (ing.quantity && existing.quantity) {
            existing.quantity = `${existing.quantity}, ${ing.quantity}${ing.unit ? " " + ing.unit : ""}`;
          }
        } else {
          ingredientMap.set(key, {
            quantity: ing.quantity
              ? `${ing.quantity}${ing.unit ? " " + ing.unit : ""}`
              : "",
            category: ing.category || "Other",
            mealPlanId: mp.id,
          });
        }
      }
    }

    if (ingredientMap.size === 0) {
      return NextResponse.json(
        { error: "No ingredients found on planned dishes. Add ingredients to your dishes first." },
        { status: 400 }
      );
    }

    // Remove existing auto-generated items for this family
    await supabase
      .from("shopping_items")
      .delete()
      .eq("family_id", familyId)
      .eq("source", "auto");

    // Insert new auto items
    const items = Array.from(ingredientMap.entries()).map(([name, data]) => ({
      family_id: familyId,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      quantity: data.quantity || null,
      category: data.category,
      source: "auto",
      meal_plan_id: data.mealPlanId,
    }));

    const { data, error } = await supabase
      .from("shopping_items")
      .insert(items)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ generated: data?.length || 0, items: data });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
