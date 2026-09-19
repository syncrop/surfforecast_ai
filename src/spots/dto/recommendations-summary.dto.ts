import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { FindNearbySpotsDto } from './find-nearby-spots.dto';

export class RecommendationsSummaryDto extends FindNearbySpotsDto {
  @ApiPropertyOptional({
    example: 'soy principiante y quiero olas suaves esta tarde',
    description:
      'Free-text context from the user. Triggers a live Claude call instead of the cached ' +
      'per-region summary, and only adjusts tone/focus - it never changes the ranking.',
  })
  @IsOptional()
  @IsString()
  query?: string;
}
