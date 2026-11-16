import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '../../service/theme.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
  host: {
    // Touche Échap : referme le menu mobile
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class Navbar {
  protected readonly theme = inject(ThemeService);

  /** Menu mobile (burger) ouvert ? */
  protected readonly menuOpen = signal(false);

  constructor() {
    // Changement de page : on referme le menu mobile
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Lien « Contact » : défile jusqu'au footer de la page actuelle */
  protected scrollToContact(event: Event): void {
    event.preventDefault(); // sinon le navigateur changerait l'URL et Angular naviguerait
    this.closeMenu();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
