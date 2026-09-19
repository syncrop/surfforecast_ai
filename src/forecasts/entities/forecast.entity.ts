import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Spot } from '../../spots/entities/spot.entity';

@Entity('forecasts')
export class Forecast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Spot, (spot) => spot.forecasts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spotId' })
  spot: Spot;

  @Column()
  spotId: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fetchedAt: Date;

  @Index()
  @Column({ type: 'timestamptz' })
  forecastTime: Date;

  @Column({ type: 'real' })
  waveHeight: number;

  @Column({ type: 'real' })
  wavePeriod: number;

  @Column({ type: 'smallint' })
  swellDirection: number;

  @Column({ type: 'real' })
  windSpeed: number;

  @Column({ type: 'smallint' })
  windDirection: number;

  @Column({ type: 'real', nullable: true })
  tideHeight: number | null;

  @Column({ type: 'jsonb' })
  rawResponse: Record<string, unknown>;
}
