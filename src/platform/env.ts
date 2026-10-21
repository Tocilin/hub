import { z } from "zod";

/** Parses an env source against a schema; the error names invalid keys but never prints values. */
export function parseEnv<T extends z.ZodType>(
  schema: T,
  source: Record<string, unknown>,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const keys = [...new Set(result.error.issues.map((issue) => issue.path.join(".")))];
    throw new Error(`Invalid environment variables: ${keys.join(", ")}. See .env.example.`);
  }
  return result.data;
}

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

let publicEnv: PublicEnv | undefined;

/** Public env, safe for client and server code. Parsed on first use, not at build time. */
export function getPublicEnv(): PublicEnv {
  // Next.js inlines NEXT_PUBLIC_* only when referenced literally, so list each key.
  publicEnv ??= parseEnv(publicEnvSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  return publicEnv;
}
