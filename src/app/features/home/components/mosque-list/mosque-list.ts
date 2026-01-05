import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBuildingLibrary, heroMapPin } from '@ng-icons/heroicons/outline';
import { Mosque } from '../../../../core/services/mosque.service';

@Component({
  selector: 'app-mosque-list',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center gap-2 mb-2 px-1">
        <ng-icon name="heroBuildingLibrary" size="20" class="text-emerald-600"></ng-icon>
        <h3 class="font-bold text-gray-800 dark:text-white text-lg" i18n="@@mosque.title">Masjid Terdekat</h3>
      </div>
      
      <div *ngIf="loading" class="space-y-3">
        <div *ngFor="let i of [1,2,3]" class="h-16 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      </div>

      <div *ngIf="!loading && mosques.length === 0" class="text-center py-8 text-gray-500 text-sm" i18n="@@mosque.notFound">
        Tidak ada masjid ditemukan di sekitar lokasi tujuan.
      </div>

      <div *ngIf="!loading && mosques.length > 0" class="space-y-3">
        <button *ngFor="let mosque of mosques" 
                (click)="selectMosque.emit(mosque)"
                class="w-full text-left bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all group flex items-start gap-3">
          <div class="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 transition-colors">
             <ng-icon name="heroMapPin" size="20"></ng-icon>
          </div>
          <div>
            <h4 class="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                {{ mosque.name }}
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1" i18n="@@mosque.clickHint">Klik untuk lihat di peta</p>
          </div>
        </button>
      </div>
    </div>
  `,
  viewProviders: [provideIcons({ heroBuildingLibrary, heroMapPin })],
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MosqueListComponent {
  @Input() mosques: Mosque[] = [];
  @Input() loading = false;
  @Output() selectMosque = new EventEmitter<Mosque>();
}
