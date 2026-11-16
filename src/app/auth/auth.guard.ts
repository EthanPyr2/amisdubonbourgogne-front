import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../service/auth.service';

/** Protège une page : sans session active, redirige vers /login?redirect=<page demandée> */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth
    .checkSession()
    .pipe(map((connected) => connected || router.createUrlTree(['/login'], { queryParams: { redirect: state.url } })));
};
