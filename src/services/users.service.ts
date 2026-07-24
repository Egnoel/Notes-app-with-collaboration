import { db } from "@/db/client";
import { noteCollaborators } from "@/db/schema/notecollaborators";
import { notes } from "@/db/schema/notes";
import { users } from "@/db/schema/users";
import {
  and,
  eq,
  ilike,
  not,
  exists,
} from "drizzle-orm";


export const searchUsersForNoteInvite = async ({
  search,
  noteId,
  userId,
}: {
  search: string;
  noteId: string;
  userId: string;
}) => {
  // Verificar ownership da nota
  const [note] = await db
    .select({
      ownerId: notes.ownerId,
    })
    .from(notes)
    .where(eq(notes.id, noteId))
    .limit(1);

  if (!note) {
    throw new Error("Note not found");
  }

  if (note.ownerId !== userId) {
    throw new Error(
      "Only the note owner can invite collaborators"
    );
  }

  // Procurar users que:
  // - correspondem ao email
  // - não são o próprio user
  // - ainda não são colaboradores
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(
      and(
        ilike(users.email, `%${search}%`),
        not(eq(users.id, userId)),
        not(
          exists(
            db
              .select()
              .from(noteCollaborators)
              .where(
                and(
                  eq(
                    noteCollaborators.noteId,
                    noteId
                  ),
                  eq(
                    noteCollaborators.userId,
                    users.id
                  )
                )
              )
          )
        )
      )
    )
    .limit(10);
};