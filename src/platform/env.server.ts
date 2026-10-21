import "server-only";

import { z } from "zod";

import { parseEnv } from "./env";

export const serverEnvSchema = z.object({
  HUB_APPROVED_EMAIL: z.string().trim().toLowerCase().pipe(z.email()),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let serverEnv: ServerEnv | undefined;

/** Server-only env. Importing this from a Client Component fails the build. */
export function getServerEnv(): ServerEnv {
  serverEnv ??= parseEnv(serverEnvSchema, process.env);
  return serverEnv;
}
