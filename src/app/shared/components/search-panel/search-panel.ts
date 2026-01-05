import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMap, heroChevronDown, heroArrowRight, heroMapPin, heroMagnifyingGlass } from '@ng-icons/heroicons/outline';
import { JurisprudenceService } from '../../../core/services/jurisprudence.service';
import { MazhabId } from '../../../core/models/worship.model';
import { GeocodingService, LatLng } from '../../../core/services/geocoding.service';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, RouterLink],
  template: `
    <div class="bg-transparent p-4 w-full space-y-4">
      <!-- Mazhab Selector -->
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white" i18n="@@search.title">Cek Status Safar</h2>
        <div class="flex gap-2 items-center">
            <a routerLink="/comparison" class="text-xs text-gray-400 hover:text-emerald-600 underline decoration-dotted flex items-center h-full pt-1" i18n="@@search.mazhabInfo">
                Info Mazhab
            </a>
            <div class="relative group">
            <button (click)="toggleMazhabDropdown()" class="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
                <span>{{ currentMazhabName() }}</span>
                <ng-icon name="heroChevronDown" size="16"></ng-icon>
            </button>
            <!-- Dropdown content... -->
             @if(showMazhabDropdown()) {
               <div class="py-1 absolute z-10 bg-white rounded-md shadow-lg">
                 <button *ngFor="let m of mazhabs" 
                   (click)="selectMazhab(m.id)"
                   class="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 transition-colors flex items-center justify-between"
                   [class.text-emerald-600]="currentMazhabId() === m.id"
                   [class.font-semibold]="currentMazhabId() === m.id"
                   [class.text-gray-700]="currentMazhabId() !== m.id">
                   {{ m.name }}
                 </button>
               </div>
             }
          </div>
        </div>
      </div>

      <!-- Inputs -->
      <div class="space-y-3 relative">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div class="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
          </div>
          <input type="text" [(ngModel)]="origin" (keyup.enter)="onSearch()" placeholder="Lokasi Asal (Misal: Jakarta)" 
            i18n-placeholder="@@search.originPlaceholder"
            class="block w-full pl-10 pr-10 py-3 text-sm rounded-xl border-gray-200 bg-gray-50 focus:border-emerald-500 focus:ring-emerald-500 transition-all outline-none" />
          <button (click)="useMyLocation()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500" title="Gunakan Lokasi Saya" i18n-title="@@search.useLocationTitle">
             <ng-icon name="heroMapPin" size="20"></ng-icon>
          </button>
        </div>

        <div class="absolute left-[19px] top-[38px] bottom-[38px] w-0.5 bg-gray-200 -z-10"></div>

        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ng-icon name="heroMapPin" class="text-red-500" size="20"></ng-icon>
          </div>
          <input type="text" [(ngModel)]="destination" (keyup.enter)="onSearch()" placeholder="Tujuan (Misal: Bandung)" 
            i18n-placeholder="@@search.destPlaceholder"
            class="block w-full pl-10 pr-3 py-3 text-sm rounded-xl border-gray-200 bg-gray-50 focus:border-emerald-500 focus:ring-emerald-500 transition-all outline-none" />
        </div>
      </div>

      <!-- Search Button -->
      <button (click)="onSearch()" [disabled]="isLoading()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
        <span *ngIf="!isLoading()" i18n="@@search.button">Cari Rute</span>
        <span *ngIf="isLoading()">Memproses...</span>
        <ng-icon *ngIf="!isLoading()" name="heroArrowRight" size="20"></ng-icon>
      </button>
    </div>
  `,
  viewProviders: [provideIcons({ heroMap, heroChevronDown, heroArrowRight, heroMapPin, heroMagnifyingGlass })]
})
export class SearchPanelComponent {
  @Output() routeRequested = new EventEmitter<{ origin: LatLng, dest: LatLng }>();

  private jurisprudenceService = inject(JurisprudenceService);
  private geocodingService = inject(GeocodingService);

  origin = '';
  destination = '';
  isLoading = signal(false);
  showMazhabDropdown = signal(false);

  mazhabs: { id: MazhabId, name: string }[] = [
    { id: 'shafii', name: "Syafi'i" },
    { id: 'hanafi', name: "Hanafi" },
    { id: 'maliki', name: "Maliki" },
    { id: 'hambali', name: "Hambali" }
  ];

  currentMazhabId = this.jurisprudenceService.selectedMazhabId;
  currentMazhabName = computed(() => {
    const id = this.currentMazhabId();
    return this.mazhabs.find(m => m.id === id)?.name || id;
  });

  toggleMazhabDropdown() {
    this.showMazhabDropdown.update(v => !v);
  }

  selectMazhab(id: MazhabId) {
    this.jurisprudenceService.setMazhab(id);
    this.showMazhabDropdown.set(false);
  }

  onSearch() {
    if (!this.origin || !this.destination) return;
    this.isLoading.set(true);

    forkJoin({
      origin: this.geocodingService.search(this.origin),
      dest: this.geocodingService.search(this.destination)
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.origin && res.dest) {
          this.routeRequested.emit({ origin: res.origin, dest: res.dest });
        } else {
          alert('Lokasi tidak ditemukan. Coba nama kota yang lebih spesifik.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        alert('Terjadi kesalahan saat mencari lokasi.');
      }
    });
  }

  useMyLocation() {
    if (navigator.geolocation) {
      this.isLoading.set(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          // Reverse geocode to fill input
          this.geocodingService.reverse(lat, lng).subscribe(addr => {
            this.origin = addr; // Or simpler name if possible
            this.isLoading.set(false);
            // We could also just hold the latlng separately but for simplicity passing string to geocoding is okay,
            // or we can optimize to directly pass latlng if we store it. 
            // For now, let's just populate the field.
          });
        },
        (err) => {
          this.isLoading.set(false);
          alert('Gagal mendapatkan lokasi: ' + err.message);
        }
      );
    } else {
      alert('Browser tidak mendukung Geolocation.');
    }
  }
}
import { computed } from '@angular/core';

