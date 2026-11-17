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
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class Navbar {
  protected readonly theme = inject(ThemeService);

  protected readonly menuOpen = signal(false);

  constructor() {
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

  protected scrollToContact(event: Event): void {
    event.preventDefault();
    this.closeMenu();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
