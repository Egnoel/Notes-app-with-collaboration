
import { db } from "@/db/client";
import { noteCollaborators } from "@/db/schema/notecollaborators";
import { notes } from "@/db/schema/notes";
import { users } from "@/db/schema/users";
import { and, eq } from "drizzle-orm";



export const createNotes = async (body: { title: string; content: string; }, user: { id: string; }) => {

    const [note] = await db
        .insert(notes)
        .values({
            title: body.title,
            content: body.content,
            ownerId: user.id,
        })
        .returning();

    return {
        message: `Note created with ID: ${note.id}`,
    };
}

export const getAllNotes = async (user: { id: string }) => {
    const allNotes = await db
        .select()
        .from(notes)
        .where(eq(notes.ownerId, user.id));
    return allNotes;
}

export const getNoteById = async (noteId: string, user: { id: string }) => {
    const note = await db
        .select()
        .from(notes)
        .where(eq(notes.id, noteId))
        .limit(1);

    if (!note.length) {
        throw new Error("Note not found");
    }

    if (note[0].ownerId !== user.id) {
        throw new Error("Access denied");
    }

    return note[0];
}

export const updateNoteById = async (noteId: string, body: { title?: string; content?: string; }, user: { id: string }) => {
    const note = await db
        .select()
        .from(notes)
        .where(eq(notes.id, noteId))
        .limit(1);

    if (!note.length) {
        throw new Error("Note not found");
    }

    if (note[0].ownerId !== user.id) {
        throw new Error("Access denied");
    }

    const updatedNote = await db
        .update(notes)
        .set({
            title: body.title ?? note[0].title,
            content: body.content ?? note[0].content,
            updatedAt: new Date(),
        })
        .where(eq(notes.id, noteId))
        .returning();

    return updatedNote[0];
}

export const deleteNoteById = async (noteId: string, user: { id: string }) => {
    const note = await db
        .select()
        .from(notes)
        .where(eq(notes.id, noteId))
        .limit(1);

    if (!note.length) {
        throw new Error("Note not found");
    }
    if (note[0].ownerId !== user.id) {
        throw new Error("Access denied");
    }

    await db
        .delete(notes)
        .where(eq(notes.id, noteId));

    return {
        message: `Note with ID: ${noteId} deleted`,
    };
}

export const addCollaborator = async ({
    noteId,
    ownerId,
    collaboratorId,
    role,
}: {
    noteId: string;
    ownerId: string;
    collaboratorId: string;
    role: "viewer" | "editor";
}) => {
    // 1. Verificar se a nota existe e pertence ao utilizador autenticado
    const [note] = await db
        .select({
            id: notes.id,
            ownerId: notes.ownerId,
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

    // 2. Verificar se o utilizador que será convidado existe
    const [user] = await db
        .select({
            id: users.id,
        })
        .from(users)
        .where(eq(users.id, collaboratorId))
        .limit(1);

    if (!user) {
        throw new Error("User not found");
    }

    // 3. Impedir que o owner seja adicionado como collaborator
    if (ownerId === collaboratorId) {
        throw new Error(
            "The owner cannot be added as a collaborator"
        );
    }

    // 4. Verificar se já é colaborador
    const [existingCollaborator] = await db
        .select({
            id: noteCollaborators.id,
        })
        .from(noteCollaborators)
        .where(
            and(
                eq(noteCollaborators.noteId, noteId),
                eq(noteCollaborators.userId, collaboratorId)
            )
        )
        .limit(1);

    if (existingCollaborator) {
        throw new Error(
            "User is already a collaborator"
        );
    }

    // 5. Criar o collaborator
    const [collaborator] = await db
        .insert(noteCollaborators)
        .values({
            noteId,
            userId: collaboratorId,
            role,
        })
        .returning();

    return collaborator;
};