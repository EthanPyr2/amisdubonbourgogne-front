
export interface Region {
  slug: string;
  name: string;
}


export type WineColor = 'ROUGE' | 'BLANC' | 'ROSE' | 'EFFERVESCENT' | 'LIQUOREUX' | 'AUTRE';

/** Un format de bouteille et son prix, ex. { volumeCl: 75, price: 32 } */
export interface WineFormat {
  volumeCl: number;
  price: number;
}

export interface Wine {
  // --- Champs publics (GET /api/wines) ---
  slug: string;
  producer: string;
  appellation: string;
  cuvee: string | null;
  region: Region;
  color: WineColor;
  vintage: number | null;
  formats: WineFormat[]; // du plus petit au plus grand volume
  grapes: string | null;
  description: string | null;

  // --- Champs admin uniquement (GET /api/admin/wines) ---
  id?: number;
  available?: boolean;
  featured?: boolean;
  createdAt?: string;
  updateAt?: string;
}

/**
 * Corps envoyé pour créer / modifier un vin (POST et PUT /api/admin/wines).
 * Doit correspondre au record Java WineRequest.
 */
export interface WineRequest {
  producer: string;
  appellation: string;
  cuvee: string | null;
  region: string; // nom de la région, ex. "Bourgogne"
  color: WineColor;
  vintage: number | null;
  grapes: string | null;
  description: string | null;
  formats: WineFormat[]; // au moins un
}
