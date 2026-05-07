import { Routes } from '@angular/router';

/** ARES Platform — Application Routes
 * All feature routes are lazy-loaded for optimal bundle splitting.
 * Shell layout wraps all authenticated routes.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard — ARES Platform',
      },
      {
        path: 'devices',
        loadComponent: () => import('./features/devices/devices.component').then(m => m.DevicesComponent),
        title: 'Device Fleet — ARES Platform',
      },
      {
        path: 'threats',
        loadComponent: () => import('./features/threats/threats.component').then(m => m.ThreatsComponent),
        title: 'Threat Intelligence — ARES Platform',
      },
      {
        path: 'exercises',
        loadComponent: () => import('./features/exercises/exercises.component').then(m => m.ExercisesComponent),
        title: 'Live Exercises — ARES Platform',
      },
      {
        path: 'ai-defense',
        loadComponent: () => import('./features/ai-defense/ai-defense.component').then(m => m.AiDefenseComponent),
        title: 'AI Defender — ARES Platform',
      },
      {
        path: 'scenarios',
        loadComponent: () => import('./features/scenarios/scenarios.component').then(m => m.ScenariosComponent),
        title: 'Scenario Builder — ARES Platform',
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings — ARES Platform',
      },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
