import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface LatLng {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  search(query: string): Observable<LatLng | null> {
    if (!query) return of(null);
    return this.http.get<any[]>(this.nominatimUrl, {
      params: {
        q: query,
        format: 'json',
        limit: 1
      }
    }).pipe(
      map(results => {
        if (results && results.length > 0) {
          const r = results[0];
          return { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
        }
        return null;
      })
    );
  }

  // Reverse geocoding for "Use My Location"
  reverse(lat: number, lng: number): Observable<string> {
    return this.http.get<any>('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat,
        lon: lng,
        format: 'json'
      }
    }).pipe(
      map(res => res.display_name || 'Lokasi Saya')
    );
  }
}
