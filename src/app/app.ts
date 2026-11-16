import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from './service/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule],
  template:`
    <div class="flex justify-end px-6 pt-4">
      <button
        pButton
        type="button"
        [outlined]="true"
        class="rounded-full"
        (click)="theme.toggle()"
        [attr.aria-label]="theme.mode() === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'"
      >
        {{ theme.mode() === 'dark' ? 'Mode clair' : '☾ Mode sombre' }}
      </button>
    </div>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    .content {
      padding: 1.5rem;
      margin: 0 auto;
      }
  `
})
export class App {
  protected readonly title = signal('mon-projet');
  protected readonly theme = inject(ThemeService);
}
