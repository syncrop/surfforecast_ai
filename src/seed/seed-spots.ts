import { AppDataSource } from '../data-source';
import { BottomType, BreakType, SkillLevel } from '../spots/enums/spot.enums';

interface SeedSpot {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  region: string;
  country: string;
  breakType: BreakType;
  bottom: BottomType;
  optimalSwellDirMin: number;
  optimalSwellDirMax: number;
  optimalWindDirMin: number;
  optimalWindDirMax: number;
  optimalWaveMin: number;
  optimalWaveMax: number;
  skillLevel: SkillLevel;
  sourceUrl?: string;
}

// Costa de la Luz (Cádiz), from Tarifa up to Chipiona. Coordinates and
// exposure are approximate/illustrative, not survey-grade.
const SPOTS: SeedSpot[] = [
  {
    name: 'El Palmar',
    slug: 'el-palmar',
    lat: 36.1975,
    lon: -6.108,
    region: 'Vejer de la Frontera, Cádiz',
    country: 'España',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 210,
    optimalSwellDirMax: 250,
    optimalWindDirMin: 70,
    optimalWindDirMax: 110,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2.5,
    skillLevel: SkillLevel.BEGINNER,
  },
  {
    name: 'Los Caños de Meca',
    slug: 'los-canos-de-meca',
    lat: 36.18,
    lon: -6.035,
    region: 'Barbate, Cádiz',
    country: 'España',
    breakType: BreakType.POINT_BREAK,
    bottom: BottomType.ROCK,
    optimalSwellDirMin: 220,
    optimalSwellDirMax: 260,
    optimalWindDirMin: 30,
    optimalWindDirMax: 70,
    optimalWaveMin: 1,
    optimalWaveMax: 3,
    skillLevel: SkillLevel.ADVANCED,
  },
  {
    name: 'Zahora',
    slug: 'zahora',
    lat: 36.165,
    lon: -6.07,
    region: 'Barbate, Cádiz',
    country: 'España',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 200,
    optimalSwellDirMax: 240,
    optimalWindDirMin: 60,
    optimalWindDirMax: 100,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2,
    skillLevel: SkillLevel.BEGINNER,
  },
  {
    name: 'Playa de los Bateles',
    slug: 'los-bateles-conil',
    lat: 36.2779,
    lon: -6.0917,
    region: 'Conil de la Frontera, Cádiz',
    country: 'España',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 200,
    optimalSwellDirMax: 250,
    optimalWindDirMin: 40,
    optimalWindDirMax: 80,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2,
    skillLevel: SkillLevel.BEGINNER,
  },
  {
    name: 'La Fontanilla',
    slug: 'la-fontanilla-conil',
    lat: 36.282,
    lon: -6.097,
    region: 'Conil de la Frontera, Cádiz',
    country: 'España',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 210,
    optimalSwellDirMax: 250,
    optimalWindDirMin: 40,
    optimalWindDirMax: 80,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
  },
  {
    name: 'La Barrota',
    slug: 'la-barrota',
    lat: 36.26,
    lon: -6.08,
    region: 'Conil de la Frontera, Cádiz',
    country: 'España',
    breakType: BreakType.REEF_BREAK,
    bottom: BottomType.ROCK,
    optimalSwellDirMin: 240,
    optimalSwellDirMax: 280,
    optimalWindDirMin: 60,
    optimalWindDirMax: 100,
    optimalWaveMin: 1,
    optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
  },
  {
    name: 'Roche',
    slug: 'roche',
    lat: 36.235,
    lon: -6.147,
    region: 'Conil de la Frontera, Cádiz',
    country: 'España',
    breakType: BreakType.POINT_BREAK,
    bottom: BottomType.REEF,
    optimalSwellDirMin: 210,
    optimalSwellDirMax: 250,
    optimalWindDirMin: 30,
    optimalWindDirMax: 70,
    optimalWaveMin: 1,
    optimalWaveMax: 3,
    skillLevel: SkillLevel.ADVANCED,
  },
  {
    name: 'Cortadura',
    slug: 'cortadura',
    lat: 36.485,
    lon: -6.245,
    region: 'Cádiz',
    country: 'España',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 200,
    optimalSwellDirMax: 240,
    optimalWindDirMin: 60,
    optimalWindDirMax: 100,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2,
    skillLevel: SkillLevel.BEGINNER,
  },
  {
    name: 'La Victoria',
    slug: 'la-victoria-cadiz',
    lat: 36.515,
    lon: -6.285,
    region: 'Cádiz',
    country: 'España',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 210,
    optimalSwellDirMax: 250,
    optimalWindDirMin: 70,
    optimalWindDirMax: 110,
    optimalWaveMin: 0.5,
    optimalWaveMax: 1.5,
    skillLevel: SkillLevel.BEGINNER,
  },
  {
    name: 'Camposoto',
    slug: 'camposoto',
    lat: 36.44,
    lon: -6.205,
    region: 'San Fernando, Cádiz',
    country: 'España',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 200,
    optimalSwellDirMax: 240,
    optimalWindDirMin: 40,
    optimalWindDirMax: 80,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2,
    skillLevel: SkillLevel.INTERMEDIATE,
  },
  {
    name: 'Punta Candor',
    slug: 'punta-candor',
    lat: 36.625,
    lon: -6.355,
    region: 'Rota, Cádiz',
    country: 'España',
    breakType: BreakType.POINT_BREAK,
    bottom: BottomType.ROCK,
    optimalSwellDirMin: 270,
    optimalSwellDirMax: 320,
    optimalWindDirMin: 60,
    optimalWindDirMax: 100,
    optimalWaveMin: 1,
    optimalWaveMax: 2.5,
    skillLevel: SkillLevel.ADVANCED,
  },
  {
    name: 'Regla',
    slug: 'regla-chipiona',
    lat: 36.735,
    lon: -6.435,
    region: 'Chipiona, Cádiz',
    country: 'España',
    breakType: BreakType.REEF_BREAK,
    bottom: BottomType.MIXED,
    optimalSwellDirMin: 260,
    optimalSwellDirMax: 300,
    optimalWindDirMin: 60,
    optimalWindDirMax: 100,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2,
    skillLevel: SkillLevel.INTERMEDIATE,
  },
  {
    name: 'Los Lances',
    slug: 'los-lances-tarifa',
    lat: 36.015,
    lon: -5.61,
    region: 'Tarifa, Cádiz',
    country: 'España',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 180,
    optimalSwellDirMax: 220,
    optimalWindDirMin: 250,
    optimalWindDirMax: 290,
    optimalWaveMin: 0.5,
    optimalWaveMax: 1.5,
    skillLevel: SkillLevel.BEGINNER,
  },
  {
    name: 'Valdevaqueros',
    slug: 'valdevaqueros',
    lat: 36.055,
    lon: -5.665,
    region: 'Tarifa, Cádiz',
    country: 'España',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 180,
    optimalSwellDirMax: 220,
    optimalWindDirMin: 250,
    optimalWindDirMax: 290,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2,
    skillLevel: SkillLevel.INTERMEDIATE,
  },
];

async function seed() {
  const dataSource = await AppDataSource.initialize();

  try {
    for (const spot of SPOTS) {
      await dataSource.query(
        `
        INSERT INTO "spots" (
          "name", "slug", "location", "region", "country", "breakType", "bottom",
          "optimalSwellDirMin", "optimalSwellDirMax", "optimalWindDirMin", "optimalWindDirMax",
          "optimalWaveMin", "optimalWaveMax", "skillLevel", "sourceUrl"
        ) VALUES (
          $1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15, $16
        )
        ON CONFLICT ("slug") DO NOTHING
        `,
        [
          spot.name,
          spot.slug,
          spot.lon,
          spot.lat,
          spot.region,
          spot.country,
          spot.breakType,
          spot.bottom,
          spot.optimalSwellDirMin,
          spot.optimalSwellDirMax,
          spot.optimalWindDirMin,
          spot.optimalWindDirMax,
          spot.optimalWaveMin,
          spot.optimalWaveMax,
          spot.skillLevel,
          spot.sourceUrl ?? null,
        ],
      );
      console.log(`Seeded: ${spot.name}`);
    }
  } finally {
    await dataSource.destroy();
  }
}

seed()
  .then(() => {
    console.log('Seed completado.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed falló:', err);
    process.exit(1);
  });
