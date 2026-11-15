import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Wine} from '../model/wine.model';

@Injectable({provideIn: "root"})
export class WinePublicService {
  private readonly http = inject(HttpClient);
  private readonly url = "/api/wines"

  list(): Observable<Wine[]> {
    return this.http.get<Wine[]>(`${this.url}`);
  }
  listFeatured(): Observable<Wine[]> {
    return this.http.get<Wine[]>(`${this.url}/featured`);
  }
  wineSlug(slug: string): Observable<Wine>{
    return this.http.get<Wine>(`${this.url}/${slug}`);
  }
}


