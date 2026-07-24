import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import { openAPI } from 'better-auth/plugins'


export const auth = betterAuth({
    basePath: "/auth",
    trustedOrigins: ["http://localhost:5173"],
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true
    }),
    plugins: [openAPI()],
    advanced: {
        database: { generateId: false }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        password: {
            hash: (password: string) => Bun.password.hash(password),
            verify: ({ password, hash }) => Bun.password.verify(password, hash)
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5
        }
    }
})