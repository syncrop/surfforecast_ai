import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ScoringModule } from '../scoring/scoring.module';
import { SpotsController } from './spots.controller';
import { SpotsRepository } from './repositories/spots.repository';
import { SpotsService } from './spots.service';

@Module({
  imports: [ScoringModule, AiModule],
  controllers: [SpotsController],
  providers: [SpotsService, SpotsRepository],
  exports: [SpotsService],
})
export class SpotsModule {}
