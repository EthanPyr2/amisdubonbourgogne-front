import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && req.url.startsWith('/api/admin')) {
        auth.user.set(null);
        router.navigate(['/login'], { queryParams: { redirect: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
