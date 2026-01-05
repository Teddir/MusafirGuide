import { Injectable, signal, computed } from '@angular/core'; // Remove inject, HttpClient
import { MazhabId, TravelStatus } from '../models/worship.model';
import { WORSHIP_RULES } from '../constants/worship-rules.const';

@Injectable({
  providedIn: 'root'
})
export class JurisprudenceService {
  // State
  readonly selectedMazhabId = signal<MazhabId>('shafii');

  // Load Rules (Now Static)
  readonly rules = signal(WORSHIP_RULES);

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
