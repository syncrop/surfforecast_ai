import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsOptional, Max, Min } from 'class-validator';

export class FindNearbySpotsDto {
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @Type(() => Number)
  @IsLongitude()
  lon: number;

  @IsOptional()
  @Type(() => Number)
  @Min(100)
  @Max(200_000)
  radius?: number = 20_000;
}
