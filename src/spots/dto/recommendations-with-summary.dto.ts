import { ApiProperty } from '@nestjs/swagger';
import { SpotRecommendationDto } from './recommendation.dto';

export class RecommendationsWithSummaryDto {
  @ApiProperty({
    type: 'string',
    nullable: true,
    description: 'Null when no cached summary exists yet for the region (e.g. before the first ingest cycle).',
  })
  summary: string | null;

  @ApiProperty({ type: Date, nullable: true })
  summaryGeneratedAt: Date | null;

  @ApiProperty({ type: [SpotRecommendationDto] })
  recommendations: SpotRecommendationDto[];
}
