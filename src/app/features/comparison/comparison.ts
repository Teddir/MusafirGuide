import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroBookOpen, heroExclamationTriangle } from '@ng-icons/heroicons/outline';
import { JurisprudenceService } from '../../core/services/jurisprudence.service';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
          <button (click)="goBack()">
            <ng-icon name="heroArrowLeft" size="24"></ng-icon>
          </button>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white" i18n="@@comparison.title">Perbandingan Mazhab</h1>
        </div>

        <!-- Matrix Card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <th class="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm" i18n="@@comparison.header.mazhab">Mazhab</th>
                  <th class="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm" i18n="@@comparison.header.minDistance">Jarak Min.</th>
                  <th class="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm" i18n="@@comparison.header.stayLimit">Batas Menetap</th>
                  <th class="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm" i18n="@@comparison.header.jamakRule">Hukum Jamak</th>
                  <th class="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm" i18n="@@comparison.header.qasarRule">Hukum Qasar</th>
                  <th class="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm" i18n="@@comparison.header.ref">Referensi</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of mazhabList" class="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0">
                  <td class="p-4 font-bold text-gray-900 dark:text-gray-100">{{ m.name }}</td>
                  <td class="p-4 text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/20 font-medium whitespace-nowrap">{{ m.distance_threshold_km }} km</td>
                  <td class="p-4 text-gray-600 dark:text-gray-300">{{ m.stay_duration_days }} <span i18n="@@common.days">Hari</span></td>
                  <td class="p-4">
                    <span [class.bg-green-100]="m.allow_jamak_taqdim" [class.text-green-700]="m.allow_jamak_taqdim" 
                          [class.dark:bg-green-900/30]="m.allow_jamak_taqdim" [class.dark:text-green-400]="m.allow_jamak_taqdim"
                          [class.bg-red-100]="!m.allow_jamak_taqdim" [class.text-red-700]="!m.allow_jamak_taqdim"
                          [class.dark:bg-red-900/30]="!m.allow_jamak_taqdim" [class.dark:text-red-400]="!m.allow_jamak_taqdim"
                          class="px-2 py-1 rounded-md text-xs font-semibold">
                      <ng-container *ngIf="m.allow_jamak_taqdim" i18n="@@common.allowed">Boleh</ng-container>
                      <ng-container *ngIf="!m.allow_jamak_taqdim" i18n="@@common.limited">Terbatas</ng-container>
                    </span>
                  </td>
                  <td class="p-4">
                    <span class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-md text-xs font-semibold">
                      <ng-container *ngIf="m.allow_qasar" i18n="@@common.allowed">Boleh</ng-container>
                      <ng-container *ngIf="!m.allow_qasar" i18n="@@common.notAllowed">Tidak</ng-container>
                    </span>
                  </td>
                  <td class="p-4 text-gray-400 hover:text-emerald-600 cursor-pointer text-center" title="Lihat Dalil">
                    <ng-icon name="heroBookOpen" size="20"></ng-icon>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Info Card -->
        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6">
            <h3 class="font-bold text-blue-900 dark:text-blue-200 mb-2" i18n="@@comparison.whyDiff.title">Mengapa Berbeda?</h3>
            <p class="text-blue-800 dark:text-blue-300 text-sm leading-relaxed" i18n="@@comparison.whyDiff.desc">
                Perbedaan pendapat dalam menetapkan jarak safar (Qasar) dikarenakan perbedaan penafsiran terhadap dalil dari Hadits Nabi SAW.
                Sebagian ulama berpegang pada jarak tempuh (marhalah), sebagian lain berpegang pada 'urf (kebiasaan masyarakat) atau waktu tempuh.
                Aplikasi ini mengambil pendapat masyhur (mu'tamad) dari masing-masing mazhab untuk memudahkan traveler modern.
            </p>
        </div>

        <!-- FAQ & Disclaimer -->
        <div class="mt-8 space-y-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white" i18n="@@comparison.faq.title">Pertanyaan Umum (FAQ)</h2>
            
            <div class="space-y-4">
                <div class="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-2" i18n="@@comparison.faq.q1">Bagaimana jarak dihitung?</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed" i18n="@@comparison.faq.a1">
                        Kami menggunakan teknologi routing modern (Leaflet Routing Machine / OSRM) untuk menghitung jarak tempuh riil berdasarkan jalan raya, bukan sekadar garis lurus. Ini memberikan hasil yang lebih akurat sesuai realita perjalanan Anda.
                    </p>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-2" i18n="@@comparison.faq.q2">Apakah menetap 3 hari masih boleh Qasar?</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed" i18n="@@comparison.faq.a2">
                        Mayoritas mazhab membolehkan Qasar jika niat menetap kurang dari 4 hari. Namun, ini tergantung detail kondisi dan niat Anda. Silakan cek tabel perbandingan di atas.
                    </p>
                </div>
            </div>

            <!-- Disclaimer Box -->
            <div class="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-r-xl">
                <div class="flex items-start gap-4">
                    <div class="pt-1">
                        <ng-icon name="heroExclamationTriangle" size="24" class="text-amber-600 dark:text-amber-500"></ng-icon>
                    </div>
                    <div>
                        <h3 class="font-bold text-amber-900 dark:text-amber-200 mb-1" i18n="@@comparison.disclaimer.title">Penyangkalan (Disclaimer)</h3>
                        <p class="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
                            <span i18n="@@comparison.disclaimer.text">Aplikasi ini hanyalah <strong>alat bantu</strong> dan <strong>belum tersertifikasi oleh lembaga fatwa manapun</strong>. 
                            Hasil perhitungan jarak dan status safar di sini tidak bersifat mengikat secara hukum syarak.</span>
                        </p>
                        <ul class="list-disc list-inside mt-2 ml-1 text-amber-800 dark:text-amber-300 text-sm">
                            <li i18n="@@comparison.disclaimer.list1">Konsultasi dengan ulama/ustadz terpercaya untuk kasus spesifik.</li>
                            <li i18n="@@comparison.disclaimer.list2">Menggunakan kehati-hatian (ihtiyat) dalam beribadah.</li>
                        </ul>
                        <p class="text-amber-800 dark:text-amber-300 text-sm leading-relaxed mt-2" i18n="@@comparison.disclaimer.note">
                            Pengembang proyek ini berlepas diri dari tanggung jawab atas kesalahan implementasi ibadah pengguna. Jadikan ini referensi awal semata.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  viewProviders: [provideIcons({ heroArrowLeft, heroBookOpen, heroExclamationTriangle })]
})
export class ComparisonComponent {
  private jurisprudenceService = inject(JurisprudenceService);
  private location = inject(Location);

  // We can convert the Record to Array
  mazhabList = [
    this.getRule('shafii'),
    this.getRule('hanafi'),
    this.getRule('maliki'),
    this.getRule('hambali')
  ];

  getRule(id: any) { // Type check slightly loose here to iterate
    const rules = this.jurisprudenceService.rules();
    if (!rules) return { name: 'Loading...', distance_threshold_km: 0, stay_duration_days: 0, allow_jamak_taqdim: false, allow_qasar: false }; // Dummy
    return rules.mazhabs[id as keyof typeof rules.mazhabs];
  }

  goBack() {
    this.location.back();
  }
}
