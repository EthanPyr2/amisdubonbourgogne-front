import { Wine } from '../../model/wine.model';
import { COLOR_LABELS } from '../../shared/format';

/** Une région de la carte, avec ses vins rangés par couleur */
export interface RegionGroup {
  region: string;
  count: number;
  categories: { label: string; wines: Wine[] }[];
}

/**
 * Regroupe des vins par région puis par couleur.
 * Les régions suivent `regionOrder` (l'ordre de la carte), les couleurs l'ordre de COLOR_LABELS ;
 * à l'intérieur d'un groupe, les vins gardent l'ordre de la liste reçue.
 * Utilisé par la page carte et par le PDF.
 */
export function groupWines(wines: Wine[], regionOrder: string[]): RegionGroup[] {
  const colorOrder = Object.keys(COLOR_LABELS);
  const groups: RegionGroup[] = [];
  for (const wine of wines) {
    let group = groups.find((g) => g.region === wine.region.name);
    if (!group) {
      group = { region: wine.region.name, count: 0, categories: [] };
      groups.push(group);
    }
    const label = COLOR_LABELS[wine.color];
    let category = group.categories.find((c) => c.label === label);
    if (!category) {
      category = { label, wines: [] };
      group.categories.push(category);
    }
    category.wines.push(wine);
    group.count++;
  }
  groups.sort((a, b) => regionOrder.indexOf(a.region) - regionOrder.indexOf(b.region));
  for (const group of groups) {
    group.categories.sort((a, b) => colorOrder.indexOf(colorKey(a.label)) - colorOrder.indexOf(colorKey(b.label)));
  }
  return groups;
}

/** Retrouve la clé WineColor à partir de son libellé (pour ordonner les catégories) */
function colorKey(label: string): string {
  return Object.entries(COLOR_LABELS).find(([, l]) => l === label)?.[0] ?? '';
}
