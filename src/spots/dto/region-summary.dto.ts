import { ApiProperty } from '@nestjs/swagger';

/** Just the cached summary for a region - no scoring, no recommendations, nothing LLM-triggering. */
export class RegionSummaryDto {
  @ApiProperty({
    type: 'string',
    nullable: true,
    description: 'Null when no cached summary exists yet for the region (e.g. before the first ingest cycle).',
  })
  summary: string | null;

  @ApiProperty({ type: Date, nullable: true })
  generatedAt: Date | null;
}
