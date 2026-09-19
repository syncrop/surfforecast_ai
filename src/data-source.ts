import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Spot } from './spots/entities/spot.entity';
import { Forecast } from './forecasts/entities/forecast.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'tu_password',
  database: process.env.DB_NAME ?? 'surfspots',
  entities: [Spot, Forecast],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
