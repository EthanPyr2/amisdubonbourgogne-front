import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template:`
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
}
