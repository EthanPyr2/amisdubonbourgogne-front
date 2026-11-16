import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { Wine, WineColor, WineRequest } from '../../model/wine.model';
import { WineAdminService } from '../../service/wineAdmin.service';
import { AuthService } from '../../service/auth.service';
import { apiErrorMessage } from '../../shared/api-error';
import { Router } from '@angular/router';
import {Checkbox} from 'primeng/checkbox';

/** Filtre de statut du tableau (null = tous les vins) */
type StatusFilter = 'available' | 'unavailable' | 'featured';

function matchesStatus(wine: Wine, status: StatusFilter | null): boolean {
  switch (status) {
    case 'available':
      return !!wine.available;
    case 'unavailable':
      return !wine.available;
    case 'featured':
      return !!wine.featured;
    default:
      return true;
  }
}

/** Une ligne « format » du formulaire, vide tant que l'utilisateur ne l'a pas remplie */
interface FormatForm {
  volumeCl: number | null;
  price: number | null;
}

/** Valeurs saisies dans le formulaire « Ajouter un vin » */
interface WineForm {
  producer: string;
  cuvee: string;
  region: string;
  appellation: string;
  color: WineColor | null;
  grapes: string;
  vintage: number | null;
  formats: FormatForm[];
  description: string;
}

/** Formulaire rempli avec un vin existant (mode « Modifier ») */
function wineToForm(wine: Wine): WineForm {
  return {
    producer: wine.producer,
    cuvee: wine.cuvee ?? '',
    region: wine.region.name,
    appellation: wine.appellation,
    color: wine.color,
    grapes: wine.grapes ?? '',
    vintage: wine.vintage,
    formats: wine.formats.map((f) => ({ volumeCl: f.volumeCl, price: f.price })),
    description: wine.description ?? '',
  };
}

/** Formulaire vide, avec une ligne de format à remplir */
function emptyWine(): WineForm {
  return {
    producer: '',
    cuvee: '',
    region: '',
    appellation: '',
    color: null,
    grapes: '',
    vintage: null,
    formats: [{ volumeCl: null, price: null }],
    description: '',
  };
}

@Component({
  imports: [
    FormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    LabelModule,
    SelectModule,
    TableModule,
    TextareaModule,
    Checkbox,
  ],
  selector: 'app-admin',
  styleUrl: './admin.scss',
  templateUrl: './admin.html',
})
export class Admin {
  protected readonly colors: { label: string; value: WineColor }[] = [
    { label: 'Rouge', value: 'ROUGE' },
    { label: 'Blanc', value: 'BLANC' },
    { label: 'Rosé', value: 'ROSE' },
    { label: 'Effervescent', value: 'EFFERVESCENT' },
    { label: 'Moelleux & liquoreux', value: 'LIQUOREUX' },
    { label: 'Autre', value: 'AUTRE' },
  ];

  protected wine: WineForm = emptyWine();

  /** Ajoute une ligne de format vide (bouton « + Ajouter un format ») */
  protected addFormat(): void {
    this.wine.formats.push({ volumeCl: null, price: null });
  }

  /** Retire une ligne de format (on en garde toujours au moins une) */
  protected removeFormat(index: number): void {
    if (this.wine.formats.length > 1) {
      this.wine.formats.splice(index, 1);
    }
  }

  private readonly wineAdminService = inject(WineAdminService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Notification affichée en bas de l'écran après une action (succès ou erreur) */
  protected readonly notice = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  private noticeTimer?: ReturnType<typeof setTimeout>;

  protected notify(type: 'success' | 'error', text: string): void {
    clearTimeout(this.noticeTimer);
    this.notice.set({ type, text });
    // Un succès disparaît vite ; une erreur reste plus longtemps pour être lue
    this.noticeTimer = setTimeout(() => this.notice.set(null), type === 'success' ? 4000 : 10000);
  }

  /** « Se déconnecter » : ferme la session côté back puis retourne à la page de connexion */
  protected logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  /** Vin en cours de modification (null = le formulaire sert à ajouter un vin) */
  protected readonly editing = signal<Wine | null>(null);
  private readonly wineForm = viewChild.required<NgForm>('wineForm');
  private readonly formPanel = viewChild.required<ElementRef<HTMLElement>>('formPanel');

  /** Bouton « Modifier » d'une ligne : remplit le formulaire avec ce vin */
  protected editWine(wine: Wine): void {
    this.wineForm().resetForm(); // efface les erreurs affichées par un essai précédent
    this.wine = wineToForm(wine);
    this.editing.set(wine);
    this.formPanel().nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** « Annuler » : le formulaire repasse en mode « Ajouter un vin » */
  protected cancelEdit(): void {
    this.wineForm().resetForm();
    this.wine = emptyWine();
    this.editing.set(null);
  }

  /** Tous les vins chargés depuis le back */
  protected readonly wines = signal<Wine[]>([]);

  // --- Filtres du tableau « Vins à la carte » ---
  protected readonly search = signal('');
  protected readonly regionFilter = signal<string | null>(null);
  protected readonly statusFilter = signal<StatusFilter | null>(null);

  /** Régions présentes dans la carte, pour la liste « Toutes régions » */
  protected readonly regionOptions = computed(() => [
    { label: 'Toutes régions', value: null },
    ...[...new Set(this.wines().map((w) => w.region.name))].sort().map((name) => ({ label: name, value: name })),
  ]);

  /** Choix de la liste « Tous statuts » */
  protected readonly statusOptions: { label: string; value: StatusFilter | null }[] = [
    { label: 'Tous statuts', value: null },
    { label: 'Disponibles', value: 'available' },
    { label: 'Indisponibles', value: 'unavailable' },
    { label: 'En vedette', value: 'featured' },
  ];

  /** Vins affichés : la liste complète, filtrée par la recherche, la région et le millésime */
  protected readonly filteredWines = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.wines().filter(
      (w) =>
        (!this.regionFilter() || w.region.name === this.regionFilter()) &&
        matchesStatus(w, this.statusFilter()) &&
        (!term ||
          [w.appellation, w.producer, w.cuvee, w.region.name, w.vintage]
            .some((field) => String(field ?? '').toLowerCase().includes(term))),
    );
  });

  constructor() {
    this.loadWines();
  }

  /** 75 → « 75 cl », 37.5 → « 37,5 cl » */
  protected formatVolume(volumeCl: number): string {
    return `${volumeCl.toLocaleString('fr-BE', { maximumFractionDigits: 1 })} cl`;
  }

  /** 32 → « 32,00 € » */
  protected formatPrice(price: number): string {
    return price.toLocaleString('fr-BE', { style: 'currency', currency: 'EUR' });
  }

  /** Coche / décoche « Disponible » : enregistre tout de suite dans le back */
  protected setAvailability(wine: Wine, available: boolean): void {
    this.wineAdminService.setAvailability(wine.id!, available).subscribe({
      next: () => this.wines.update((wines) => wines.map((w) => (w.id === wine.id ? { ...w, available } : w))),
      error: (err) => {
        this.notify('error', apiErrorMessage(err, "La disponibilité n'a pas pu être modifiée."));
        this.loadWines(); // on recharge pour que la case reflète l'état réel
      },
    });
  }

  /** Coche / décoche « En vedette » : enregistre tout de suite dans le back */
  protected setFeatured(wine: Wine, featured: boolean): void {
    this.wineAdminService.setFeatured(wine.id!, featured).subscribe({
      next: () => this.wines.update((wines) => wines.map((w) => (w.id === wine.id ? { ...w, featured } : w))),
      error: (err) => {
        this.notify('error', apiErrorMessage(err, "La mise en vedette n'a pas pu être modifiée."));
        this.loadWines(); // on recharge pour que la case reflète l'état réel
      },
    });
  }

  /** Bouton « Supprimer » : demande confirmation, puis supprime dans le back */
  protected deleteWine(wine: Wine): void {
    const name = [wine.appellation, wine.cuvee, wine.vintage].filter(Boolean).join(' ');
    if (!confirm(`Supprimer « ${name} » (${wine.producer}) de la carte ?\nCette action est définitive.`)) {
      return;
    }
    this.wineAdminService.delete(wine.id!).subscribe({
      next: () => {
        this.wines.update((wines) => wines.filter((w) => w.id !== wine.id));
        if (this.editing()?.id === wine.id) this.cancelEdit(); // le vin modifié n'existe plus
        this.notify('success', `${wine.appellation}${wine.vintage ? ' ' + wine.vintage : ''} supprimé de la carte.`);
      },
      error: (err) => {
        this.notify('error', apiErrorMessage(err, "Le vin n'a pas pu être supprimé."));
        this.loadWines(); // on recharge pour afficher l'état réel
      },
    });
  }

  /** Charge la liste des vins depuis le back (GET /api/admin/wines) */
  private loadWines(): void {
    this.wineAdminService.listAdmin().subscribe({
      next: (wines) => this.wines.set(wines),
      error: (err) => this.notify('error', apiErrorMessage(err, "La liste des vins n'a pas pu être chargée.")),
    });
  }

  protected onSubmit(form: NgForm): void {
    // 1. On ne va pas plus loin si un champ obligatoire est vide
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    // 2. On transforme les valeurs du formulaire en ce qu'attend le back (WineRequest)
    const request: WineRequest = {
      producer: this.wine.producer.trim(),
      appellation: this.wine.appellation.trim(),
      cuvee: this.wine.cuvee.trim() || null,
      region: this.wine.region.trim(),
      color: this.wine.color!, // garanti par `required` dans le formulaire
      vintage: this.wine.vintage,
      grapes: this.wine.grapes.trim() || null,
      description: this.wine.description.trim() || null,
      // volume et prix garantis par `required` dans le formulaire
      formats: this.wine.formats.map((f) => ({ volumeCl: f.volumeCl!, price: f.price! })),
    };

    // 3. On envoie : PUT si on modifie un vin, POST si on en ajoute un.
    //    Rien ne part tant qu'on n'a pas appelé subscribe().
    const editing = this.editing();
    const save$ = editing
      ? this.wineAdminService.update(editing.id!, request)
      : this.wineAdminService.create(request);
    save$.subscribe({
      next: (saved) => {
        this.cancelEdit(); // vide le formulaire et repasse en mode « Ajouter »
        this.loadWines(); // le tableau affiche le vin ajouté ou modifié
        this.notify('success', `${saved.appellation}${saved.vintage ? ' ' + saved.vintage : ''} ${editing ? 'modifié' : 'ajouté à la carte'}.`);
      },
      error: (err) =>
        this.notify('error', apiErrorMessage(err, editing ? "La modification n'a pas pu être enregistrée." : "Le vin n'a pas pu être ajouté.")),
    });
  }
}
