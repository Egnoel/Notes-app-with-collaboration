import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    unique,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { notes } from "./notes";

export const noteRoleEnum = pgEnum("note_role", [
    "viewer",
    "editor",
]);

export const noteCollaborators = pgTable(
    "note_collaborators",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        noteId: uuid("note_id")
            .notNull()
            .references(() => notes.id, {
                onDelete: "cascade",
            }),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        role: noteRoleEnum("role")
            .notNull()
            .default("viewer"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
    },
    (table) => [
        unique().on(table.noteId, table.userId),
    ]
);