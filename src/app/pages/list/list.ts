import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { Wine, WineColor } from '../../model/wine.model';
import { WinePublicService } from '../../service/winePublic.service';
import { COLOR_LABELS, formatPrice, formatVolume } from '../../shared/format';

type SortKey = 'carte' | 'prix-asc' | 'prix-desc' | 'nom';

/**
 * Boutons de région. Une entrée regroupe un ou plusieurs slugs de régions en base
 * (le Rhône réunit Nord et Sud). « Autres » = toutes les régions non listées ici.
 * La clé est celle de l'URL : /carte?region=rhone (utilisée aussi par les tuiles de la landing).
 */
const REGION_FILTERS = [
  { key: 'bourgogne', label: 'Bourgogne', slugs: ['bourgogne'] },
  { key: 'rhone', label: 'Rhône', slugs: ['vallee-du-rhone-nord', 'vallee-du-rhone-sud'] },
  { key: 'loire', label: 'Loire', slugs: ['loire'] },
] as const;
const KNOWN_SLUGS: string[] = REGION_FILTERS.flatMap((r) => [...r.slugs]);

/** Texte en minuscules sans accents : « Côtes » → « cotes » */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function minPrice(wine: Wine): number {
  return Math.min(...wine.formats.map((f) => f.price));
}

/** Une région de la carte, avec ses vins rangés par couleur */
interface RegionGroup {
  region: string;
  count: number;
  categories: { label: string; wines: Wine[] }[];
}

@Component({
  imports: [FormsModule, SelectModule],
  selector: 'app-list',
  styleUrl: './list.scss',
  templateUrl: './list.html',
})
export class List {
  private readonly winePublicService = inject(WinePublicService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // --- Choix proposés dans les filtres ---
  protected readonly categoryOptions: { label: string; value: WineColor | null }[] = [
    { label: 'Toutes', value: null },
    ...(Object.entries(COLOR_LABELS) as [WineColor, string][]).map(([value, label]) => ({ label, value })),
  ];
  protected readonly sortOptions: { label: string; value: SortKey }[] = [
    { label: 'Région et catégorie', value: 'carte' },
    { label: 'Prix croissant', value: 'prix-asc' },
    { label: 'Prix décroissant', value: 'prix-desc' },
    { label: 'Nom', value: 'nom' },
  ];
  protected readonly regionButtons: { key: string | null; label: string }[] = [
    { key: null, label: 'Toutes les régions' },
    ...REGION_FILTERS.map((r) => ({ key: r.key, label: r.label })),
    { key: 'autres', label: 'Autres' },
  ];

  // --- État des filtres ---
  protected readonly search = signal('');
  protected readonly color = signal<WineColor | null>(null);
  protected readonly sort = signal<SortKey>('carte');
  /** Région choisie : lue dans l'URL (?region=…), null = toutes */
  protected readonly region = signal<string | null>(null);
  /** « Nos découvertes » : seulement les vins en vedette, lu dans l'URL (?selection=vedette) */
  protected readonly featuredOnly = signal(false);
  /** Slugs des vins en vedette (GET /api/wines/featured) : la liste publique ne porte pas cette info */
  private readonly featuredSlugs = signal<ReadonlySet<string>>(new Set());

  /** Vins disponibles, dans l'ordre de la carte (trié par le back : région, couleur, appellation) */
  protected readonly wines = signal<Wine[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  /** Vins qui passent tous les filtres, triés selon « Trier par » */
  protected readonly filteredWines = computed(() => {
    const term = normalize(this.search().trim());
    const region = this.region();
    const filtered = this.wines().filter(
      (wine) =>
        (!this.color() || wine.color === this.color()) &&
        this.matchesRegion(wine, region) &&
        (!this.featuredOnly() || this.featuredSlugs().has(wine.slug)) &&
        (!term ||
          normalize([wine.appellation, wine.cuvee, wine.producer, wine.region.name, wine.grapes, wine.vintage].join(' ')).includes(term)),
    );
    switch (this.sort()) {
      case 'prix-asc':
        return [...filtered].sort((a, b) => minPrice(a) - minPrice(b));
      case 'prix-desc':
        return [...filtered].sort((a, b) => minPrice(b) - minPrice(a));
      case 'nom':
        return [...filtered].sort((a, b) => a.appellation.localeCompare(b.appellation, 'fr'));
      default:
        return filtered; // ordre de la carte, fourni par le back
    }
  });

  /**
   * Regroupe les vins filtrés par région puis par couleur.
   * Les groupes gardent l'ordre de la carte ; le tri choisi s'applique à l'intérieur de chaque groupe.
   */
  protected readonly groups = computed<RegionGroup[]>(() => {
    const regionOrder = [...new Set(this.wines().map((w) => w.region.name))];
    const colorOrder = Object.keys(COLOR_LABELS);
    const groups: RegionGroup[] = [];
    for (const wine of this.filteredWines()) {
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
      group.categories.sort(
        (a, b) => colorOrder.indexOf(colorKey(a.label)) - colorOrder.indexOf(colorKey(b.label)),
      );
    }
    return groups;
  });

  protected readonly totalWines = computed(() => this.filteredWines().length);
  protected readonly hasActiveFilters = computed(
    () =>
      !!this.search().trim() || !!this.color() || !!this.region() || this.featuredOnly() || this.sort() !== 'carte',
  );

  // Fonctions d'affichage utilisées dans le template
  protected readonly formatVolume = formatVolume;
  protected readonly formatPrice = formatPrice;
  protected readonly colorLabel = (wine: Wine) => COLOR_LABELS[wine.color];

  constructor() {
    // La région vient de l'URL : boutons de région, tuiles de la landing, lien partagé
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        this.region.set(params.get('region'));
        this.featuredOnly.set(params.get('selection') === 'vedette');
      });

    // Les deux listes en parallèle : tous les vins disponibles + ceux en vedette
    forkJoin({ all: this.winePublicService.list(), featured: this.winePublicService.listFeatured() }).subscribe({
      next: ({ all, featured }) => {
        this.wines.set(all);
        this.featuredSlugs.set(new Set(featured.map((w) => w.slug)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  /** Bouton de région : met à jour l'URL (?region=…), ce qui met à jour le filtre */
  protected selectRegion(key: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { region: key },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /** Bouton « Nos découvertes » : active / désactive le filtre via l'URL (?selection=vedette) */
  protected toggleFeatured(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { selection: this.featuredOnly() ? null : 'vedette' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected resetFilters(): void {
    this.search.set('');
    this.color.set(null);
    this.sort.set('carte');
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  private matchesRegion(wine: Wine, key: string | null): boolean {
    if (!key) return true;
    if (key === 'autres') return !KNOWN_SLUGS.includes(wine.region.slug);
    const filter = REGION_FILTERS.find((r) => r.key === key);
    return filter ? (filter.slugs as readonly string[]).includes(wine.region.slug) : true;
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

/** Retrouve la clé WineColor à partir de son libellé (pour ordonner les catégories) */
function colorKey(label: string): string {
  return Object.entries(COLOR_LABELS).find(([, l]) => l === label)?.[0] ?? '';
}
