import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'El Palmar' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'el-palmar' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 36.1975 })
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: -6.108 })
  @IsLongitude()
  lon: number;

  @ApiProperty({ example: 'Vejer de la Frontera, Cádiz' })
  @IsString()
  region: string;

  @ApiProperty({ example: 'España' })
  @IsString()
  country: string;

  @ApiProperty({ enum: BreakType })
  @IsEnum(BreakType)
  breakType: BreakType;

  @ApiProperty({ enum: BottomType })
  @IsEnum(BottomType)
  bottom: BottomType;

  @ApiProperty({ minimum: 0, maximum: 360, description: 'Degrees' })
  @Min(0)
  @Max(360)
  optimalSwellDirMin: number;

  @ApiProperty({ minimum: 0, maximum: 360, description: 'Degrees' })
  @Min(0)
  @Max(360)
  optimalSwellDirMax: number;

  @ApiProperty({ minimum: 0, maximum: 360, description: 'Degrees' })
  @Min(0)
  @Max(360)
  optimalWindDirMin: number;

  @ApiProperty({ minimum: 0, maximum: 360, description: 'Degrees' })
  @Min(0)
  @Max(360)
  optimalWindDirMax: number;

  @ApiProperty({ minimum: 0, description: 'Meters' })
  @Min(0)
  optimalWaveMin: number;

  @ApiProperty({ minimum: 0, description: 'Meters' })
  @Min(0)
  optimalWaveMax: number;

  @ApiProperty({ enum: SkillLevel })
  @IsEnum(SkillLevel)
  skillLevel: SkillLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;
}
