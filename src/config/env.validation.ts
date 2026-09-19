import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().default('surfspots'),

  // Empty until a real key is added - the AI summary endpoints degrade
  // gracefully (cache-only / clear failure) without it, see SurfSummaryService.
  ANTHROPIC_API_KEY: Joi.string().allow('').default(''),

  // Shared secret for the AdminGuard protecting write/ingest endpoints.
  ADMIN_API_KEY: Joi.string().min(16).required(),
});
