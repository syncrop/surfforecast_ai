import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

/**
 * Shared-secret guard for admin/write endpoints (creating spots, triggering
 * ingestion). Not a full auth system - just enough to stop those endpoints
 * from being wide open to anyone on the internet.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-admin-key') ?? '';
    const expected = this.config.get<string>('ADMIN_API_KEY', '');

    const providedBuf = Buffer.from(provided);
    const expectedBuf = Buffer.from(expected);
    // An unset/empty ADMIN_API_KEY must never authenticate - without this,
    // two empty buffers compare equal and a request with no header at all
    // would pass.
    const isValid =
      expected.length > 0 &&
      providedBuf.length === expectedBuf.length &&
      timingSafeEqual(providedBuf, expectedBuf);

    if (!isValid) {
      throw new UnauthorizedException('Missing or invalid x-admin-key header');
    }
    return true;
  }
}
