import { Routes } from '@angular/router';

// loadComponent : le code d'une page n'est téléchargé que quand on l'ouvre
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing), title: 'Les amis du bon Bourgogne' },
  { path: 'carte', loadComponent: () => import('./pages/list/list').then((m) => m.List), title: 'Notre sélection · Les amis du bon Bourgogne' },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin), title: 'Admin · Les amis du bon Bourgogne' },
  { path: '**', redirectTo: '' },
];
