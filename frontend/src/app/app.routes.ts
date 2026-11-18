import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'hoy' },
  { path: 'hoy', title: 'Hoy · FITona', loadComponent: () => import('./pages/diary-page').then((m) => m.DiaryPage) },
  { path: 'registrar', title: 'Registrar · FITona', loadComponent: () => import('./pages/add-page').then((m) => m.AddPage) },
  { path: 'alimentos', title: 'Alimentos · FITona', loadComponent: () => import('./pages/foods-page').then((m) => m.FoodsPage) },
  { path: 'alimentos/nuevo', title: 'Nuevo alimento · FITona', loadComponent: () => import('./pages/food-form-page').then((m) => m.FoodFormPage) },
  { path: 'alimentos/:id', title: 'Editar alimento · FITona', loadComponent: () => import('./pages/food-form-page').then((m) => m.FoodFormPage) },
  { path: 'recetas', title: 'Recetas · FITona', loadComponent: () => import('./pages/recipes-page').then((m) => m.RecipesPage) },
  { path: 'recetas/nueva', title: 'Nueva receta · FITona', loadComponent: () => import('./pages/recipe-form-page').then((m) => m.RecipeFormPage) },
  { path: 'recetas/:id', title: 'Receta · FITona', loadComponent: () => import('./pages/recipe-detail-page').then((m) => m.RecipeDetailPage) },
  { path: 'yo', title: 'Yo · FITona', loadComponent: () => import('./pages/me-page').then((m) => m.MePage) },
  { path: '**', redirectTo: 'hoy' },
];
