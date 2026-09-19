import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsOptional, Max, Min } from 'class-validator';

export class FindNearbySpotsDto {
  @ApiProperty({ example: 36.1975 })
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: -6.108 })
  @Type(() => Number)
  @IsLongitude()
  lon: number;

  @ApiPropertyOptional({
    example: 20_000,
    minimum: 100,
    maximum: 200_000,
    description: 'Search radius in meters. Defaults to 20km.',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(100)
  @Max(200_000)
  radius?: number = 20_000;
}
