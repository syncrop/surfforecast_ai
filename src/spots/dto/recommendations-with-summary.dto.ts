import { SpotRecommendationDto } from './recommendation.dto';

export class RecommendationsWithSummaryDto {
  /** Null when no cached summary exists yet for the region (e.g. before the first ingest cycle). */
  summary: string | null;
  summaryGeneratedAt: Date | null;
  recommendations: SpotRecommendationDto[];
}
