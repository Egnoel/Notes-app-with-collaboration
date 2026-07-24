import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { getNoteCollaborators, removeCollaborator } from "@/services/collaborators.service";
import { createNotes, deleteNoteById, getAllNotes, getNoteById, updateNoteById, addCollaborator } from "@/services/notes.service";
import { Elysia } from "elysia";
import { z } from "zod";

const notesRoute = new Elysia({
  prefix: "/notes",
})
  .use(betterAuthPlugin)
  .guard({
    auth: true,
  })
  .get("/", async ({ user }) => {
    return await getAllNotes(user);

  }, {
    response: {
      200: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          ownerId: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      ),
    }
  })
  .post("/", async ({ body, user }) => {
    const response = await createNotes(body, user)
    return response
  }, {
    body: z.object({
      title: z.string(),
      content: z.string(),
    }),
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  })
  .get("/:id", ({ params, user }) => {
    const noteId = params.id;
    return getNoteById(noteId, user);
  }, {
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        ownerId: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    },
  })
  .post(
    "/:noteId/collaborators",
    async ({ params, body, user, status }) => {
      try {
        const collaborator = await addCollaborator({
          noteId: params.noteId,
          ownerId: user.id,
          collaboratorId: body.userId,
          role: body.role,
        });

        return status(201, collaborator);
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        if (
          error.message ===
          "Note not found or you are not the owner"
        ) {
          return status(404, {
            message: error.message,
          });
        }

        if (
          error.message === "User not found"
        ) {
          return status(404, {
            message: error.message,
          });
        }

        if (
          error.message ===
          "The owner cannot be added as a collaborator"
        ) {
          return status(400, {
            message: error.message,
          });
        }

        if (
          error.message ===
          "User is already a collaborator"
        ) {
          return status(409, {
            message: error.message,
          });
        }

        throw error;
      }
    },
    {
      params: z.object({
        noteId: z.uuid(),
      }),

      body: z.object({
        userId: z.uuid(),
        role: z.enum([
          "viewer",
          "editor",
        ]),
      }),

      response: {
        201: z.object({
          id: z.uuid(),
          noteId: z.uuid(),
          userId: z.uuid(),
          role: z.enum([
            "viewer",
            "editor",
          ]),
          createdAt: z.date(),
        }),

        400: z.object({
          message: z.string(),
        }),

        404: z.object({
          message: z.string(),
        }),

        409: z.object({
          message: z.string(),
        }),
      },
    }
  )
  .put("/:id", async ({ params, body, user }) => {
    const noteId = params.id;
    return await updateNoteById(noteId, body, user);
  }, {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      title: z.string().optional(),
      content: z.string().optional(),
    }),
    response: {
      200: z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        ownerId: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    },
  })
  .delete("/:id", async ({ params, user }) => {
    const noteId = params.id;
    return await deleteNoteById(noteId, user);
  }, {
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  })
  // GET /notes/:noteId/collaborators
  .get(
    "/:noteId/collaborators",
    async ({ params, user, status }) => {
      try {
        return await getNoteCollaborators({
          noteId: params.noteId,
          ownerId: user.id,
        });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message ===
          "Note not found or you are not the owner"
        ) {
          return status(404, {
            message: error.message,
          });
        }

        throw error;
      }
    },
    {
      params: z.object({
        noteId: z.string().uuid(),
      }),

      response: {
        200: z.array(
          z.object({
            id: z.string().uuid(),
            userId: z.string().uuid(),
            name: z.string(),
            email: z.string(),
            image: z.string().nullable(),
            role: z.enum([
              "viewer",
              "editor",
            ]),
            createdAt: z.date(),
          })
        ),

        404: z.object({
          message: z.string(),
        }),
      },
    }
  )

  // DELETE /notes/:noteId/collaborators/:userId
  .delete(
    "/:noteId/collaborators/:userId",
    async ({ params, user, status }) => {
      try {
        return await removeCollaborator({
          noteId: params.noteId,
          ownerId: user.id,
          collaboratorId: params.userId,
        });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message ===
          "Note not found or you are not the owner"
        ) {
          return status(404, {
            message: error.message,
          });
        }

        if (
          error instanceof Error &&
          error.message ===
          "Collaborator not found"
        ) {
          return status(404, {
            message: error.message,
          });
        }

        throw error;
      }
    },
    {
      params: z.object({
        noteId: z.string().uuid(),
        userId: z.string().uuid(),
      }),

      response: {
        200: z.object({
          message: z.string(),
        }),

        404: z.object({
          message: z.string(),
        }),
      },
    }
  );

export default notesRoute;