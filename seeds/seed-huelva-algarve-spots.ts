import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/data-source';
import { BottomType, BreakType, SkillLevel } from '../src/spots/enums/spot.enums';

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
  sourceUrl: string;
  verified: boolean; // false = coords/datos aproximados, revisar
}

// Costa de Huelva (España) + Algarve (Portugal).
// Huelva: costa orientada al sur/suroeste -> swell SW-W, offshore terral (NE-E).
// Algarve oeste (Costa Vicentina): expuesta al Atlántico -> swell NW-W, offshore N-NE.
// Algarve sur: resguardada -> necesita swell de S, offshore N.
const seedSpots: SeedSpot[] = [
  // ---- HUELVA ----
  {
    name: 'El Rompido',
    slug: 'el-rompido',
    lat: 37.213, lon: -7.123,
    region: 'Cartaya, Huelva', country: 'España',
    breakType: BreakType.RIVER_MOUTH, bottom: BottomType.SAND,
    optimalSwellDirMin: 200, optimalSwellDirMax: 250, // SW
    optimalWindDirMin: 30, optimalWindDirMax: 70,     // NE offshore (terral)
    optimalWaveMin: 0.5, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://guiasurfespana.es/surf-andalucia/huelva/',
    verified: false,
  },
  {
    name: 'Isla Cristina',
    slug: 'isla-cristina',
    lat: 37.198, lon: -7.318,
    region: 'Isla Cristina, Huelva', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 200, optimalSwellDirMax: 250,
    optimalWindDirMin: 30, optimalWindDirMax: 70,
    optimalWaveMin: 0.5, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://surfspots360.com/europa/espana/andalucia/huelva/',
    verified: false,
  },
  {
    name: 'Isla Canela',
    slug: 'isla-canela',
    lat: 37.173, lon: -7.336,
    region: 'Ayamonte, Huelva', country: 'España',
    breakType: BreakType.RIVER_MOUTH, bottom: BottomType.SAND,
    optimalSwellDirMin: 190, optimalSwellDirMax: 240, // sin dato -> swell regional Huelva
    optimalWindDirMin: 70, optimalWindDirMax: 110,    // E offshore (dato: viento de levante da las mejores condiciones)
    optimalWaveMin: 0.3, optimalWaveMax: 1.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://surfspots360.com/europa/espana/andalucia/huelva/',
    verified: false,
  },
  {
    name: 'Punta Umbría',
    slug: 'punta-umbria',
    lat: 37.181, lon: -6.965,
    region: 'Punta Umbría, Huelva', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 200, optimalSwellDirMax: 250,
    optimalWindDirMin: 30, optimalWindDirMax: 70,
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://surfspots360.com/europa/espana/andalucia/huelva/',
    verified: false,
  },
  {
    name: 'Mazagón',
    slug: 'mazagon',
    lat: 37.134, lon: -6.832,
    region: 'Moguer, Huelva', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 200, optimalSwellDirMax: 250,
    optimalWindDirMin: 30, optimalWindDirMax: 70,
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://guiasurfespana.es/surf-andalucia/huelva/',
    verified: false,
  },
  {
    name: 'Matalascañas',
    slug: 'matalascanas',
    lat: 37.006, lon: -6.557,
    region: 'Almonte, Huelva', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 200, optimalSwellDirMax: 250,
    optimalWindDirMin: 30, optimalWindDirMax: 70,
    optimalWaveMin: 0.3, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.huelva24.com/playas/mejores-playas-huelva-surf-20240621173134-nth.html',
    verified: false,
  },
  {
    name: 'La Antilla',
    slug: 'la-antilla',
    lat: 37.198, lon: -7.247,
    region: 'Lepe, Huelva', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 200, optimalSwellDirMax: 250, // sin dato -> swell regional Huelva
    optimalWindDirMin: 30, optimalWindDirMax: 70,
    optimalWaveMin: 0.3, optimalWaveMax: 1.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://guiasurfespana.es/surf-andalucia/huelva/',
    verified: false,
  },

  // ---- ALGARVE OESTE (Costa Vicentina) ----
  {
    name: 'Arrifana',
    slug: 'arrifana',
    lat: 37.286, lon: -8.866,
    region: 'Aljezur, Algarve', country: 'Portugal',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.ROCK,
    optimalSwellDirMin: 280, optimalSwellDirMax: 320, // NW-W
    optimalWindDirMin: 0, optimalWindDirMax: 40,      // N-NE offshore
    optimalWaveMin: 0.5, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://thesurfatlas.com/surfing-portugal/algarve-surf/',
    verified: false,
  },
  {
    name: 'Praia do Amado',
    slug: 'praia-do-amado',
    lat: 37.179, lon: -8.917,
    region: 'Aljezur, Algarve', country: 'Portugal',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 270, optimalSwellDirMax: 310,
    optimalWindDirMin: 0, optimalWindDirMax: 40,
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://thesurfatlas.com/surfing-portugal/praia-do-amado-surf/',
    verified: false,
  },
  {
    name: 'Praia da Bordeira (Carrapateira)',
    slug: 'praia-da-bordeira',
    lat: 37.190, lon: -8.908,
    region: 'Aljezur, Algarve', country: 'Portugal',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 270, optimalSwellDirMax: 320,
    optimalWindDirMin: 0, optimalWindDirMax: 40,
    optimalWaveMin: 1.0, optimalWaveMax: 3.5,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://thesurfatlas.com/surfing-portugal/algarve-surf/',
    verified: false,
  },
  {
    name: 'Praia do Castelejo',
    slug: 'praia-do-castelejo',
    lat: 37.022, lon: -8.936,
    region: 'Vila do Bispo, Algarve', country: 'Portugal',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 280, optimalSwellDirMax: 320, // sin dato -> swell regional Algarve oeste
    optimalWindDirMin: 0, optimalWindDirMax: 40,
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://portugalsurfspots.com/surf-spots/algarve/',
    verified: false,
  },
  {
    name: 'Praia do Tonel',
    slug: 'praia-do-tonel',
    lat: 37.006, lon: -8.946,
    region: 'Vila do Bispo, Algarve', country: 'Portugal',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 270, optimalSwellDirMax: 310,
    optimalWindDirMin: 0, optimalWindDirMax: 40,
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://www.pac4portugal.com/post/surf-spots-in-the-algarve',
    verified: false,
  },
  {
    name: 'Zavial',
    slug: 'zavial',
    lat: 37.008, lon: -8.850,
    region: 'Vila do Bispo, Algarve', country: 'Portugal',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.ROCK,
    optimalSwellDirMin: 210, optimalSwellDirMax: 260, // needs W-S swell (protegido de NW puro)
    optimalWindDirMin: 0, optimalWindDirMax: 40,
    optimalWaveMin: 1.0, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://thesurfatlas.com/surfing-portugal/algarve-surf/',
    verified: false,
  },
  {
    name: 'Odeceixe',
    slug: 'odeceixe',
    lat: 37.427, lon: -8.801,
    region: 'Aljezur, Algarve', country: 'Portugal',
    breakType: BreakType.RIVER_MOUTH, bottom: BottomType.SAND,
    optimalSwellDirMin: 270, optimalSwellDirMax: 310,
    optimalWindDirMin: 0, optimalWindDirMax: 40,
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://portugalsurfspots.com/surf-spots/algarve/',
    verified: false,
  },

  // ---- ALGARVE SUR (resguardada, necesita swell de S) ----
  {
    name: 'Praia da Rocha',
    slug: 'praia-da-rocha',
    lat: 37.120, lon: -8.538,
    region: 'Portimão, Algarve', country: 'Portugal',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 160, optimalSwellDirMax: 210, // S-SW
    optimalWindDirMin: 330, optimalWindDirMax: 10,    // N offshore
    optimalWaveMin: 0.3, optimalWaveMax: 1.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://thesurfatlas.com/surfing-portugal/algarve-surf/',
    verified: false,
  },
  {
    name: 'Praia de Faro',
    slug: 'praia-de-faro',
    lat: 36.998, lon: -7.982,
    region: 'Faro, Algarve', country: 'Portugal',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 160, optimalSwellDirMax: 210,
    optimalWindDirMin: 330, optimalWindDirMax: 10,
    optimalWaveMin: 0.3, optimalWaveMax: 1.2,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://portugalsurfspots.com/surf-spots/algarve/',
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
         $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT ("slug") DO NOTHING`,
      [
        s.name, s.slug, s.lon, s.lat, s.region, s.country, s.breakType, s.bottom,
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
