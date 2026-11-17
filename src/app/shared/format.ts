import { WineColor } from '../model/wine.model';

export function formatVolume(volumeCl: number): string {
  return `${volumeCl.toLocaleString('fr-BE', { maximumFractionDigits: 1 })} cl`;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('fr-BE', { style: 'currency', currency: 'EUR' });
}

export const COLOR_LABELS: Record<WineColor, string> = {
  ROUGE: 'Vin rouge',
  BLANC: 'Vin blanc',
  ROSE: 'Vin rosé',
  EFFERVESCENT: 'Effervescent',
  LIQUOREUX: 'Moelleux & liquoreux',
  AUTRE: 'Autre',
};
