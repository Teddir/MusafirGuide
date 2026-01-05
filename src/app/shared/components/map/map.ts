import { Component, ElementRef, ViewChild, AfterViewInit, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DistanceService } from '../../../core/services/distance.service';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `
    <div #mapContainer class="h-full w-full z-0 absolute inset-0 bg-gray-100 dark:bg-gray-800"></div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private distanceService = inject(DistanceService);
  private map: any; // Use any for Leaflet types as we import dynamically
  private routingControl: any;
  private L: any; // Leaflet instance

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Dynamic import: Webpack/Angular handles 'leaflet' import.
      // However, plugins often expect global 'L' or modify the module they verify.
      const leaflet = await import('leaflet');
      this.L = leaflet; // Default export or namespace

      // Fix for plugins relying on global L
      (window as any).L = this.L;

      await import('leaflet-routing-machine');
      this.initMap();
    }
  }

  private initMap() {
    const L = this.L;
    this.fixLeafletIcons();

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false
    }).setView([-6.200000, 106.816666], 10);

    // Detect Dark Mode
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  calculateRoute(origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) {
    if (!this.map || !this.L) return;
    const L = this.L;

    // Remove existing control
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
    }

    this.routingControl = L.Routing.control({
      waypoints: [
        L.latLng(origin.lat, origin.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      routeWhileDragging: false,
      show: false, // Hide the default container, we show custom UI
      addWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#10b981', opacity: 0.8, weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      }
    }).on('routesfound', (e: any) => {
      const routes = e.routes;
      const summary = routes[0].summary;
      // summary.totalDistance is in meters
      const km = summary.totalDistance / 1000;
      this.distanceService.setDistance(km);
    }).addTo(this.map);
  }

  private fixLeafletIcons() {
    const L = this.L;
    // Assets are already in public/assets, we need to point to them
    const iconRetinaUrl = '/assets/marker-icon-2x.png';
    const iconUrl = '/assets/marker-icon.png';
    const shadowUrl = '/assets/marker-shadow.png';
    const iconDefault = L.Icon.Default.prototype as any;
    delete iconDefault._getIconUrl; // Fix: Delete instead of setting to null so it falls back to L.Icon prototype
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
  }

  // ... imports and previous code ...

  private mosqueMarkers: any[] = []; // Store markers to clear later

  // ... initMap and calculateRoute ...

  showMosques(mosques: any[]) {
    if (!this.map || !this.L) return;
    const L = this.L;

    // Clear existing markers
    this.mosqueMarkers.forEach(m => m.remove());
    this.mosqueMarkers = [];

    const mosqueIcon = L.icon({
      iconUrl: '/assets/marker-icon.png', // We can use a different color/icon later if needed
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: '/assets/marker-shadow.png',
      shadowSize: [41, 41],
      className: 'mosque-marker-filter' // We'll add CSS filter to color it green
    });

    mosques.forEach(m => {
      const marker = L.marker([m.lat, m.lon], { icon: mosqueIcon })
        .bindPopup(`<b>${m.name}</b><br>Masjid`)
        .addTo(this.map);
      this.mosqueMarkers.push(marker);
    });
  }

  focusTo(lat: number, lng: number, zoom: number = 16) {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
