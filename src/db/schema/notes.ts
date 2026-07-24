
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

import { randomUUIDv7 } from "bun";
import { users } from "./users";

export const notes = pgTable("notes", {
    id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),

    title: text("title").notNull(),

    content: text("content").notNull(),

    ownerId: uuid("owner_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
        }),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
});