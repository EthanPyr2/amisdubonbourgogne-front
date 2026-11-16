import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Wine, WineColor } from '../../model/wine.model';
import { WinePublicService } from '../../service/winePublic.service';

/** Une tuile de la section « Discover » */
interface Terroir {
  title: string;
  tagline: string;
  /** Paramètre envoyé à la carte (/carte?region=…), null = toute la carte */
  region: string | null;
}

@Component({
  imports: [RouterLink],
  selector: 'app-landing',
  styleUrl: './landing.scss',
  templateUrl: './landing.html',
})
export class Landing {
  private readonly winePublicService = inject(WinePublicService);

  /** Les 3 vins de la section « Wine Spotlight » */
  protected readonly spotlight = signal<Wine[]>([]);
  protected readonly loading = signal(true);

  protected readonly terroirs: Terroir[] = [
    { title: 'Bourgogne', tagline: 'La finesse et l’élégance du pinot noir et du chardonnay.', region: 'bourgogne' },
    { title: 'Vallée du Rhône', tagline: 'La générosité et le caractère des grandes syrah et grenache.', region: 'rhone' },
    { title: 'Loire', tagline: 'La fraîcheur et la diversité, du sauvignon au cabernet franc.', region: 'loire' },
    { title: 'Nos découvertes', tagline: 'Des pépites d’ailleurs, choisies avec la même exigence.', region: null },
  ];

  constructor() {
    // 3 vins : d'abord ceux « En vedette », complétés si besoin par les autres vins de la carte.
    // forkJoin lance les deux requêtes en même temps et attend les deux réponses.
    forkJoin({
      featured: this.winePublicService.listFeatured(),
      all: this.winePublicService.list(),
    }).subscribe({
      next: ({ featured, all }) => {
        const others = all.filter((wine) => !featured.some((f) => f.slug === wine.slug));
        this.spotlight.set([...featured, ...others].slice(0, 3));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Prix le plus bas parmi les formats du vin */
  protected minPrice(wine: Wine): number {
    return Math.min(...wine.formats.map((f) => f.price));
  }

  /** 32 → « 32,00 € » */
  protected formatPrice(price: number): string {
    return price.toLocaleString('fr-BE', { style: 'currency', currency: 'EUR' });
  }

  /** Couleur de la capsule de la bouteille illustrée, selon le type de vin */
  protected capsuleColor(color: WineColor): string {
    const colors: Record<WineColor, string> = {
      ROUGE: '#7b1221',
      BLANC: '#c9a227',
      ROSE: '#d98c9a',
      EFFERVESCENT: '#d4b24c',
      LIQUOREUX: '#b8860b',
      AUTRE: '#6b6b6b',
    };
    return colors[color];
  }
}
