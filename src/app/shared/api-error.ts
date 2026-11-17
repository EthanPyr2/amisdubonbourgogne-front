import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  const detail = typeof error.error?.detail === 'string' ? error.error.detail : null;
  const technical = !detail || /^(Invalid request content|Failed to read request|Validation failed)/i.test(detail);
  if (detail && !technical) {
    return detail;
  }
  switch (error.status) {
    case 0:
      return 'Le serveur ne répond pas. Vérifiez votre connexion et réessayez.';
    case 400:
      return 'Certaines informations sont invalides ou incomplètes.';
    case 404:
      return "Ce vin n'existe plus (il a peut-être été supprimé entre-temps).";
    case 409:
      return 'Cette opération entre en conflit avec les données existantes.';
    default:
      return fallback;
  }
}
