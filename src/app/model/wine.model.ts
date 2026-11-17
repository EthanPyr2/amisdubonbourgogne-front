export interface Region {
  slug: string;
  name: string;
}

export type WineColor = 'ROUGE' | 'BLANC' | 'ROSE' | 'EFFERVESCENT' | 'LIQUOREUX' | 'AUTRE';

export interface WineFormat {
  volumeCl: number;
  price: number;
}

export interface Wine {
  slug: string;
  producer: string;
  appellation: string;
  cuvee: string | null;
  region: Region;
  color: WineColor;
  vintage: number | null;
  formats: WineFormat[];
  grapes: string | null;
  description: string | null;

  id?: number;
  available?: boolean;
  featured?: boolean;
  createdAt?: string;
  updateAt?: string;
}

export interface WineRequest {
  producer: string;
  appellation: string;
  cuvee: string | null;
  region: string;
  color: WineColor;
  vintage: number | null;
  grapes: string | null;
  description: string | null;
  formats: WineFormat[];
}
