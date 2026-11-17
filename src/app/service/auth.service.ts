import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';

interface AuthResponse {
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/auth';

  readonly user = signal<string | null>(null);

  checkSession(): Observable<boolean> {
    return this.http.get<AuthResponse>(`${this.url}/me`).pipe(
      tap((response) => this.user.set(response.username)),
      map(() => true),
      catchError(() => {
        this.user.set(null);
        return of(false);
      }),
    );
  }

  login(username: string, password: string): Observable<void> {
    return this.http.post<AuthResponse>(`${this.url}/login`, { username, password }).pipe(
      tap((response) => this.user.set(response.username)),
      map(() => undefined),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, null).pipe(finalize(() => this.user.set(null)));
  }
}
