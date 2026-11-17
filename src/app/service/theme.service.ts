import { effect, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(readSavedMode() ?? 'dark');

  constructor() {
    effect(() => {
      const mode = this.mode();
      document.documentElement.style.colorScheme = mode;
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
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
