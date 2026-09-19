import { IsOptional, IsString } from 'class-validator';
import { FindNearbySpotsDto } from './find-nearby-spots.dto';

export class RecommendationsSummaryDto extends FindNearbySpotsDto {
  /** Free-text context from the user (skill level, what they're after, etc.). */
  @IsOptional()
  @IsString()
  query?: string;
}
