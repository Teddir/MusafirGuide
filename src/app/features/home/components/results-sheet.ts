import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistanceService } from '../../../core/services/distance.service';
import { JurisprudenceService } from '../../../core/services/jurisprudence.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBookOpen, heroChevronUp, heroXMark, heroArrowRight, heroPlay, heroXCircle, heroCheckBadge, heroArrowLeft, heroClock, heroScissors } from '@ng-icons/heroicons/outline';

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
         <button (click)="toggleGuide()" class="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2">
            <ng-icon name="heroArrowLeft" size="20"></ng-icon>
            <span class="font-medium text-sm" i18n="@@results.backToResults">Kembali ke Hasil</span>
         </button>
         <h3 class="font-bold text-gray-900 dark:text-white" i18n="@@results.guideTitle">Panduan Solat</h3>
         <div class="w-8"></div> <!-- Spacer -->
      </div>

      <!-- Main Results Content -->
      <div *ngIf="!showGuide()" class="space-y-6">
        <div class="flex justify-between items-start">
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1" i18n="@@results.distanceLabel">Jarak Tempuh</h3>
              <p class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{{ distance() | number:'1.0-1' }} <span class="text-lg font-medium text-gray-500 dark:text-gray-400">km</span></p>
            </div>
            
             <!-- Status Badge (Summary) -->
             <div [class]="'px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ' + (canQasar() ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400')">
                <ng-icon [name]="canQasar() ? 'heroCheckBadge' : 'heroXCircle'" size="20"></ng-icon>
                <span *ngIf="canQasar()" i18n="@@results.status.qasar">Boleh Qasar</span>
                <span *ngIf="!canQasar()" i18n="@@results.status.noQasar">Tidak Boleh Qasar</span>
             </div>
        </div>

        <!-- Detailed Status Cards -->
        <div class="grid grid-cols-2 gap-4">
            <!-- Jamak Status -->
             <div class="p-4 rounded-2xl border transition-all duration-300"
                  [ngClass]="canJamak() ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800'">
                <div class="flex items-center gap-2 mb-2">
                    <ng-icon name="heroClock" size="20" [class]="canJamak() ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'"></ng-icon>
                    <span class="font-bold text-sm" [ngClass]="canJamak() ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'" i18n="@@results.jamakTitle">Jamak</span>
                </div>
                <p class="text-xs leading-relaxed" [ngClass]="canJamak() ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'">
                   <span *ngIf="canJamak()" i18n="@@results.jamakAllowed">Menggabungkan dua solat dalam satu waktu.</span>
                   <span *ngIf="!canJamak()" i18n="@@results.jamakForbidden">Jarak belum memenuhi syarat.</span>
                </p>
             </div>

             <!-- Qasar Status -->
             <div class="p-4 rounded-2xl border transition-all duration-300"
                [ngClass]="canQasar() ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700'">
                <div class="flex items-center gap-2 mb-2">
                    <ng-icon name="heroScissors" size="20" [class]="canQasar() ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'"></ng-icon>
                    <span class="font-bold text-sm" [ngClass]="canQasar() ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200'" i18n="@@results.qasarTitle">Qasar</span>
                </div>
                <p class="text-xs leading-relaxed" [ngClass]="canQasar() ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'">
                    <span *ngIf="canQasar()" i18n="@@results.qasarAllowed">Meringkas solat 4 rakaat menjadi 2 rakaat.</span>
                    <span *ngIf="!canQasar()" i18n="@@results.qasarForbidden">Jarak belum mencapai {{ minDistance() }} km.</span>
                </p>
             </div>
        </div>

        <!-- Action Button -->
        <button *ngIf="canQasar() || canJamak()" 
                (click)="toggleGuide()"
                class="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center gap-3">
            <ng-icon name="heroBookOpen" size="20"></ng-icon>
            <span i18n="@@results.prayerGuideButton">Lihat Panduan Solat</span>
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
                {{ prayerSteps[currentStep() - 1].title }}
            </h3>
            <p class="text-gray-600 text-sm mb-4">{{ prayerSteps[currentStep() - 1].description }}</p>

            <div class="bg-white rounded-xl p-4 shadow-sm border border-emerald-100/50">
                <p class="text-2xl text-right font-serif text-gray-800 leading-loose mb-3" style="font-family: 'Amiri', serif;">
                    {{ prayerSteps[currentStep() - 1].text }}
                </p>
                <p class="text-emerald-700 italic text-sm mb-2 font-medium">
                    "{{ prayerSteps[currentStep() - 1].latin }}"
                </p>
                <p class="text-gray-500 text-xs">
                    {{ prayerSteps[currentStep() - 1].meaning }}
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
  viewProviders: [provideIcons({ heroBookOpen, heroChevronUp, heroXMark, heroArrowRight, heroPlay, heroXCircle, heroCheckBadge, heroArrowLeft, heroClock, heroScissors })],
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

  canQasar = computed(() => this.status().canShorten);
  canJamak = computed(() => this.status().canCombine);
  minDistance = computed(() => this.jurisprudenceService.currentMazhabRule()?.distance_threshold_km || 0);

  // Mock Steps Data for Jamak Taqdim Dzuhur-Ashar (Qasar)
  prayerSteps = [
    {
      title: $localize`:@@guide.step1.title:Niat Jamak Qasar`,
      description: $localize`:@@guide.step1.desc:Niatkan dalam hati untuk melakukan solat Jamak (Taqdim/Takhir) dan Qasar saat Takbiratul Intiram.`,
      text: "أُصَلِّي فَرْضَ الظُّهْرِ رَكْعَتَيْنِ قَصْرًا مَجْمُوْعًا إِلَيْهِ الْعَصْرُ جَمْعَ تَقْدِيْمٍ لِلّٰهِ تَعَالَى",
      latin: "Ushallii fardhazh zhuhri rak’ataini qashran majmuu’an ilaihil ‘ashru jam’a taqdiimin lillaahi ta’aalaa.",
      meaning: $localize`:@@guide.step1.meaning:Aku berniat solat fardhu Dhuhur 2 rakaat, qashar, dengan menjamak Ashar kepadanya, dengan jamak taqdim, karena Allah Ta'ala.`
    },
    {
      title: $localize`:@@guide.step2.title:Solat Pertama (2 Rakaat)`,
      description: $localize`:@@guide.step2.desc:Lakukan solat pertama (misal: Dhuhur) sebanyak 2 rakaat saja (Qasar). Salam setelah tahiyat akhir.`,
      text: null, latin: null, meaning: null
    },
    {
      title: $localize`:@@guide.step3.title:Iqomah & Solat Kedua`,
      description: $localize`:@@guide.step3.desc:Segera berdiri untuk Iqomah, lalu lanjut solat kedua (misal: Ashar) 2 rakaat (Qasar) dengan niat Jamak.`,
      text: null, latin: null, meaning: null
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
