import {env} from "@/env";
import {drizzle} from "drizzle-orm/node-postgres";
import { schema } from "./schema";


export const db = drizzle(env.DATABASE_URL, 
    {
    schema,
    casing: "snake_case"
    }
);