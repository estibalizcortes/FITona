import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CalcResponse, Diary, DiaryEntry, Food, FoodCategory, FoodRequest, FoodResponse, ItemRequest, Recipe, RecipeRequest,
  RecipeSummary, Reference, TemplateDetail, TemplateSummary, CalendarDay, NutritionProfile, NutritionProfileResponse, PlanCandidate,
  PlanChosen, PlanResponse, PlanSlot, WorkEntry, WorkEntryRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1';

  reference(): Promise<Reference> { return firstValueFrom(this.http.get<Reference>(`${this.base}/reference`)); }

  searchFoods(q: string, category: string | null = null, limit = 25): Promise<Food[]> {
    const params: Record<string, string | number> = { q, limit };
    if (category) params['category'] = category;
    return firstValueFrom(this.http.get<Food[]>(`${this.base}/foods`, { params }));
  }
  foodCategories(): Promise<FoodCategory[]> { return firstValueFrom(this.http.get<FoodCategory[]>(`${this.base}/foods/categories`)); }
  getFood(id: number): Promise<Food> { return firstValueFrom(this.http.get<Food>(`${this.base}/foods/${id}`)); }
  createFood(r: FoodRequest): Promise<FoodResponse> { return firstValueFrom(this.http.post<FoodResponse>(`${this.base}/foods`, r)); }
  updateFood(id: number, r: FoodRequest): Promise<FoodResponse> { return firstValueFrom(this.http.put<FoodResponse>(`${this.base}/foods/${id}`, r)); }
  deleteFood(id: number): Promise<void> { return firstValueFrom(this.http.delete<void>(`${this.base}/foods/${id}`)); }

  calc(items: ItemRequest[]): Promise<CalcResponse> { return firstValueFrom(this.http.post<CalcResponse>(`${this.base}/calc`, { items })); }

  diary(date: string): Promise<Diary> { return firstValueFrom(this.http.get<Diary>(`${this.base}/diary`, { params: { date } })); }
  createEntry(body: { id?: string; date: string; mealSlot: string; note?: string; items: ItemRequest[] }): Promise<DiaryEntry> {
    return firstValueFrom(this.http.post<DiaryEntry>(`${this.base}/diary/entries`, body));
  }
  deleteEntry(id: string): Promise<void> { return firstValueFrom(this.http.delete<void>(`${this.base}/diary/entries/${id}`)); }

  recipes(): Promise<RecipeSummary[]> { return firstValueFrom(this.http.get<RecipeSummary[]>(`${this.base}/recipes`)); }
  recipe(id: string): Promise<Recipe> { return firstValueFrom(this.http.get<Recipe>(`${this.base}/recipes/${id}`)); }
  createRecipe(r: RecipeRequest): Promise<Recipe> { return firstValueFrom(this.http.post<Recipe>(`${this.base}/recipes`, r)); }
  updateRecipe(id: string, r: RecipeRequest): Promise<Recipe> { return firstValueFrom(this.http.put<Recipe>(`${this.base}/recipes/${id}`, r)); }
  recipeTemplates(): Promise<TemplateSummary[]> { return firstValueFrom(this.http.get<TemplateSummary[]>(`${this.base}/recipes/templates`)); }
  recipeTemplate(key: string): Promise<TemplateDetail> { return firstValueFrom(this.http.get<TemplateDetail>(`${this.base}/recipes/templates/${key}`)); }
  copyRecipeTemplate(key: string): Promise<Recipe> { return firstValueFrom(this.http.post<Recipe>(`${this.base}/recipes/templates/${key}/copy`, {})); }
  deleteRecipe(id: string): Promise<void> { return firstValueFrom(this.http.delete<void>(`${this.base}/recipes/${id}`)); }

  register(b: { email: string; password: string; adult: boolean; healthConsent: boolean }): Promise<{ token: string; email: string }> {
    return firstValueFrom(this.http.post<{ token: string; email: string }>(`${this.base}/auth/register`, b));
  }
  login(email: string, password: string): Promise<{ token: string; email: string }> {
    return firstValueFrom(this.http.post<{ token: string; email: string }>(`${this.base}/auth/login`, { email, password }));
  }
  logout(): Promise<void> { return firstValueFrom(this.http.post<void>(`${this.base}/auth/logout`, {})); }

  // Módulo Comida
  nutritionProfile(): Promise<NutritionProfileResponse | null> {
    return firstValueFrom(this.http.get<NutritionProfileResponse | null>(`${this.base}/nutrition/profile`));
  }
  saveNutritionProfile(p: NutritionProfile): Promise<NutritionProfileResponse> {
    return firstValueFrom(this.http.put<NutritionProfileResponse>(`${this.base}/nutrition/profile`, p));
  }
  planOptions(): Promise<PlanCandidate[]> { return firstValueFrom(this.http.get<PlanCandidate[]>(`${this.base}/plan/options`)); }
  planSuggest(body: { targetKcal?: number | null; date: string; chosen: PlanChosen[] }): Promise<PlanResponse> {
    return firstValueFrom(this.http.post<PlanResponse>(`${this.base}/plan/suggest`, body));
  }
  planLog(body: { id: string; date: string; slot: PlanSlot; kind: 'TEMPLATE' | 'RECIPE'; key?: string | null; recipeId?: string | null; servings: number }): Promise<DiaryEntry> {
    return firstValueFrom(this.http.post<DiaryEntry>(`${this.base}/plan/log`, body));
  }

  // Módulo Trabajo
  workDay(date: string): Promise<WorkEntry[]> { return firstValueFrom(this.http.get<WorkEntry[]>(`${this.base}/work/entries`, { params: { date } })); }
  workCalendar(month: string): Promise<CalendarDay[]> { return firstValueFrom(this.http.get<CalendarDay[]>(`${this.base}/work/calendar`, { params: { month } })); }
  workSearch(q: string, kind: string, offset: number, limit = 30): Promise<WorkEntry[]> {
    return firstValueFrom(this.http.get<WorkEntry[]>(`${this.base}/work/entries/search`, { params: { q, kind, offset, limit } }));
  }
  workEntry(id: string): Promise<WorkEntry> { return firstValueFrom(this.http.get<WorkEntry>(`${this.base}/work/entries/${id}`)); }
  createWorkEntry(r: WorkEntryRequest): Promise<WorkEntry> { return firstValueFrom(this.http.post<WorkEntry>(`${this.base}/work/entries`, r)); }
  updateWorkEntry(id: string, r: WorkEntryRequest): Promise<WorkEntry> { return firstValueFrom(this.http.put<WorkEntry>(`${this.base}/work/entries/${id}`, r)); }
  deleteWorkEntry(id: string): Promise<void> { return firstValueFrom(this.http.delete<void>(`${this.base}/work/entries/${id}`)); }

  exportData(): Promise<unknown> { return firstValueFrom(this.http.get<unknown>(`${this.base}/me/export`)); }
  deleteAccount(): Promise<void> { return firstValueFrom(this.http.delete<void>(`${this.base}/me`)); }
}

/** Mensaje legible de un error HTTP (problem+json del backend). */
export function errorMessage(e: unknown): string {
  const err = e as { error?: { detail?: string; title?: string }; status?: number };
  if (err?.error?.detail) return err.error.detail;
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const status = err?.status ?? -1;
  // Sin red: el navegador da 0; con el service worker activo da un 504 vacío. Con el servidor gratuito dormido: 502/503/504.
  if (offline && (status === 0 || status === 502 || status === 503 || status === 504)) {
    return 'Sin conexión a Internet. Revisa tu red y vuelve a intentarlo: no se ha guardado nada.';
  }
  if (status === 0) return 'No se puede conectar con el servidor. Si acaba de estar parado, puede estar despertando: espera un minuto y reintenta.';
  if (status === 502 || status === 503 || status === 504) {
    return 'El servidor no responde ahora mismo (el alojamiento gratuito puede estar despertando). Espera un minuto y vuelve a intentarlo.';
  }
  if (status === 401) return 'Tu sesión ha caducado. Vuelve a iniciar sesión.';
  return 'Ha ocurrido un error inesperado.';
}
