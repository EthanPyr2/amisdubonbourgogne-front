import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing), title: 'Les amis du bon Bourgogne' },
  { path: 'carte', loadComponent: () => import('./pages/list/list').then((m) => m.List), title: 'Notre sélection · Les amis du bon Bourgogne' },
  { path: 'mentions-legales', loadComponent: () => import('./pages/mentions-legales/mentions-legales').then((m) => m.MentionsLegales), title: 'Mentions légales · Les amis du bon Bourgogne' },
  { path: 'confidentialite', loadComponent: () => import('./pages/confidentialite/confidentialite').then((m) => m.Confidentialite), title: 'Confidentialité · Les amis du bon Bourgogne' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login), title: 'Connexion · Les amis du bon Bourgogne' },
  { path: 'admin', canActivate: [authGuard], loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin), title: 'Admin · Les amis du bon Bourgogne' },
  { path: '**', redirectTo: '' },
];
