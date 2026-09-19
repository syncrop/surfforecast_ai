import { Injectable } from '@nestjs/common';
import { SpotRecommendationDto } from '../spots/dto/recommendation.dto';
import { ClaudeService } from './claude.service';

const SYSTEM_PROMPT = `Eres un asistente de surf que traduce datos técnicos ya calculados a lenguaje natural, breve y útil.

REGLAS ESTRICTAS:
- Recibes datos YA analizados (score, breakdown, forecast). NO reinterpretes ni recalcules nada.
- No inventes cifras que no estén en el JSON de entrada.
- Tono: directo, como lo diría un surfista local a otro. Nada de marketing ni exclamaciones excesivas.
- Máximo 3-4 frases por spot.
- Si el score es null o "unknown", dilo claramente en vez de inventar una valoración.`;

@Injectable()
export class SurfSummaryService {
  constructor(private readonly claude: ClaudeService) {}

  async summarize(recommendations: SpotRecommendationDto[], userQuery?: string): Promise<string> {
    const top = recommendations.slice(0, 5); // no le mandes 18 spots, solo lo relevante

    const userPrompt = `Datos de spots (ya scoreados, no recalcules nada):
${JSON.stringify(top, null, 2)}

${userQuery ? `Contexto del usuario: ${userQuery}` : ''}

Genera un resumen breve: cuál es la mejor opción ahora mismo y por qué (basándote solo en el breakdown dado), y menciona 1-2 alternativas si tienen sentido.`;

    return this.claude.complete(SYSTEM_PROMPT, userPrompt);
  }
}
