import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { BottomType, BreakType, SkillLevel } from '../enums/spot.enums';

export class CreateSpotDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lon: number;

  @IsString()
  region: string;

  @IsString()
  country: string;

  @IsEnum(BreakType)
  breakType: BreakType;

  @IsEnum(BottomType)
  bottom: BottomType;

  @Min(0)
  @Max(360)
  optimalSwellDirMin: number;

  @Min(0)
  @Max(360)
  optimalSwellDirMax: number;

  @Min(0)
  @Max(360)
  optimalWindDirMin: number;

  @Min(0)
  @Max(360)
  optimalWindDirMax: number;

  @Min(0)
  optimalWaveMin: number;

  @Min(0)
  optimalWaveMax: number;

  @IsEnum(SkillLevel)
  skillLevel: SkillLevel;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;
}
