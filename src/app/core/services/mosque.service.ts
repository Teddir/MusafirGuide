import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LatLng } from './geocoding.service';

export interface Mosque {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distance?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MosqueService {
  private http = inject(HttpClient);
  private readonly OVERPASS_API = 'https://overpass-api.de/api/interpreter';

  searchMosques(lat: number, lon: number, radiusMeters: number = 2000): Observable<Mosque[]> {
    // Overpass QL query to find nodes tagged as amenity=place_of_worship and religion=muslim
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
        relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;

    return this.http.post<any>(this.OVERPASS_API, `data=${encodeURIComponent(query)}`).pipe(
      map(response => {
        if (!response.elements) return [];
        return response.elements
          .filter((el: any) => el.type === 'node' && el.tags && el.tags.name) // Filter those with names
          .map((el: any) => ({
            id: el.id,
            name: el.tags.name,
            lat: el.lat,
            lon: el.lon
          }))
          .slice(0, 10); // Limit to nearest 10 for performance/UI
      })
    );
  }
}
