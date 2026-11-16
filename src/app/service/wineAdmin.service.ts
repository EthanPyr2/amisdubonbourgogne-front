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
  /** POST /api/admin/wines : le back renvoie le vin créé (avec son id et son slug) */
  create(wine: WineRequest): Observable<Wine>{
    return this.http.post<Wine>(this.url, wine);
  }
}
