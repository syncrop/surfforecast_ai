import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Forecast } from '../../forecasts/entities/forecast.entity';
import { BottomType, BreakType, SkillLevel } from '../enums/spot.enums';

@Entity('spots')
export class Spot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  /**
   * geography(Point,4326). TypeORM's built-in geometry hydration for
   * `geography` columns is unreliable on insert/select, so reads/writes of
   * this column always go through SpotsRepository's raw SQL methods
   * (ST_MakePoint / ST_X / ST_Y). This property only exists so migrations
   * and the column definition are generated correctly - don't read/write it
   * directly via the base Repository API.
   */
  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: string;

  @Column()
  region: string;

  @Column()
  country: string;

  @Column({ type: 'enum', enum: BreakType })
  breakType: BreakType;

  @Column({ type: 'enum', enum: BottomType })
  bottom: BottomType;

  @Column({ type: 'smallint' })
  optimalSwellDirMin: number;

  @Column({ type: 'smallint' })
  optimalSwellDirMax: number;

  @Column({ type: 'smallint' })
  optimalWindDirMin: number;

  @Column({ type: 'smallint' })
  optimalWindDirMax: number;

  @Column({ type: 'real' })
  optimalWaveMin: number;

  @Column({ type: 'real' })
  optimalWaveMax: number;

  @Column({ type: 'enum', enum: SkillLevel })
  skillLevel: SkillLevel;

  @Column({ type: 'varchar', nullable: true })
  sourceUrl: string | null;

  @OneToMany(() => Forecast, (forecast) => forecast.spot)
  forecasts: Forecast[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
