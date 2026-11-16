import { WineColor } from '../model/wine.model';

/** 75 → « 75 cl », 37.5 → « 37,5 cl » */
export function formatVolume(volumeCl: number): string {
  return `${volumeCl.toLocaleString('fr-BE', { maximumFractionDigits: 1 })} cl`;
}

/** 32 → « 32,00 € » */
export function formatPrice(price: number): string {
  return price.toLocaleString('fr-BE', { style: 'currency', currency: 'EUR' });
}

/** Libellé affiché pour chaque valeur de l'enum WineColor */
export const COLOR_LABELS: Record<WineColor, string> = {
  ROUGE: 'Vin rouge',
  BLANC: 'Vin blanc',
  ROSE: 'Vin rosé',
  EFFERVESCENT: 'Effervescent',
  LIQUOREUX: 'Moelleux & liquoreux',
  AUTRE: 'Autre',
};
