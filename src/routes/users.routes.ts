import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { searchUsersForNoteInvite } from "@/services/users.service";
import { Elysia } from "elysia";
import { z } from "zod";


const usersRoute = new Elysia({
    prefix: "/users",
})
    .use(betterAuthPlugin)
    .guard({
        auth: true,
    })
    .get(
        "/search",
        async ({ query, user, status }) => {
            try {
                return await searchUsersForNoteInvite({
                    search: query.q,
                    noteId: query.noteId,
                    userId: user.id,
                });
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.message === "Note not found"
                ) {
                    return status(404, {
                        message: "Note not found",
                    });
                }

                if (
                    error instanceof Error &&
                    error.message ===
                    "Only the note owner can invite collaborators"
                ) {
                    return status(403, {
                        message:
                            "Only the note owner can invite collaborators",
                    });
                }

                throw error;
            }
        },
        {
            query: z.object({
                q: z.string().min(2),
                noteId: z.string().uuid(),
            }),

            response: {
                200: z.array(
                    z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                        image: z.string().nullable(),
                    })
                ),

                403: z.object({
                    message: z.string(),
                }),

                404: z.object({
                    message: z.string(),
                }),
            },
        }
    );


export default usersRoute;