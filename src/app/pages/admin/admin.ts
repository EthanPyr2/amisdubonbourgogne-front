import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { WineColor, WineRequest } from '../../model/wine.model';
import { WineAdminService } from '../../service/wineAdmin.service';

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
    TextareaModule,
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

    // 3. On envoie. Rien ne part tant qu'on n'a pas appelé subscribe()
    this.wineAdminService.create(request).subscribe({
      next: () => {
        form.resetForm();
        this.wine = emptyWine();
      },
      error: (err) => console.error('Échec de la création', err.status, err.error),
    });
  }
}
