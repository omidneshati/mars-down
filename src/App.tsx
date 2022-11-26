import { FC, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { v4 as uuidV4 } from "uuid";
import { NoteData, RawNote, Tag } from "./types/form";
import useLocalStorage from "./hooks/useLocalStorage";

// -------- Pages --------
import NewNote from "./pages/NewNote";
import NoteList from "./pages/NoteList";
import NoteLayout from "./pages/NoteLayout";
import Note from "./pages/Note";
import EditNote from "./pages/EditNote";

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", []);
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", []);

  const noteWithTags = useMemo(() => {
    return notes.map((note) => {
      return {
        ...note,
        tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
      };
    });
  }, [notes, tags]);

  const onCreateNote = ({ tags, ...data }: NoteData) => {
    setNotes((pervNotes) => {
      return [
        ...pervNotes,
        { ...data, id: uuidV4(), tagIds: tags.map((tag) => tag.id) },
      ];
    });
  };

  const onUpdateNote = (id: string, { tags, ...data }: NoteData) => {
    setNotes((pervNotes) => {
      return pervNotes.map((note) => {
        if (note.id === id) {
          return { ...note, ...data, tagIds: tags.map((tag) => tag.id) };
        } else {
          return note;
        }
      });
    });
  };

  const onDeleteNote = (id: string) => {
    setNotes((pervNote) => {
      return pervNote.filter((note) => note.id !== id);
    });
  };

  const onAddTag = (tag: Tag) => {
    setTags((pervTag) => [...pervTag, tag]);
  };

  return (
    <Container className="my-4">
      <Routes>
        <Route
          path="/"
          element={<NoteList availableTags={tags} notes={noteWithTags} />}
        />
        <Route
          path="/new"
          element={
            <NewNote
              onSubmit={onCreateNote}
              onAddTag={onAddTag}
              availableTags={tags}
            />
          }
        />
        <Route path="/:id" element={<NoteLayout notes={noteWithTags} />}>
          <Route index element={<Note onDelete={onDeleteNote} />} />
          <Route
            path="edit"
            element={
              <EditNote
                onSubmit={onUpdateNote}
                // onDelete={onDeleteNote}
                onAddTag={onAddTag}
                availableTags={tags}
              />
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Container>
  );
}

export default App;
