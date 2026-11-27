import { Routes } from '@angular/router';
import { authGuard } from './core/session';

export const routes: Routes = [
  { path: 'entrar', title: 'Entrar · FITona', loadComponent: () => import('./pages/login-page').then((m) => m.LoginPage) },
  { path: 'privacidad', title: 'Privacidad · FITona', loadComponent: () => import('./pages/privacy-page').then((m) => m.PrivacyPage) },
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', canActivate: [authGuard], title: 'FITona', loadComponent: () => import('./pages/home-page').then((m) => m.HomePage) },
  // Módulo Comida (las rutas de siempre: /hoy, /registrar, /recetas, /alimentos, /yo) + Plan y perfil nutricional
  { path: 'plan', canActivate: [authGuard], title: 'Plan · FITona', loadComponent: () => import('./pages/plan-page').then((m) => m.PlanPage) },
  { path: 'yo/perfil', canActivate: [authGuard], title: 'Perfil nutricional · FITona', loadComponent: () => import('./pages/nutrition-profile-page').then((m) => m.NutritionProfilePage) },
  // Módulo Trabajo
  { path: 'trabajo', canActivate: [authGuard], title: 'Trabajo · FITona', loadComponent: () => import('./pages/work-today-page').then((m) => m.WorkTodayPage) },
  { path: 'trabajo/calendario', canActivate: [authGuard], title: 'Calendario · FITona', loadComponent: () => import('./pages/work-calendar-page').then((m) => m.WorkCalendarPage) },
  { path: 'trabajo/registrar', canActivate: [authGuard], title: 'Registrar · FITona', loadComponent: () => import('./pages/work-add-page').then((m) => m.WorkAddPage) },
  { path: 'trabajo/historial', canActivate: [authGuard], title: 'Historial · FITona', loadComponent: () => import('./pages/work-history-page').then((m) => m.WorkHistoryPage) },
  { path: 'trabajo/yo', canActivate: [authGuard], title: 'Yo · FITona', data: { module: 'work' }, loadComponent: () => import('./pages/me-page').then((m) => m.MePage) },
  { path: 'hoy', canActivate: [authGuard], title: 'Hoy · FITona', loadComponent: () => import('./pages/diary-page').then((m) => m.DiaryPage) },
  { path: 'registrar', canActivate: [authGuard], title: 'Registrar · FITona', loadComponent: () => import('./pages/add-page').then((m) => m.AddPage) },
  { path: 'alimentos', canActivate: [authGuard], title: 'Alimentos · FITona', loadComponent: () => import('./pages/foods-page').then((m) => m.FoodsPage) },
  { path: 'alimentos/nuevo', canActivate: [authGuard], title: 'Nuevo alimento · FITona', loadComponent: () => import('./pages/food-form-page').then((m) => m.FoodFormPage) },
  { path: 'alimentos/:id', canActivate: [authGuard], title: 'Editar alimento · FITona', loadComponent: () => import('./pages/food-form-page').then((m) => m.FoodFormPage) },
  { path: 'recetas', canActivate: [authGuard], title: 'Recetas · FITona', loadComponent: () => import('./pages/recipes-page').then((m) => m.RecipesPage) },
  { path: 'recetas/nueva', canActivate: [authGuard], title: 'Nueva receta · FITona', loadComponent: () => import('./pages/recipe-form-page').then((m) => m.RecipeFormPage) },
  { path: 'recetas/tipicas/:key', canActivate: [authGuard], title: 'Receta típica · FITona', loadComponent: () => import('./pages/template-detail-page').then((m) => m.TemplateDetailPage) },
  { path: 'recetas/:id/editar', canActivate: [authGuard], title: 'Editar receta · FITona', loadComponent: () => import('./pages/recipe-form-page').then((m) => m.RecipeFormPage) },
  { path: 'recetas/:id', canActivate: [authGuard], title: 'Receta · FITona', loadComponent: () => import('./pages/recipe-detail-page').then((m) => m.RecipeDetailPage) },
  { path: 'yo', canActivate: [authGuard], title: 'Yo · FITona', loadComponent: () => import('./pages/me-page').then((m) => m.MePage) },
  { path: 'ajustes', canActivate: [authGuard], title: 'Yo · FITona', data: { module: 'general' }, loadComponent: () => import('./pages/me-page').then((m) => m.MePage) },
  { path: 'mi-fiona', canActivate: [authGuard], title: 'Mi Fiona · FITona', loadComponent: () => import('./pages/mi-fiona-page').then((m) => m.MiFionaPage) },
  { path: '**', redirectTo: 'inicio' },
];
