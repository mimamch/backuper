import "dotenv/config";
import { z } from "zod";

export const env = z
  .object({
    NODE_ENV: z.enum(["DEVELOPMENT", "PRODUCTION"]).default("DEVELOPMENT"),
    DATABASE_URL: z.string(),
    PORT: z
      .string()
      .default("5555")
      .transform((e) => Number(e)),

    // AWS S3
    S3_REGION: z.string().default("auto"),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_ENDPOINT: z.string(),
    S3_BUCKET: z.string(),
    S3_INDEX_BASE_URL: z.string().default(""),
  })
  .parse(process.env);
