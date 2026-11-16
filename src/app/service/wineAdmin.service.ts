import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Wine, WineRequest} from '../model/wine.model';

@Injectable({providedIn: 'root'})
export class WineAdminService {
  private readonly url = "/api/admin/wines"
  private readonly http = inject(HttpClient);

  listAdmin(): Observable<Wine[]>{
    return this.http.get<Wine[]>(`${this.url}`)
  }
  detailAdmin(id: number): Observable<Wine>{
    return this.http.get<Wine>(`${this.url}/${id}`)
  }
  /** PATCH /api/admin/wines/{id}/availability?available=true|false */
  setAvailability(id: number, available: boolean): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/availability`, null, { params: { available } });
  }

  /** PATCH /api/admin/wines/{id}/featured?featured=true|false */
  setFeatured(id: number, featured: boolean): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/featured`, null, { params: { featured } });
  }

  /** DELETE /api/admin/wines/{id} : supprime le vin et tous ses formats */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /** POST /api/admin/wines : le back renvoie le vin créé (avec son id et son slug) */
  /** PUT /api/admin/wines/{id} : remplace les infos du vin (le slug ne change pas) */
  update(id: number, wine: WineRequest): Observable<Wine> {
    return this.http.put<Wine>(`${this.url}/${id}`, wine);
  }

  create(wine: WineRequest): Observable<Wine>{
    return this.http.post<Wine>(this.url, wine);
  }
}
