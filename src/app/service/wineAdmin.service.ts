import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Wine} from '../model/wine.model';

@Injectable({providedIn: 'root'})
export class WineAdminService {
  private readonly url = "/api/admin/wines"
  private readonly http = inject(HttpClient);

  listAdmin(): Observable<Wine[]>{
    return this.http.get<Wine[]>(`${this.url}`)
  }
  detailAdmin(id): Observable<Wine>{
    return this.http.get<Wine>(`${this.url}/{id}`)
  }
}
