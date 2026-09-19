import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content: ClaudeContentBlock[];
}

@Injectable()
export class ClaudeService {
  private readonly apiKey: string;
  private readonly url = 'https://api.anthropic.com/v1/messages';

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('ANTHROPIC_API_KEY', '');
  }

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
    const data = (await res.json()) as ClaudeResponse;
    return data.content.find((c) => c.type === 'text')?.text ?? '';
  }
}
