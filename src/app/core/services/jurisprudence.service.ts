import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, shareReplay } from 'rxjs/operators';
import { MazhabId, WorshipRules, TravelStatus, MazhabRule } from '../models/worship.model';

@Injectable({
  providedIn: 'root'
})
export class JurisprudenceService {
  private http = inject(HttpClient);
  private rulesUrl = '/worship-rules.json';

  // State
  readonly selectedMazhabId = signal<MazhabId>('shafii');

  // Load Rules
  private rules$ = this.http.get<WorshipRules>(this.rulesUrl).pipe(shareReplay(1));
  readonly rules = toSignal(this.rules$, { initialValue: null });

  // Computed
  readonly currentMazhabRule = computed(() => {
    const rules = this.rules();
    const id = this.selectedMazhabId();
    return rules ? rules.mazhabs[id] : null;
  });



  setMazhab(id: MazhabId) {
    this.selectedMazhabId.set(id);
  }

  checkStatus(distanceKm: number, stayDurationDays: number = 0): TravelStatus {
    const rule = this.currentMazhabRule();
    if (!rule) {
      return {
        canShorten: false,
        canCombine: false,
        statusMessage: 'Loading data...',
        statusColor: 'red'
      };
    }

    const { distance_threshold_km, stay_duration_days } = rule;
    const isDistanceMet = distanceKm >= distance_threshold_km;
    const isDurationMet = stayDurationDays <= stay_duration_days;

    if (isDistanceMet) {
      if (!isDurationMet) {
        return {
          canShorten: false,
          canCombine: false,
          statusMessage: `Jarak memenuhi (${distanceKm.toFixed(1)} km), tapi durasi menetap melebihi batas (${stay_duration_days} hari).`,
          statusColor: 'yellow'
        };
      }

      return {
        canShorten: rule.allow_qasar,
        canCombine: rule.allow_jamak_taqdim || rule.allow_jamak_takhir,
        statusMessage: `Anda boleh melakukan Safar (${rule.name}: min ${distance_threshold_km} km).`,
        statusColor: 'green'
      };
    } else {
      return {
        canShorten: false,
        canCombine: false,
        statusMessage: `Jarak belum memenuhi syarat safar (${distanceKm.toFixed(1)} / ${distance_threshold_km} km).`,
        statusColor: 'red'
      };
    }
  }
}
