import {z} from "zod";

export const envSchema = z.object({
    DATABASE_URL: z.url().startsWith("postgresql://"),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url()
});

export const env = envSchema.parse(process.env);