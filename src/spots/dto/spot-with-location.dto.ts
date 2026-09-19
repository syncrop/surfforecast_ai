import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BottomType, BreakType, SkillLevel } from '../enums/spot.enums';

export class SpotWithLocationDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty() lat: number;
  @ApiProperty() lon: number;
  @ApiProperty() region: string;
  @ApiProperty() country: string;
  @ApiProperty({ enum: BreakType }) breakType: BreakType;
  @ApiProperty({ enum: BottomType }) bottom: BottomType;
  @ApiProperty() optimalSwellDirMin: number;
  @ApiProperty() optimalSwellDirMax: number;
  @ApiProperty() optimalWindDirMin: number;
  @ApiProperty() optimalWindDirMax: number;
  @ApiProperty() optimalWaveMin: number;
  @ApiProperty() optimalWaveMax: number;
  @ApiProperty({ enum: SkillLevel }) skillLevel: SkillLevel;
  @ApiPropertyOptional({ type: 'string', nullable: true }) sourceUrl: string | null;
}

export class NearbySpotDto extends SpotWithLocationDto {
  @ApiProperty({ description: 'Distance from the query point, in meters.' })
  distance: number;
}
