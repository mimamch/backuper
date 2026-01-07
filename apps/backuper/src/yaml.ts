import { readFileSync } from "fs";
import YAML from "yaml";
import { z } from "zod";
export const getConfigFromYaml = () => {
  const configs = YAML.parse(readFileSync("config.yaml", "utf8"));

  const result = z
    .object({
      storage: z.object({
        s3: z.object({
          region: z.string().default("auto"),
          access_key: z.string(),
          secret_key: z.string(),
          endpoint: z.string(),
          bucket: z.string(),
        }),
      }),
      plans: z.array(
        z.object({
          id: z.string().optional(),
          name: z.string(),
          active: z.boolean().default(true),
          schedule: z.string(),
          max_backups: z.number(),
          type: z.enum(["dir", "postgresql"]),

          postgresql: z
            .object({
              host: z.string(),
              port: z.number(),
              database: z.string(),
              username: z.string(),
              password: z.string(),
            })
            .optional(),

          dir: z
            .object({
              path: z.string(),
            })
            .optional(),
        })
      ),
    })
    .safeParse(configs);

  if (!result.success) {
    console.error(result.error);
    throw new Error("Invalid config.yaml");
  }

  // validate postgresql plans
  for (const plan of result.data.plans) {
    if (plan.type === "postgresql" && !plan.postgresql) {
      throw new Error(
        `PostgreSQL plan ${plan.name} is missing postgresql configuration`
      );
    }
  }

  return result.data;
};
