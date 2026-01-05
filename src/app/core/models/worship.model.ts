export type MazhabId = 'shafii' | 'hanafi' | 'maliki' | 'hambali';

export interface MazhabRule {
  name: string;
  distance_threshold_km: number;
  stay_duration_days: number;
  allow_jamak_taqdim: boolean;
  allow_jamak_takhir: boolean;
  allow_qasar: boolean;
  notes: string;
}

export interface PrayerDefinition {
  name: string;
  rakaat: number;
  can_jamak: boolean;
  can_qasar: boolean;
}

export interface WorshipRules {
  mazhabs: Record<MazhabId, MazhabRule>;
  prayers: Record<string, PrayerDefinition>;
}

export interface TravelStatus {
  canShorten: boolean; // Qasar
  canCombine: boolean; // Jamak
  statusMessage: string;
  statusColor: 'green' | 'yellow' | 'red';
}
