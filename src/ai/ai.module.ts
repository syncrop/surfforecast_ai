import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { SurfSummaryService } from './surf-summary.service';

@Module({
  providers: [ClaudeService, SurfSummaryService],
  exports: [SurfSummaryService],
})
export class AiModule {}
