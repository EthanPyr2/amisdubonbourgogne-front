import { Routes } from '@angular/router';

export const routes: Routes = [
  // loadComponent : le code de la page n'est téléchargé que quand on l'ouvre
  { path: '', loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin), title: 'Admin' },
];
