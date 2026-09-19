import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

function makeContext(headerValue: string | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        header: (name: string) => (name === 'x-admin-key' ? headerValue : undefined),
      }),
    }),
  } as unknown as ExecutionContext;
}

function makeGuard(expectedKey: string) {
  const config = { get: jest.fn().mockReturnValue(expectedKey) };
  return new AdminGuard(config as any);
}

describe('AdminGuard', () => {
  it('allows the request when the header matches the configured key exactly', () => {
    const guard = makeGuard('correct-key');
    expect(guard.canActivate(makeContext('correct-key'))).toBe(true);
  });

  it('rejects when the header is missing', () => {
    const guard = makeGuard('correct-key');
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(UnauthorizedException);
  });

  it('rejects when the header does not match', () => {
    const guard = makeGuard('correct-key');
    expect(() => guard.canActivate(makeContext('wrong-key'))).toThrow(UnauthorizedException);
  });

  it('rejects (without crashing) when the header is a different length than the key', () => {
    const guard = makeGuard('a-fairly-long-admin-key');
    expect(() => guard.canActivate(makeContext('short'))).toThrow(UnauthorizedException);
  });

  it('rejects when no ADMIN_API_KEY is configured at all', () => {
    const guard = makeGuard('');
    expect(() => guard.canActivate(makeContext(''))).toThrow(UnauthorizedException);
  });
});
