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
  setAvailability(id: number, available: boolean): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/availability`, null, { params: { available } });
  }

  setFeatured(id: number, featured: boolean): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/featured`, null, { params: { featured } });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  update(id: number, wine: WineRequest): Observable<Wine> {
    return this.http.put<Wine>(`${this.url}/${id}`, wine);
  }

  create(wine: WineRequest): Observable<Wine>{
    return this.http.post<Wine>(this.url, wine);
  }
}
