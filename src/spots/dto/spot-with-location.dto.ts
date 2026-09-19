import { BottomType, BreakType, SkillLevel } from '../enums/spot.enums';

export class SpotWithLocationDto {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lon: number;
  region: string;
  country: string;
  breakType: BreakType;
  bottom: BottomType;
  optimalSwellDirMin: number;
  optimalSwellDirMax: number;
  optimalWindDirMin: number;
  optimalWindDirMax: number;
  optimalWaveMin: number;
  optimalWaveMax: number;
  skillLevel: SkillLevel;
  sourceUrl: string | null;
}

export class NearbySpotDto extends SpotWithLocationDto {
  /** Distance from the query point, in meters. */
  distance: number;
}
