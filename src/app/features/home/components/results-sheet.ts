import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistanceService } from '../../../core/services/distance.service';
import { JurisprudenceService } from '../../../core/services/jurisprudence.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBookOpen, heroChevronUp, heroXMark, heroArrowRight, heroPlay } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-results-sheet',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div *ngIf="routeFound()" 
         class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 mt-4 animate-in fade-in slide-in-from-bottom-2">
      
      <!-- Handle Bar (Close Guide) -->
      <div *ngIf="!showGuide()" class="hidden"></div>
      
      <!-- Header with back button if guide is open -->
      <div *ngIf="showGuide()" class="flex items-center justify-between mb-6">
         <h2 class="text-xl font-bold text-gray-900 dark:text-white">Panduan Shalat</h2>
         <button (click)="toggleGuide()" class="p-2 bg-gray-100 dark:bg-slate-800 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
            <ng-icon name="heroXMark" size="20"></ng-icon>
         </button>
      </div>

      <!-- Main Results View -->
      <div *ngIf="!showGuide()" class="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <!-- Header Info -->
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Jarak Tempuh</p>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {{ distance().toFixed(1) }} <span class="text-lg text-gray-500 dark:text-gray-400 font-normal">km</span>
            </h1>
          </div>
          
          <!-- Status Badge -->
          <div [ngClass]="{
            'bg-emerald-100 text-emerald-700 border-emerald-200': status().statusColor === 'green',
            'bg-yellow-100 text-yellow-700 border-yellow-200': status().statusColor === 'yellow',
            'bg-red-100 text-red-700 border-red-200': status().statusColor === 'red'
          }" class="px-4 py-2 rounded-xl border text-sm font-semibold shadow-sm text-center max-w-[140px]">
            {{ status().statusMessage.split('(')[0] }}
          </div>
        </div>

        <!-- Detailed Message / Notes -->
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p class="text-gray-700 text-sm leading-relaxed">
            <span class="font-semibold text-gray-900 block mb-1">Catatan Mazhab {{ currentMazhabName() }}:</span>
            {{ status().statusMessage }}
          </p>
        </div>

        <!-- Action Button -->
        <button *ngIf="status().canCombine || status().canShorten" 
                (click)="toggleGuide()" 
                class="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2">
          <ng-icon name="heroBookOpen" size="20"></ng-icon>
          <span>Lihat Panduan Shalat</span>
        </button>
      </div>

      <!-- Guide View (Stepper) -->
      <div *ngIf="showGuide()" class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <!-- Step Indicator -->
        <div class="flex items-center justify-between px-2">
           <div *ngFor="let step of [1, 2, 3]; let i = index" class="flex flex-col items-center gap-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                [class.bg-emerald-600]="currentStep() >= i + 1"
                [class.text-white]="currentStep() >= i + 1"
                [class.bg-gray-200]="currentStep() < i + 1"
                [class.text-gray-500]="currentStep() < i + 1">
                {{ i + 1 }}
              </div>
              <span class="text-xs font-medium text-gray-500">
                {{ i === 0 ? 'Niat' : (i === 1 ? 'Shalat 1' : 'Shalat 2') }}
              </span>
           </div>
           <!-- Line connector logic could be added here -->
        </div>

        <!-- Step Content -->
        <div class="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <h3 class="text-lg font-bold text-gray-900 mb-2">
                {{ steps[currentStep() - 1].title }}
            </h3>
            <p class="text-gray-600 text-sm mb-4">{{ steps[currentStep() - 1].desc }}</p>

            <div class="bg-white rounded-xl p-4 shadow-sm border border-emerald-100/50">
                <p class="text-2xl text-right font-serif text-gray-800 leading-loose mb-3" style="font-family: 'Amiri', serif;">
                    {{ steps[currentStep() - 1].arabic }}
                </p>
                <p class="text-emerald-700 italic text-sm mb-2 font-medium">
                    "{{ steps[currentStep() - 1].latin }}"
                </p>
                <p class="text-gray-500 text-xs">
                    {{ steps[currentStep() - 1].meaning }}
                </p>
            </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-3">
            <button *ngIf="currentStep() > 1" (click)="prevStep()" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                Kembali
            </button>
            <button *ngIf="currentStep() < 3" (click)="nextStep()" class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors">
                Lanjut
            </button>
            <button *ngIf="currentStep() === 3" (click)="toggleGuide()" class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors">
                Selesai
            </button>
        </div>
      </div>
    </div>
  `,
  viewProviders: [provideIcons({ heroBookOpen, heroChevronUp, heroXMark, heroArrowRight, heroPlay })],
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class ResultsSheetComponent {
  private distanceService = inject(DistanceService);
  private jurisprudenceService = inject(JurisprudenceService);

  routeFound = this.distanceService.routeFound;
  distance = this.distanceService.distanceKm;

  showGuide = signal(false);
  currentStep = signal(1);

  status = computed(() => {
    return this.jurisprudenceService.checkStatus(this.distance());
  });

  currentMazhabName = computed(() => {
    return this.jurisprudenceService.currentMazhabRule()?.name || '';
  });

  // Mock Steps Data for Jamak Taqdim Dzuhur-Ashar (Qasar)
  steps = [
    {
      title: 'Langkah 1: Niat Jamak Taqdim & Qasar',
      desc: 'Berniat untuk menggabungkan Shalat Dzuhur dan Ashar di waktu Dzuhur, serta meringkasnya (2 rakaat).',
      arabic: 'أُصَلِّيْ فَرْضَ الظُّهْرِ رَكْعَتَيْنِ قَصْرًا مَجْمُوْعًا إِلَيْهِ الْعَصْرُ جَمْعَ تَقْدِيْمٍ لِلهِ تَعَالَى',
      latin: 'Ushallii fardhazh zhuhri rak’ataini qashran majmuu’an ilaihil ‘ashru jam’a taqdiimin lillaahi ta’aalaa.',
      meaning: 'Aku berniat shalat fardhu Dzuhur dua rakaat secara qasar yang digabung dengan Ashar, jamak taqdim, karena Allah Ta’ala.'
    },
    {
      title: 'Langkah 2: Shalat Dzuhur (2 Rakaat)',
      desc: 'Lakukan shalat Dzuhur 2 rakaat seperti biasa, diakhiri dengan salam.',
      arabic: '...',
      latin: '(Shalat 2 rakaat diakhiri salam)',
      meaning: 'Lakukan shalat dengan khusyuk.'
    },
    {
      title: 'Langkah 3: Shalat Ashar (2 Rakaat)',
      desc: 'Segera berdiri untuk shalat Ashar (iqamah lagi disunnahkan). Niat jamak qasar Ashar.',
      arabic: 'أُصَلِّيْ فَرْضَ الْعَصْرِ رَكْعَتَيْنِ قَصْرًا مَجْمُوْعًا إِلَى الظُّهْرِ جَمْعَ تَقْدِيْمٍ لِلهِ تَعَالَى',
      latin: 'Ushallii fardhal ‘ashri rak’ataini qashran majmuu’an ilazh zhuhri jam’a taqdiimin lillaahi ta’aalaa.',
      meaning: 'Aku berniat shalat fardhu Ashar dua rakaat secara qasar yang digabung dengan Dzuhur, jamak taqdim, karena Allah Ta’ala.'
    }
  ];

  toggleGuide() {
    this.showGuide.update(v => !v);
    this.currentStep.set(1);
  }

  nextStep() {
    this.currentStep.update(v => Math.min(v + 1, 3));
  }

  prevStep() {
    this.currentStep.update(v => Math.max(v - 1, 1));
  }
}
