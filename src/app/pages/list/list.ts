import { Component, computed, inject, signal } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { Wine } from '../../model/wine.model';
import { WinePublicService } from '../../service/winePublic.service';
import { COLOR_LABELS, formatPrice, formatVolume } from '../../shared/format';

/** Une région de la carte, avec ses vins rangés par couleur */
interface RegionGroup {
  region: string;
  count: number;
  categories: { label: string; wines: Wine[] }[];
}

@Component({
  imports: [SelectModule],
  selector: 'app-list',
  styleUrl: './list.scss',
  templateUrl: './list.html',
})
export class List {
  private readonly winePublicService = inject(WinePublicService);

  // Listes visuelles (pas encore reliées à un filtre)
  protected readonly categoryOptions = ['Toutes', ...Object.values(COLOR_LABELS)];
  protected readonly sortOptions = ['Région et catégorie', 'Prix croissant', 'Prix décroissant', 'Nom'];
  protected readonly regions = ['Toutes les régions', 'Bourgogne', 'Rhône', 'Loire', 'Autres'];

  /** Vins disponibles, dans l'ordre de la carte (trié par le back : région, couleur, appellation) */
  protected readonly wines = signal<Wine[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  /** Regroupe les vins par région puis par couleur, en gardant l'ordre reçu du back */
  protected readonly groups = computed<RegionGroup[]>(() => {
    const groups: RegionGroup[] = [];
    for (const wine of this.wines()) {
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
    return groups;
  });

  protected readonly totalWines = computed(() => this.wines().length);

  // Fonctions d'affichage utilisées dans le template
  protected readonly formatVolume = formatVolume;
  protected readonly formatPrice = formatPrice;
  protected readonly colorLabel = (wine: Wine) => COLOR_LABELS[wine.color];

  constructor() {
    this.winePublicService.list().subscribe({
      next: (wines) => {
        this.wines.set(wines);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  /** Slugs des vins dont la fiche est dépliée (bouton + / −) */
  private readonly openWines = signal<ReadonlySet<string>>(new Set());

  protected isOpen(wine: Wine): boolean {
    return this.openWines().has(wine.slug);
  }

  protected toggle(wine: Wine): void {
    this.openWines.update((open) => {
      const next = new Set(open);
      next.has(wine.slug) ? next.delete(wine.slug) : next.add(wine.slug);
      return next;
    });
  }
}
