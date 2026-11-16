import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../service/auth.service';
import { apiErrorMessage } from '../../shared/api-error';

@Component({
  imports: [FormsModule, RouterLink, ButtonModule, InputTextModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Page à ouvrir après connexion (?redirect=/admin), limitée aux pages du site */
  private readonly redirect = (() => {
    const target = inject(ActivatedRoute).snapshot.queryParamMap.get('redirect') ?? '';
    return target.startsWith('/') && !target.startsWith('//') ? target : '/admin';
  })();

  protected username = '';
  protected password = '';
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  constructor() {
    // Prépare le cookie CSRF (nécessaire au POST de connexion) et passe directement si déjà connecté
    this.auth.checkSession().subscribe((connected) => {
      if (connected) this.router.navigateByUrl(this.redirect);
    });
  }

  protected onSubmit(form: NgForm): void {
    if (form.invalid || this.submitting()) {
      form.control.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => this.router.navigateByUrl(this.redirect),
      error: (err) => {
        this.submitting.set(false);
        this.password = '';
        this.error.set(
          err.status === 401
            ? 'Identifiant ou mot de passe incorrect.'
            : apiErrorMessage(err, 'Connexion impossible pour le moment. Réessayez.'), // ex. 429 : trop de tentatives
        );
      },
    });
  }
}
