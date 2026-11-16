import { effect, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Gère le mode clair / sombre.
 * Les thèmes PrimeNG et nos variables CSS utilisent light-dark() :
 * il suffit donc de changer la propriété CSS `color-scheme` de la page.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Mode sombre par défaut (charte graphique du site) */
  readonly mode = signal<ThemeMode>(readSavedMode() ?? 'dark');

  constructor() {
    effect(() => {
      const mode = this.mode();
      document.documentElement.style.colorScheme = mode;
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // localStorage indisponible (navigation privée…) : le choix ne sera pas retenu
      }
    });
  }

  toggle(): void {
    this.mode.update((mode) => (mode === 'dark' ? 'light' : 'dark'));
  }
}

function readSavedMode(): ThemeMode | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}
