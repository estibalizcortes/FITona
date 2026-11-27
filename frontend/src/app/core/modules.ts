import type { FionaPose } from '../shared/fiona';

/** Registro único de módulos de FITona: pantalla principal, color, menú inferior y rutas salen de aquí. Añadir un módulo = añadir una entrada. */
export type ModuleId = 'food' | 'work' | 'health' | 'money' | 'sport' | 'care';

export interface ModuleNavItem { path: string; label: string; icon: string; exact?: boolean; add?: boolean; aria?: string }

export interface FitModule {
  id: ModuleId;
  name: string;
  description: string;
  /** Trazo SVG 24×24 (icono lineal, hereda el color del texto). */
  icon: string;
  /** Gesto de Fiona que ilustra la tarjeta del módulo. */
  pose: FionaPose;
  /** false = aún no construido: se muestra como «Próximamente» y no se puede abrir. */
  available: boolean;
  home: string;
  /** Rutas (prefijos) que pertenecen al módulo; deciden el menú inferior y el color. */
  owns: string[];
  /** Pantalla «Yo» del módulo. */
  me: string;
  nav: ModuleNavItem[];
}

export const MODULES: readonly FitModule[] = [
  {
    id: 'food', pose: 'cooking', name: 'Comida', description: 'Diario, recetas y plan del día', available: true, home: '/hoy', me: '/yo',
    icon: 'M4 11h16a8 8 0 0 1-16 0z M9 7c0-2 2-2 2-4 M14 7c0-2 2-2 2-4',
    owns: ['/hoy', '/plan', '/registrar', '/recetas', '/alimentos', '/yo'],
    nav: [
      { path: '/hoy', label: 'Hoy', icon: '🍽' },
      { path: '/alimentos', label: 'Alimentos', icon: '🥕' },
      { path: '/registrar', label: 'Registrar', icon: '＋', add: true, aria: 'Registrar comida' },
      { path: '/plan', label: 'Plan', icon: '📋' },
      { path: '/recetas', label: 'Recetas', icon: '📖' },
    ],
  },
  {
    id: 'work', pose: 'working', name: 'Trabajo', description: 'Notas, resúmenes y calendario', available: true, home: '/trabajo', me: '/trabajo/yo',
    icon: 'M3 8h18v11H3z M9 8V5h6v3 M3 13h18',
    owns: ['/trabajo'],
    nav: [
      { path: '/trabajo', label: 'Hoy', icon: '🏠', exact: true },
      { path: '/trabajo/calendario', label: 'Calendario', icon: '🗓' },
      { path: '/trabajo/registrar', label: 'Registrar', icon: '＋', add: true, aria: 'Registrar nota' },
      { path: '/trabajo/historial', label: 'Historial', icon: '🕘' },
    ],
  },
  { id: 'health', pose: 'resting', name: 'Salud', description: 'Medicación, citas y registros', available: false, home: '/salud', me: '/salud', owns: [], nav: [],
    icon: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z' },
  { id: 'money', pose: 'saving', name: 'Economía', description: 'Gastos, ingresos y presupuestos', available: false, home: '/economia', me: '/economia', owns: [], nav: [],
    icon: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5 M12 6v2 M12 16v2' },
  { id: 'sport', pose: 'sport', name: 'Deporte', description: 'Carreras, fuerza y progreso', available: false, home: '/deporte', me: '/deporte', owns: [], nav: [],
    icon: 'M5 13a7 7 0 1 0 14 0a7 7 0 1 0-14 0 M12 13V9 M9 3h6 M12 6V3' },
  { id: 'care', pose: 'care', name: 'Cuidado personal', description: 'Rutinas y productos', available: false, home: '/cuidado', me: '/cuidado', owns: [], nav: [],
    icon: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z' },
];

/** Módulo al que pertenece una URL (null: inicio, entrar, privacidad…). */
export function moduleOf(url: string): FitModule | null {
  const u = url.split('?')[0].split('#')[0];
  return MODULES.find((m) => m.available && m.owns.some((p) => u === p || u.startsWith(p + '/'))) ?? null;
}
