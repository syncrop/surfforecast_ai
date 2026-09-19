import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/data-source';
import { BottomType, BreakType, SkillLevel } from '../src/spots/enums/spot.enums';

interface SeedSpot {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  region: string;
  breakType: BreakType;
  bottom: BottomType;
  optimalSwellDirMin: number;
  optimalSwellDirMax: number;
  optimalWindDirMin: number;
  optimalWindDirMax: number;
  optimalWaveMin: number;
  optimalWaveMax: number;
  skillLevel: SkillLevel;
  sourceUrl: string;
  verified: boolean; // false = coords/datos aproximados, revisar
}

// Costa/orientación no verificada -> viento offshore aproximado como
// opuesto (±180°) a la dirección de swell del propio spot, o del spot
// verificado más cercano de la misma región cuando tampoco había swell.
const seedSpots: SeedSpot[] = [
  // ---- NORTH SHORE ----
  {
    name: 'El Cotillo',
    slug: 'el-cotillo',
    lat: 28.685, lon: -14.009,
    region: 'North Shore', breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 260, optimalSwellDirMax: 300, // W
    optimalWindDirMin: 70, optimalWindDirMax: 110,   // E offshore
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://billabongsurfcamp.es/surf-spots/',
    verified: true,
  },
  {
    name: 'Piedra Playa',
    slug: 'piedra-playa',
    lat: 28.670, lon: -14.007,
    region: 'North Shore', breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 260, optimalSwellDirMax: 300,
    optimalWindDirMin: 70, optimalWindDirMax: 110,
    optimalWaveMin: 0.3, optimalWaveMax: 1.0,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.surfescape.com/blog-articles/fuerteventura-surf-spots-guide',
    verified: false,
  },
  {
    name: 'Punta Blanca',
    slug: 'punta-blanca',
    lat: 28.723, lon: -13.965,
    region: 'North Shore', breakType: BreakType.REEF_BREAK,
    bottom: BottomType.REEF,
    optimalSwellDirMin: 315, optimalSwellDirMax: 360,
    optimalWindDirMin: 135, optimalWindDirMax: 180, // sin dato -> offshore = swell opuesto
    optimalWaveMin: 0.5, optimalWaveMax: 1.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.22places.com/surfing-in-fuerteventura/',
    verified: false,
  },
  {
    name: 'El Hierro (The Bubble)',
    slug: 'el-hierro-majanicho',
    lat: 28.760, lon: -13.928,
    region: 'North Shore', breakType: BreakType.REEF_BREAK,
    bottom: BottomType.REEF,
    optimalSwellDirMin: 290, optimalSwellDirMax: 340, // NW-W
    optimalWindDirMin: 290, optimalWindDirMax: 340,
    optimalWaveMin: 1.0, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://thefreesurfer.com/fuerteventura-surf-guide-best-of-the-north/',
    verified: false,
  },
  {
    name: 'La Caleta (Boneyards)',
    slug: 'la-caleta-boneyards',
    lat: 28.755, lon: -13.940,
    region: 'North Shore', breakType: BreakType.REEF_BREAK,
    bottom: BottomType.REEF,
    optimalSwellDirMin: 315, optimalSwellDirMax: 360,
    optimalWindDirMin: 135, optimalWindDirMax: 180, // sin dato -> offshore = swell opuesto
    optimalWaveMin: 0.5, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://surfholidays.com/blog/surf-guide-to-fuerteventura/',
    verified: false,
  },
  {
    name: 'El Muelle',
    slug: 'el-muelle-corralejo',
    lat: 28.733, lon: -13.867,
    region: 'Corralejo', breakType: BreakType.REEF_BREAK,
    bottom: BottomType.ROCK,
    optimalSwellDirMin: 300, optimalSwellDirMax: 360, // sin dato -> swell regional de Corralejo (Punta Elena)
    optimalWindDirMin: 120, optimalWindDirMax: 180,   // offshore = swell opuesto
    optimalWaveMin: 1.0, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://thesurfatlas.com/surfing-in-canary-islands/fuerteventura-surf/',
    verified: false,
  },

  // ---- CORRALEJO BAY / LOBOS ----
  {
    name: 'Punta Elena (Rocky Point)',
    slug: 'punta-elena',
    lat: 28.737, lon: -13.857,
    region: 'Corralejo', breakType: BreakType.REEF_BREAK,
    bottom: BottomType.REEF,
    optimalSwellDirMin: 300, optimalSwellDirMax: 360, // N-NW-W
    optimalWindDirMin: 120, optimalWindDirMax: 180,   // sin dato -> offshore = swell opuesto
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://billabongsurfcamp.es/surf-spots/',
    verified: true,
  },
  {
    name: 'Los Lobos',
    slug: 'los-lobos',
    lat: 28.751, lon: -13.822,
    region: 'Isla de Lobos', breakType: BreakType.POINT_BREAK,
    bottom: BottomType.REEF,
    optimalSwellDirMin: 300, optimalSwellDirMax: 340, // NW grande
    optimalWindDirMin: 120, optimalWindDirMax: 160,   // sin dato -> offshore = swell opuesto
    optimalWaveMin: 1.5, optimalWaveMax: 4.0,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://surfholidays.com/blog/surf-guide-to-fuerteventura/',
    verified: false,
  },
  {
    name: 'Playa Bristol',
    slug: 'playa-bristol',
    lat: 28.735, lon: -13.850,
    region: 'Corralejo', breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 300, optimalSwellDirMax: 340,
    optimalWindDirMin: 300, optimalWindDirMax: 340, // NW offshore
    optimalWaveMin: 1.0, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://www.freshsurf.de/en/spotfinder/',
    verified: false,
  },
  {
    name: 'Corralejo Dunas',
    slug: 'corralejo-dunas',
    lat: 28.725, lon: -13.845,
    region: 'Corralejo', breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 20, optimalSwellDirMax: 60, // NE (verano)
    optimalWindDirMin: 200, optimalWindDirMax: 240, // sin dato -> offshore = swell opuesto
    optimalWaveMin: 0.3, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://www.freshsurf.de/en/spotfinder/',
    verified: false,
  },

  // ---- COSTA ESTE ----
  {
    name: 'Generosa',
    slug: 'generosa',
    lat: 28.55, lon: -13.83,
    region: 'Costa Este', breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 20, optimalSwellDirMax: 60, // sin dato -> NE, como Corralejo Dunas (misma costa este)
    optimalWindDirMin: 200, optimalWindDirMax: 240, // offshore = swell opuesto
    optimalWaveMin: 0.5, optimalWaveMax: 1.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://es.surf-forecast.com/countries/Spain-1/breaks',
    verified: false,
  },

  // ---- SUROESTE ----
  {
    name: 'La Pared (Playa del Viejo Rey)',
    slug: 'la-pared',
    lat: 28.2135, lon: -14.2260,
    region: 'Suroeste', breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.MIXED,
    optimalSwellDirMin: 210, optimalSwellDirMax: 300, // SW-W-NW
    optimalWindDirMin: 30, optimalWindDirMax: 120,    // sin dato -> offshore = swell opuesto
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.mondo.surf/surf-spot/la-pared/guide/2377',
    verified: true,
  },
  {
    name: 'Punta del Tigre',
    slug: 'punta-del-tigre',
    lat: 28.21, lon: -14.24,
    region: 'Suroeste', breakType: BreakType.REEF_BREAK,
    bottom: BottomType.ROCK,
    optimalSwellDirMin: 210, optimalSwellDirMax: 300, // sin dato -> swell regional (La Pared)
    optimalWindDirMin: 30, optimalWindDirMax: 120,    // offshore = swell opuesto
    optimalWaveMin: 1.0, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://es.surf-forecast.com/countries/Spain-1/breaks',
    verified: false,
  },
  {
    name: 'Playa de Esquinzo',
    slug: 'playa-de-esquinzo',
    lat: 28.10, lon: -14.30,
    region: 'Suroeste', breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 315, optimalSwellDirMax: 360, // NW-N
    optimalWindDirMin: 200, optimalWindDirMax: 260,   // SW-S-SE-E
    optimalWaveMin: 0.5, optimalWaveMax: 1.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.fuerteventuraplayas.com/en/?p=7752',
    verified: false,
  },
  {
    name: 'Costa Calma / Sotavento',
    slug: 'costa-calma-sotavento',
    lat: 28.158, lon: -14.222,
    region: 'Suroeste', breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 210, optimalSwellDirMax: 300, // sin dato -> swell regional (La Pared)
    optimalWindDirMin: 30, optimalWindDirMax: 120,    // offshore = swell opuesto
    optimalWaveMin: 0.3, optimalWaveMax: 1.0,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://es.surf-forecast.com/countries/Spain-1/breaks',
    verified: false,
  },
  {
    name: 'Cofete',
    slug: 'cofete',
    lat: 28.09, lon: -14.36,
    region: 'Suroeste', breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 210, optimalSwellDirMax: 300, // sin dato -> swell regional (La Pared)
    optimalWindDirMin: 30, optimalWindDirMax: 120,    // offshore = swell opuesto
    optimalWaveMin: 1.0, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://es.surf-forecast.com/countries/Spain-1/breaks',
    verified: false,
  },
  {
    name: 'Las Salinas',
    slug: 'las-salinas',
    lat: 28.20, lon: -14.26,
    region: 'Suroeste', breakType: BreakType.REEF_BREAK,
    bottom: BottomType.MIXED,
    optimalSwellDirMin: 210, optimalSwellDirMax: 300, // sin dato -> swell regional (La Pared)
    optimalWindDirMin: 30, optimalWindDirMax: 120,    // offshore = swell opuesto
    optimalWaveMin: 0.5, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://es.surf-forecast.com/countries/Spain-1/breaks',
    verified: false,
  },
  {
    name: 'Cruz Roja',
    slug: 'cruz-roja',
    lat: 28.20, lon: -14.24,
    region: 'Suroeste', breakType: BreakType.REEF_BREAK,
    bottom: BottomType.REEF,
    optimalSwellDirMin: 210, optimalSwellDirMax: 300, // sin dato -> swell regional (La Pared)
    optimalWindDirMin: 30, optimalWindDirMax: 120,    // offshore = swell opuesto
    optimalWaveMin: 1.0, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://es.surf-forecast.com/countries/Spain-1/breaks',
    verified: false,
  },
];

async function run() {
  const ds: DataSource = await AppDataSource.initialize();

  for (const s of seedSpots) {
    await ds.query(
      `INSERT INTO "spots"
        ("name", "slug", "location", "region", "country", "breakType", "bottom",
         "optimalSwellDirMin", "optimalSwellDirMax",
         "optimalWindDirMin", "optimalWindDirMax",
         "optimalWaveMin", "optimalWaveMax",
         "skillLevel", "sourceUrl")
       VALUES
        ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography,
         $5, 'Spain', $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT ("slug") DO NOTHING`,
      [
        s.name, s.slug, s.lon, s.lat, s.region, s.breakType, s.bottom,
        s.optimalSwellDirMin, s.optimalSwellDirMax,
        s.optimalWindDirMin, s.optimalWindDirMax,
        s.optimalWaveMin, s.optimalWaveMax,
        s.skillLevel, s.sourceUrl,
      ],
    );
    console.log(`${s.verified ? '✅' : '⚠️ '} ${s.name} — ${s.slug}`);
  }

  const unverified = seedSpots.filter((s) => !s.verified).length;
  console.log(`\nInsertados ${seedSpots.length} spots. ${unverified} requieren verificación manual en Wannasurf/MSW (coords/rangos aproximados).`);

  await ds.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
