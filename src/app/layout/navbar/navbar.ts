import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../service/theme.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly theme = inject(ThemeService);

  /** Lien « Contact » : défile jusqu'au footer de la page actuelle */
  protected scrollToContact(event: Event): void {
    event.preventDefault(); // sinon le navigateur changerait l'URL et Angular naviguerait
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
