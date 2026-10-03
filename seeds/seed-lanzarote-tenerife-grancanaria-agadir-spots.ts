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

// Lanzarote + La Graciosa + Tenerife + Gran Canaria (España) + Agadir/Taghazout (Marruecos).
// Mismo patrón que el resto de islas: dominante swell NW de fondo atlántico,
// alisios de NE casi todo el año -> costas norte/oeste reciben el swell pero
// el offshore "de libro" (opuesto al swell) rara vez coincide con el alisio,
// por eso muchos spots de norte solo están limpios a primera hora. Costas
// sur/este, más resguardadas, necesitan swell más grande para entrar.
const seedSpots: SeedSpot[] = [
  // ---- LANZAROTE ----
  {
    name: 'Famara',
    slug: 'famara',
    lat: 29.131, lon: -13.555,
    region: 'La Santa, Lanzarote', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330, // NW
    optimalWindDirMin: 110, optimalWindDirMax: 150,   // SE offshore
    optimalWaveMin: 0.8, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://thesurfatlas.com/surfing-canary-islands/lanzarote-surf/',
    verified: false,
  },
  {
    name: 'El Quemao',
    slug: 'el-quemao',
    lat: 29.057, lon: -13.690,
    region: 'La Santa, Lanzarote', country: 'España',
    breakType: BreakType.REEF_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 300, optimalSwellDirMax: 340, // NW, izquierda muy hueca y potente
    optimalWindDirMin: 120, optimalWindDirMax: 160,
    optimalWaveMin: 1.0, optimalWaveMax: 3.5,
    skillLevel: SkillLevel.EXPERT,
    sourceUrl: 'https://thesurfatlas.com/surfing-canary-islands/lanzarote-surf/',
    verified: false,
  },
  {
    name: 'San Juan (La Santa)',
    slug: 'san-juan-la-santa',
    lat: 29.060, lon: -13.687,
    region: 'La Santa, Lanzarote', country: 'España',
    breakType: BreakType.REEF_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330,
    optimalWindDirMin: 110, optimalWindDirMax: 150,
    optimalWaveMin: 0.8, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://www.surf-forecast.com/breaks/La-Santa-Right',
    verified: false,
  },
  {
    name: 'Punta Mujeres',
    slug: 'punta-mujeres',
    lat: 29.147, lon: -13.427,
    region: 'Haría, Lanzarote', country: 'España',
    breakType: BreakType.REEF_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 340, optimalSwellDirMax: 20, // N, cruza 0°
    optimalWindDirMin: 160, optimalWindDirMax: 200,
    optimalWaveMin: 0.6, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Punta-Mujeres',
    verified: false,
  },
  {
    name: 'Las Cucharas',
    slug: 'las-cucharas-costa-teguise',
    lat: 28.991, lon: -13.492,
    region: 'Costa Teguise, Lanzarote', country: 'España',
    breakType: BreakType.REEF_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 30, optimalSwellDirMax: 70, // NE, costa este
    optimalWindDirMin: 210, optimalWindDirMax: 250,
    optimalWaveMin: 0.5, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Las-Cucharas',
    verified: false,
  },
  {
    name: 'Playa Honda',
    slug: 'playa-honda-lanzarote',
    lat: 28.942, lon: -13.605,
    region: 'San Bartolomé, Lanzarote', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 150, optimalSwellDirMax: 190, // S-SE, resguardada, necesita swell grande
    optimalWindDirMin: 330, optimalWindDirMax: 10,
    optimalWaveMin: 0.5, optimalWaveMax: 1.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Playa-Honda-1',
    verified: false,
  },
  {
    name: 'Papagayo',
    slug: 'papagayo-lanzarote',
    lat: 28.837, lon: -13.721,
    region: 'Yaiza, Lanzarote', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 150, optimalSwellDirMax: 190,
    optimalWindDirMin: 330, optimalWindDirMax: 10,
    optimalWaveMin: 0.3, optimalWaveMax: 1.2,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Playa-Papagayo',
    verified: false,
  },

  // ---- LA GRACIOSA ----
  // Isla pequeña, sin apenas infraestructura de surf - pocos spots documentados.
  {
    name: 'Playa de las Conchas',
    slug: 'playa-de-las-conchas',
    lat: 29.245, lon: -13.527,
    region: 'La Graciosa', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330,
    optimalWindDirMin: 110, optimalWindDirMax: 150,
    optimalWaveMin: 0.5, optimalWaveMax: 1.5, // corrientes fuertes - swell grande = peligroso, no solo "mejor"
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Playa-de-las-Conchas',
    verified: false,
  },
  {
    name: 'El Río',
    slug: 'el-rio-la-graciosa',
    lat: 29.230, lon: -13.500,
    region: 'La Graciosa', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 20, optimalSwellDirMax: 60, // estrecho hacia Lanzarote, resguardado
    optimalWindDirMin: 200, optimalWindDirMax: 240,
    optimalWaveMin: 0.3, optimalWaveMax: 1.0,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.surf-forecast.com/breaks/El-Rio',
    verified: false,
  },

  // ---- TENERIFE ----
  {
    name: 'El Socorro',
    slug: 'el-socorro-tenerife',
    lat: 28.391, lon: -16.588,
    region: 'Norte, Tenerife', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.MIXED,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330,
    optimalWindDirMin: 110, optimalWindDirMax: 150,
    optimalWaveMin: 1.0, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://thesurfatlas.com/surfing-canary-islands/tenerife-surf/',
    verified: false,
  },
  {
    name: 'Bajamar',
    slug: 'bajamar-tenerife',
    lat: 28.552, lon: -16.339,
    region: 'Norte, Tenerife', country: 'España',
    breakType: BreakType.REEF_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 300, optimalSwellDirMax: 340,
    optimalWindDirMin: 120, optimalWindDirMax: 160,
    optimalWaveMin: 0.8, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Bajamar',
    verified: false,
  },
  {
    name: 'Punta del Hidalgo',
    slug: 'punta-del-hidalgo',
    lat: 28.567, lon: -16.320,
    region: 'Norte, Tenerife', country: 'España',
    breakType: BreakType.REEF_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 320, optimalSwellDirMax: 360,
    optimalWindDirMin: 140, optimalWindDirMax: 180,
    optimalWaveMin: 1.0, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Punta-del-Hidalgo',
    verified: false,
  },
  {
    name: 'Playa del Bollullo',
    slug: 'playa-del-bollullo',
    lat: 28.405, lon: -16.546,
    region: 'Norte, Tenerife', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330,
    optimalWindDirMin: 110, optimalWindDirMax: 150,
    optimalWaveMin: 0.5, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Bollullo',
    verified: false,
  },
  {
    name: 'El Médano (La Izquierda)',
    slug: 'el-medano-la-izquierda',
    lat: 28.034, lon: -16.536,
    region: 'El Médano, Tenerife', country: 'España',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 140, optimalSwellDirMax: 180, // S-SE, costa sur
    optimalWindDirMin: 320, optimalWindDirMax: 360,
    optimalWaveMin: 0.5, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://www.surf-forecast.com/breaks/El-Medano',
    verified: false,
  },
  {
    name: 'Igueste de San Andrés',
    slug: 'igueste-de-san-andres',
    lat: 28.509, lon: -16.188,
    region: 'Santa Cruz, Tenerife', country: 'España',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 10, optimalSwellDirMax: 50, // NE, punta noreste
    optimalWindDirMin: 190, optimalWindDirMax: 230,
    optimalWaveMin: 1.0, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.EXPERT,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Igueste-San-Andres',
    verified: false,
  },

  // ---- GRAN CANARIA ----
  {
    name: 'El Confital',
    slug: 'el-confital',
    lat: 28.153, lon: -15.448,
    region: 'Las Palmas, Gran Canaria', country: 'España',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330, // izquierda de clase mundial
    optimalWindDirMin: 110, optimalWindDirMax: 150,
    optimalWaveMin: 0.8, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.EXPERT,
    sourceUrl: 'https://thesurfatlas.com/surfing-canary-islands/gran-canaria-surf/',
    verified: false,
  },
  {
    name: 'Las Canteras (La Cícer)',
    slug: 'las-canteras-la-cicer',
    lat: 28.135, lon: -15.438,
    region: 'Las Palmas, Gran Canaria', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 280, optimalSwellDirMax: 320,
    optimalWindDirMin: 100, optimalWindDirMax: 140,
    optimalWaveMin: 0.3, optimalWaveMax: 1.2, // extremo sur de la playa, protegido por "La Barra"
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Las-Canteras',
    verified: false,
  },
  {
    name: 'Las Canteras (La Barra)',
    slug: 'las-canteras-la-barra',
    lat: 28.150, lon: -15.445,
    region: 'Las Palmas, Gran Canaria', country: 'España',
    breakType: BreakType.REEF_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330,
    optimalWindDirMin: 110, optimalWindDirMax: 150,
    optimalWaveMin: 0.8, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Las-Canteras',
    verified: false,
  },
  {
    name: 'El Lloret',
    slug: 'el-lloret',
    lat: 28.157, lon: -15.450,
    region: 'Las Palmas, Gran Canaria', country: 'España',
    breakType: BreakType.REEF_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330,
    optimalWindDirMin: 110, optimalWindDirMax: 150,
    optimalWaveMin: 0.8, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://www.surf-forecast.com/breaks/El-Lloret',
    verified: false,
  },
  {
    name: 'Sardina del Norte',
    slug: 'sardina-del-norte',
    lat: 28.159, lon: -15.715,
    region: 'Gáldar, Gran Canaria', country: 'España',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 330, optimalSwellDirMax: 10, // N, cruza 0°
    optimalWindDirMin: 150, optimalWindDirMax: 190,
    optimalWaveMin: 0.8, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Sardina',
    verified: false,
  },
  {
    name: 'Patalavaca',
    slug: 'patalavaca',
    lat: 27.780, lon: -15.595,
    region: 'Mogán, Gran Canaria', country: 'España',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.MIXED,
    optimalSwellDirMin: 150, optimalSwellDirMax: 190, // S, costa sur resguardada
    optimalWindDirMin: 330, optimalWindDirMax: 10,
    optimalWaveMin: 0.3, optimalWaveMax: 1.2,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://www.surf-forecast.com/breaks/Patalavaca',
    verified: false,
  },

  // ---- AGADIR / TAGHAZOUT (Marruecos) ----
  // Costa orientada al W/SW: swell NW de fondo atlántico, alisio de tierra
  // (NE) deja la mayoría de los spots offshore sobre todo a primera hora.
  {
    name: 'Anchor Point',
    slug: 'anchor-point-taghazout',
    lat: 30.549, lon: -9.709,
    region: 'Taghazout, Agadir', country: 'Marruecos',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 300, optimalSwellDirMax: 340, // derecha larga, icónica
    optimalWindDirMin: 40, optimalWindDirMax: 80,
    optimalWaveMin: 0.8, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://thesurfatlas.com/surfing-morocco/taghazout-surf/',
    verified: false,
  },
  {
    name: 'Boilers',
    slug: 'boilers-taghazout',
    lat: 30.545, lon: -9.711,
    region: 'Taghazout, Agadir', country: 'Marruecos',
    breakType: BreakType.REEF_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 300, optimalSwellDirMax: 340,
    optimalWindDirMin: 40, optimalWindDirMax: 80,
    optimalWaveMin: 1.0, optimalWaveMax: 3.5,
    skillLevel: SkillLevel.EXPERT,
    sourceUrl: 'https://thesurfatlas.com/surfing-morocco/taghazout-surf/',
    verified: false,
  },
  {
    name: 'Killer Point',
    slug: 'killer-point-taghazout',
    lat: 30.555, lon: -9.706,
    region: 'Taghazout, Agadir', country: 'Marruecos',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.REEF,
    optimalSwellDirMin: 300, optimalSwellDirMax: 340,
    optimalWindDirMin: 40, optimalWindDirMax: 80,
    optimalWaveMin: 0.8, optimalWaveMax: 3.0,
    skillLevel: SkillLevel.ADVANCED,
    sourceUrl: 'https://thesurfatlas.com/surfing-morocco/taghazout-surf/',
    verified: false,
  },
  {
    name: 'Banana Point',
    slug: 'banana-point-aourir',
    lat: 30.470, lon: -9.667,
    region: 'Aourir, Agadir', country: 'Marruecos',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330,
    optimalWindDirMin: 30, optimalWindDirMax: 70,
    optimalWaveMin: 0.5, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://thesurfatlas.com/surfing-morocco/taghazout-surf/',
    verified: false,
  },
  {
    name: 'Imsouane (La Bahía)',
    slug: 'imsouane-bay',
    lat: 30.842, lon: -9.816,
    region: 'Imsouane, Agadir', country: 'Marruecos',
    breakType: BreakType.POINT_BREAK, bottom: BottomType.ROCK,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330, // una de las derechas más largas del mundo
    optimalWindDirMin: 30, optimalWindDirMax: 70,
    optimalWaveMin: 0.5, optimalWaveMax: 2.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://thesurfatlas.com/surfing-morocco/imsouane-surf/',
    verified: false,
  },
  {
    name: 'Agadir Beach',
    slug: 'agadir-beach',
    lat: 30.411, lon: -9.611,
    region: 'Agadir', country: 'Marruecos',
    breakType: BreakType.BEACH_BREAK, bottom: BottomType.SAND,
    optimalSwellDirMin: 280, optimalSwellDirMax: 320,
    optimalWindDirMin: 30, optimalWindDirMax: 70,
    optimalWaveMin: 0.5, optimalWaveMax: 1.8,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: 'https://thesurfatlas.com/surfing-morocco/agadir-surf/',
    verified: false,
  },
  {
    name: 'Tamri',
    slug: 'tamri',
    lat: 30.692, lon: -9.825,
    region: 'Tamri, Agadir', country: 'Marruecos',
    breakType: BreakType.RIVER_MOUTH, bottom: BottomType.SAND,
    optimalSwellDirMin: 290, optimalSwellDirMax: 330,
    optimalWindDirMin: 30, optimalWindDirMax: 70,
    optimalWaveMin: 0.5, optimalWaveMax: 2.0,
    skillLevel: SkillLevel.INTERMEDIATE,
    sourceUrl: 'https://thesurfatlas.com/surfing-morocco/taghazout-surf/',
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
