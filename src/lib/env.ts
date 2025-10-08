import { z } from 'zod';

const envSchema = z.object({
  // Google Cloud credentials (multiple options)
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(), // Path to JSON file
  GOOGLE_APPLICATION_CREDENTIALS_JSON: z.string().optional(), // JSON string directly
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

// Helper to check if using service account (either file path or JSON string)
export function isUsingServiceAccount(): boolean {
  return !!(env.GOOGLE_APPLICATION_CREDENTIALS || env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
}

// Helper to get credentials object for Google client
export function getGoogleCredentials() {
  // Priority: JSON string > file path > ADC
  if (env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const credentials = JSON.parse(env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      console.log('🔑 Using Google credentials from JSON environment variable');
      return { credentials };
    } catch (error) {
      console.error('❌ Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON');
      throw new Error('Invalid Google credentials JSON');
    }
  }
  
  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('🔑 Using Google credentials from file:', env.GOOGLE_APPLICATION_CREDENTIALS);
    return { keyFilename: env.GOOGLE_APPLICATION_CREDENTIALS };
  }
  
  console.log('🔑 Using Application Default Credentials (ADC)');
  return {};
}
