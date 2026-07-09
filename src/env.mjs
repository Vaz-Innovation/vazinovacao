// @ts-check
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
  extends: [vercel()],
  shared: {
    BASE_URL: z.url().default("http://localhost:3333"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    CORS_ALLOWED_ORIGINS: z
      .string()
      .optional()
      .default(
        "http://localhost:3000, http://localhost:8082, http://localhost:8081, expo://",
      )
      .transform(val => val.split(",").map(val => val.trim()))
      .pipe(z.array(z.string())),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {},

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_GTM_ID: z.string().default("GTM-XYZ"),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    NODE_ENV: process.env.NODE_ENV,
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
    BASE_URL: process.env.BASE_URL,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
