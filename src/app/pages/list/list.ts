import { Component, signal } from '@angular/core';
import { SelectModule } from 'primeng/select';

/**
 * Données d'exemple pour la maquette uniquement.
 * TODO : remplacer par les vins de l'API (WinePublicService.list()) et calculer les groupes.
 */
interface ExampleWine {
  name: string;
  cuvee?: string;
  producer: string;
  vintage: number | null;
  formats: { volume: string; price: string }[];
  // Contenu de la fiche dépliée
  color: string;
  grapes?: string;
  description?: string;
}

interface ExampleGroup {
  region: string;
  categories: { label: string; wines: ExampleWine[] }[];
}

@Component({
  imports: [SelectModule],
  selector: 'app-list',
  styleUrl: './list.scss',
  templateUrl: './list.html',
})
export class List {
  // Listes visuelles (pas encore reliées à un filtre)
  protected readonly categoryOptions = ['Toutes', 'Vin rouge', 'Vin blanc', 'Vin rosé', 'Effervescent', 'Moelleux & liquoreux'];
  protected readonly sortOptions = ['Région et catégorie', 'Prix croissant', 'Prix décroissant', 'Nom'];
  protected readonly regions = ['Toutes les régions', 'Bourgogne', 'Rhône', 'Loire', 'Autres'];

  protected readonly groups: ExampleGroup[] = [
    {
      region: 'Bourgogne',
      categories: [
        {
          label: 'Vin rouge',
          wines: [
            { name: 'Maranges 1er Cru', cuvee: 'Les Clos Roussots', producer: 'Domaine Milan', vintage: 2021, formats: [{ volume: '75 cl', price: '32,00 €' }], color: 'Vin rouge', grapes: 'Pinot noir', description: "Robe rubis profond. Nez de cerise noire, de framboise et d'épices douces ; bouche ample aux tanins fins. Parfait avec un bœuf bourguignon ou des fromages affinés." },
            { name: 'Gevrey-Chambertin', producer: 'Domaine exemple', vintage: 2020, formats: [{ volume: '75 cl', price: '58,00 €' }, { volume: '150 cl', price: '125,00 €' }], color: 'Vin rouge', grapes: 'Pinot noir', description: "Un Gevrey charpenté aux notes de fruits noirs et de sous-bois, à carafer une heure. Gibier, magret de canard." },
          ],
        },
        {
          label: 'Vin blanc',
          wines: [
            { name: 'Chablis 1er Cru', cuvee: 'Montmains', producer: 'Domaine exemple', vintage: 2022, formats: [{ volume: '75 cl', price: '34,00 €' }], color: 'Vin blanc', grapes: 'Chardonnay', description: "Minéral et tendu, sur les agrumes et la pierre à fusil. Huîtres, poissons grillés, fromage de chèvre." },
          ],
        },
      ],
    },
    {
      region: 'Vallée du Rhône',
      categories: [
        {
          label: 'Vin rouge',
          wines: [
            { name: 'Crozes-Hermitage', producer: 'Domaine exemple', vintage: 2022, formats: [{ volume: '75 cl', price: '24,00 €' }], color: 'Vin rouge', grapes: 'Syrah', description: "Fruits noirs, violette et poivre. Gourmand et frais, idéal sur les grillades et l'agneau." },
            { name: 'Côtes du Rhône', producer: 'Maison exemple', vintage: 2021, formats: [{ volume: '37,5 cl', price: '13,00 €' }, { volume: '75 cl', price: '24,00 €' }], color: 'Vin rouge', grapes: 'Grenache, syrah', description: "Un rouge généreux et facile, sur les fruits rouges mûrs et la garrigue. Pour la cuisine de tous les jours." },
          ],
        },
      ],
    },
    {
      region: 'Loire',
      categories: [
        {
          label: 'Vin blanc',
          wines: [
            { name: 'Sancerre', producer: 'Domaine exemple', vintage: 2023, formats: [{ volume: '75 cl', price: '22,00 €' }], color: 'Vin blanc', grapes: 'Sauvignon blanc', description: "Vif et aromatique : agrumes, fleurs blanches et une finale saline. Crottin de Chavignol, poissons." },
          ],
        },
      ],
    },
  ];

  /** Nombre de vins d'un groupe (pour « 3 vins » à côté du nom de région) */
  protected countWines(group: ExampleGroup): number {
    return group.categories.reduce((total, category) => total + category.wines.length, 0);
  }

  protected readonly totalWines = this.groups.reduce((total, group) => total + this.countWines(group), 0);

  /** Noms des vins dont la fiche est dépliée (bouton + / −) */
  private readonly openWines = signal<ReadonlySet<string>>(new Set());

  protected isOpen(wine: ExampleWine): boolean {
    return this.openWines().has(wine.name);
  }

  protected toggle(wine: ExampleWine): void {
    this.openWines.update((open) => {
      const next = new Set(open);
      next.has(wine.name) ? next.delete(wine.name) : next.add(wine.name);
      return next;
    });
  }
}
