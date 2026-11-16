import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';
import { providePrimeNG } from 'primeng/config';
import { AmisDuBonBourgognePreset } from './theme';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // Lien « Contact » → défile jusqu'à #contact ; retour en haut de page à chaque navigation
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    providePrimeNG({
      license:
        'eyJpZCI6IjIwYzM4ZjYyLTFhZjItNDk1OC1iZmEwLTAwN2YxYzU1MWZlNSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3OTQ4MjUxNDUsImV4cCI6MTgyNjM2MTE0NX0.eyP8a1btTBISsBh8vxxQOtBvbMbXP_4WB2VfWwSg3-iLW1u9N2Ae4gP2X69LFZD-PZ8B9k8jp30YjCqbELKQAQ',
      theme: {
        preset: AmisDuBonBourgognePreset,
        options: {
          // Place les styles PrimeNG dans la couche « primeng » (voir src/tailwind.css)
          cssLayer: { name: 'primeng', order: 'theme, base, primeng' },
        },
      },
    }),
  ]
};
