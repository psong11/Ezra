import { z } from 'zod';

const envSchema = z.object({
  // Google Cloud credentials path (optional - falls back to ADC)
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  
  // Next.js environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
}

// Export validated environment variables
export const env = validateEnv();

// Helper to check if using service account
export function isUsingServiceAccount(): boolean {
  return !!env.GOOGLE_APPLICATION_CREDENTIALS;
}
