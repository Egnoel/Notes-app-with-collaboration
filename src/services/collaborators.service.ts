import { db } from "@/db/client";
import { noteCollaborators } from "@/db/schema/notecollaborators";

import { notes } from "@/db/schema/notes";
import { users } from "@/db/schema/users";

import { and, eq } from "drizzle-orm";

export const getNoteCollaborators = async ({
  noteId,
  ownerId,
}: {
  noteId: string;
  ownerId: string;
}) => {
  // Verifica se a nota existe e pertence ao utilizador autenticado
  const [note] = await db
    .select({
      id: notes.id,
    })
    .from(notes)
    .where(
      and(
        eq(notes.id, noteId),
        eq(notes.ownerId, ownerId)
      )
    )
    .limit(1);

  if (!note) {
    throw new Error(
      "Note not found or you are not the owner"
    );
  }

  // Busca os colaboradores e os dados públicos dos users
  return db
    .select({
      id: noteCollaborators.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: noteCollaborators.role,
      createdAt: noteCollaborators.createdAt,
    })
    .from(noteCollaborators)
    .innerJoin(
      users,
      eq(
        noteCollaborators.userId,
        users.id
      )
    )
    .where(
      eq(
        noteCollaborators.noteId,
        noteId
      )
    );
};

export const removeCollaborator = async ({
  noteId,
  ownerId,
  collaboratorId,
}: {
  noteId: string;
  ownerId: string;
  collaboratorId: string;
}) => {
  // Verificar se a nota pertence ao owner
  const [note] = await db
    .select({
      id: notes.id,
    })
    .from(notes)
    .where(
      and(
        eq(notes.id, noteId),
        eq(notes.ownerId, ownerId)
      )
    )
    .limit(1);

  if (!note) {
    throw new Error(
      "Note not found or you are not the owner"
    );
  }

  // Remover o colaborador
  const deletedCollaborators = await db
    .delete(noteCollaborators)
    .where(
      and(
        eq(
          noteCollaborators.noteId,
          noteId
        ),
        eq(
          noteCollaborators.userId,
          collaboratorId
        )
      )
    )
    .returning({
      id: noteCollaborators.id,
    });

  if (deletedCollaborators.length === 0) {
    throw new Error(
      "Collaborator not found"
    );
  }

  return {
    message: "Collaborator removed successfully",
  };
};