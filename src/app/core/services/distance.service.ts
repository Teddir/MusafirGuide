import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DistanceService {
  // Distance in Kilometers
  readonly distanceKm = signal<number>(0);
  readonly routeFound = signal<boolean>(false);

  setDistance(km: number) {
    this.distanceKm.set(km);
    this.routeFound.set(true);
  }

  reset() {
    this.distanceKm.set(0);
    this.routeFound.set(false);
  }

  // Haversine fallback if needed
  calculateStraightLineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
