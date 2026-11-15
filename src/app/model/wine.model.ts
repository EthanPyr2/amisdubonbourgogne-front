
export interface Region {
  slug: string;
  name: string;
}


export type WineColor = 'ROUGE' | 'BLANC' | 'ROSE' | 'EFFERVESCENT' | 'LIQUOREUX' | 'AUTRE';

export interface Wine {
  // --- Champs publics (GET /api/wines) ---
  slug: string;
  producer: string;
  appellation: string;
  cuvee: string | null;
  region: Region;
  color: WineColor;
  vintage: number | null;
  price: number;
  grapes: string | null;
  description: string | null;

  // --- Champs admin uniquement (GET /api/admin/wines) ---
  id?: number;
  volumeCl?: number | null;
  available?: boolean;
  featured?: boolean;
  createdAt?: string;
  updateAt?: string;
}
