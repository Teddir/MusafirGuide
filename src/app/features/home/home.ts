import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../shared/components/map/map';
import { SearchPanelComponent } from '../../shared/components/search-panel/search-panel';
import { ResultsSheetComponent } from './components/results-sheet';
import { MosqueListComponent } from './components/mosque-list/mosque-list';
import { DistanceService } from '../../core/services/distance.service';
import { MosqueService, Mosque } from '../../core/services/mosque.service';
import { LatLng } from '../../core/services/geocoding.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MapComponent, SearchPanelComponent, ResultsSheetComponent, MosqueListComponent],
  template: `
    <div class="flex flex-col md:flex-row h-screen w-full bg-gray-50 dark:bg-slate-950 overflow-hidden relative">
      <!-- Search Panel (Mobile: Absolute Top Overlay, Desktop: Inside Sidebar) -->
      <div class="md:hidden absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none">
         <div class="pointer-events-auto">
             <app-search-panel (routeRequested)="onRouteRequested($event)"></app-search-panel>
         </div>
      </div>

      <!-- Left/Top Column: Map -->
      <div class="flex-shrink-0 relative z-0 h-[45vh] md:h-full md:flex-grow order-1 md:order-1">
        <app-map #map></app-map>
      </div>

      <!-- Right/Bottom Column: Sidebar (Results & Mosques) -->
      <div class="flex-grow md:flex-grow-0 w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-slate-950 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:shadow-2xl z-20 flex flex-col order-2 md:order-2 h-[55vh] md:h-full transition-all duration-300">
          
          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              <!-- Desktop Search Panel (Hidden on Mobile) -->
              <div class="hidden md:block">
                  <app-search-panel (routeRequested)="onRouteRequested($event)"></app-search-panel>
              </div>

              <!-- Results -->
              <app-results-sheet></app-results-sheet>

              <!-- Mosque List -->
              <app-mosque-list 
                *ngIf="routeFound()"
                [mosques]="mosques()" 
                [loading]="loadingMosques()"
                (selectMosque)="onMosqueSelected($event)">
              </app-mosque-list>
          </div>
          
          <!-- Footer -->
          <div class="p-4 border-t border-gray-100 dark:border-slate-900 text-center text-xs text-gray-400 hidden md:block">
             <p>MusafirGuide v1.0 &copy; 2026</p>
          </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class HomeComponent {
  @ViewChild('map') mapComponent!: MapComponent;
  private distanceService = inject(DistanceService);
  private mosqueService = inject(MosqueService);

  routeFound = this.distanceService.routeFound;
  mosques = signal<Mosque[]>([]);
  loadingMosques = signal(false);

  onRouteRequested(event: { origin: LatLng, dest: LatLng }) {
    console.log('Route requested:', event);
    this.mapComponent.calculateRoute(event.origin, event.dest);

    // Fetch Mosques near destination
    this.loadingMosques.set(true);
    this.mosques.set([]); // Fix: Clear previous results immediately
    // LatLng from Nominatim puts longitude in 'lng' (mapped in GeocodingService)
    // NOTE: GeocodingService.search maps 'lon' from API to 'lng'.
    // Ensure we use the correct property.
    this.mosqueService.searchMosques(Number(event.dest.lat), Number(event.dest.lng)).subscribe({
      next: (data) => {
        console.log('Mosques found:', data);
        this.mosques.set(data);
        this.loadingMosques.set(false);
        this.mapComponent.showMosques(data);
      },
      error: (err) => {
        console.error('Error fetching mosques:', err);
        this.loadingMosques.set(false);
      }
    });
  }

  onMosqueSelected(mosque: Mosque) {
    this.mapComponent.focusTo(mosque.lat, mosque.lon); // Mosque interface uses 'lon' from Overpass
  }
}
