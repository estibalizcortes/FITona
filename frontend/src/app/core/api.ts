import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CalcResponse, Diary, DiaryEntry, Food, FoodRequest, FoodResponse, ItemRequest, Recipe, RecipeRequest,
  RecipeSummary, Reference,
} from './models';

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1';

  reference(): Promise<Reference> { return firstValueFrom(this.http.get<Reference>(`${this.base}/reference`)); }

  searchFoods(q: string): Promise<Food[]> {
    return firstValueFrom(this.http.get<Food[]>(`${this.base}/foods`, { params: { q, limit: 25 } }));
  }
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
  deleteRecipe(id: string): Promise<void> { return firstValueFrom(this.http.delete<void>(`${this.base}/recipes/${id}`)); }

  exportData(): Promise<unknown> { return firstValueFrom(this.http.get<unknown>(`${this.base}/me/export`)); }
  deleteAccount(): Promise<void> { return firstValueFrom(this.http.delete<void>(`${this.base}/me`)); }
}

/** Mensaje legible de un error HTTP (problem+json del backend). */
export function errorMessage(e: unknown): string {
  const err = e as { error?: { detail?: string; title?: string }; status?: number };
  if (err?.error?.detail) return err.error.detail;
  if (err?.status === 0) return 'No se puede conectar con el servidor.';
  if (err?.status === 401) return 'No autenticado (¿está activado el modo de desarrollo del backend?).';
  return 'Ha ocurrido un error inesperado.';
}
