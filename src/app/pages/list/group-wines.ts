import { Wine } from '../../model/wine.model';
import { COLOR_LABELS } from '../../shared/format';

export interface RegionGroup {
  region: string;
  count: number;
  categories: { label: string; wines: Wine[] }[];
}

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

function colorKey(label: string): string {
  return Object.entries(COLOR_LABELS).find(([, l]) => l === label)?.[0] ?? '';
}
