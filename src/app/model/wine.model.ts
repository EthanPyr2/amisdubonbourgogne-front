export interface Wine {
  id?: number;
  producer: string;
  appellation: string;
  cuvee: string;
  region: string;
  color: string;
  vintage: string;
  volumeCl?: number;
  price: number;
  grapes: string;
  description?: string;
  available?: boolean;
  featured?: boolean;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}
