export type Mode = 'SIMPLE' | 'BALANCED' | 'ADVANCED';

export type NutrientKey =
  | 'energyKcal' | 'proteinG' | 'carbsG' | 'sugarsG' | 'fatG' | 'satFatG' | 'fiberG' | 'saltG' | 'alcoholG';

/** Valores por 100 g. null/ausente = DESCONOCIDO (nunca 0). */
export type Nutrients = Partial<Record<NutrientKey, number | null>>;

export interface Portion { unitCode: string; grams: number; precision?: string }

export interface Food {
  variantId: number;
  foodId: number;
  name: string;
  displayName: string;
  quality: string;
  basis: string;
  per100: Nutrients;
  densityGPerMl: number | null;
  portions: Portion[];
  editable: boolean;
  source: string;
  icon: string | null;
  categoryCode: string | null;
  categoryName: string | null;
  /** false = está en el catálogo pero aún sin datos nutricionales (no se inventan). */
  hasNutrients: boolean;
  overridesCatalog: boolean;
}

export interface FoodCategory { code: string; name: string; icon: string; count: number }

export interface FoodRequest {
  name: string;
  per100: Nutrients;
  densityGPerMl?: number | null;
  portions?: Portion[];
  categoryCode?: string | null;
  /** Variante del catálogo a la que sustituye (solo para ti) con estos valores. */
  basedOnVariantId?: number | null;
}

export interface FoodResponse { food: Food; warnings: string[] }

export interface TotalValue { value: number | null; complete: boolean }

export interface Totals {
  nutrients: Record<NutrientKey, TotalValue>;
  quality: string;
  precision: string;
}

export interface ItemRequest {
  variantId?: number;
  recipeId?: string;
  quantity?: number;
  unitCode?: string;
  servings?: number;
  freeText?: string;
}

export interface CalcResponse {
  items: { kind: string; displayName: string; grams: number | null; totals: Totals }[];
  total: Totals;
}

export interface DiaryItem {
  id: string; kind: string; displayName: string; quantity: number | null; unitCode: string | null;
  grams: number | null; servings: number | null; totals: Totals;
}
export interface DiaryEntry {
  id: string; date: string; mealSlot: string; note: string | null; items: DiaryItem[]; totals: Totals;
}
export interface Diary { date: string; entries: DiaryEntry[]; totals: Totals }

export interface RecipeSummary {
  id: string; title: string; servings: number; completeness: string; energyKcalPerServing: number | null;
  proteinGPerServing: number | null; carbsGPerServing: number | null; fatGPerServing: number | null;
}
export interface RecipeIngredientRequest {
  variantId?: number | null; freeText?: string | null; quantity?: number | null; unitCode?: string | null; note?: string | null;
}
export interface RecipeRequest {
  title: string; description?: string | null; servings: number; prepMinutes?: number | null; cookMinutes?: number | null;
  ingredients: RecipeIngredientRequest[]; steps?: { instruction: string; durationMinutes?: number | null }[];
}
export interface Recipe {
  id: string; title: string; description: string | null; servings: number; prepMinutes: number | null;
  cookMinutes: number | null; version: number; completeness: string;
  ingredients: { variantId: number | null; name: string; freeText: string | null; quantity: number | null; unitCode: string | null; grams: number | null; note: string | null }[];
  steps: { number: number; instruction: string; durationMinutes: number | null }[];
  perServing: Totals; total: Totals;
}

export interface TemplateSummary { key: string; title: string; servings: number; ingredients: number; ingredientNames: string[] }
export interface TemplateDetail {
  key: string; title: string; description: string | null; servings: number;
  ingredients: { food: string; label: string | null; quantity: number; unit: string; note: string | null }[]; steps: string[];
}

export interface Unit { code: string; kind: string; singular: string; plural: string }
export interface Reference { units: Unit[]; mealSlots: { code: string; name: string }[] }
