"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Personal", "Ideas", "Tasks"] as const;
type Category = (typeof CATEGORIES)[number];
type CategoryFilter = "All" | Category;

type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  category?: Category | string;
  pinned?: boolean;
};

function isNote(value: unknown): value is Note {
  if (typeof value !== "object" || value === null) return false;

  const note = value as Record<string, unknown>;
  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.body === "string" &&
    typeof note.createdAt === "string"
  );
}

function getCategory(note: Note): Category {
  if (CATEGORIES.includes(note.category as Category)) return note.category as Category;
  if (note.category === "Celestial Spell") return "Ideas";
  if (note.category === "Memokeeper Codex") return "Tasks";
  return "Personal";
}

function formatDate(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "A moment ago";
  return new Intl.DateTimeFormat("en-CA").format(parsedDate);
}

export default function NotesPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      let email: string | null;
      try {
        email = sessionStorage.getItem("notely-user");
      } catch {
        setStorageError("Browser storage is unavailable. Please enable it to open your notes.");
        setIsLoading(false);
        return;
      }

      if (!email) {
        router.replace("/");
        return;
      }

      setUser(email);
      try {
        const savedNotes = localStorage.getItem(`notely-notes:${email}`);
        if (savedNotes) {
          const parsed: unknown = JSON.parse(savedNotes);
          if (!Array.isArray(parsed) || !parsed.every(isNote)) {
            throw new Error("Saved notes have an unexpected format.");
          }
          setNotes(parsed);
        }
      } catch {
        setStorageError("Your saved notes couldn’t be read. Browser storage may be unavailable or damaged.");
      }
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  function saveNotes(nextNotes: Note[]) {
    try {
      localStorage.setItem(`notely-notes:${user}`, JSON.stringify(nextNotes));
      setStorageError("");
      setNotes(nextNotes);
      return true;
    } catch {
      setStorageError("Your note could not be saved. Please check that browser storage is available.");
      return false;
    }
  }

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesQuery =
        !normalizedQuery ||
        note.title.toLowerCase().includes(normalizedQuery) ||
        note.body.toLowerCase().includes(normalizedQuery);
      const matchesCategory = filter === "All" || getCategory(note) === filter;
      return matchesQuery && matchesCategory;
    });
  }, [filter, notes, query]);

  function openComposer(note?: Note) {
    setEditingId(note?.id ?? null);
    setTitle(note?.title ?? "");
    setBody(note?.body ?? "");
    setCategory(note ? getCategory(note) : "Personal");
    setIsComposerOpen(true);
  }

  function closeComposer() {
    setIsComposerOpen(false);
    setEditingId(null);
    setTitle("");
    setBody("");
  }

  function handleSaveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody || storageError) return;

    const nextNotes = editingId
      ? notes.map((note) =>
          note.id === editingId ? { ...note, title: trimmedTitle, body: trimmedBody, category } : note,
        )
      : [
          {
            id: crypto.randomUUID(),
            title: trimmedTitle,
            body: trimmedBody,
            createdAt: new Date().toISOString(),
            category,
            pinned: false,
          },
          ...notes,
        ];

    if (saveNotes(nextNotes)) closeComposer();
  }

  function handleDeleteNote(noteId: string) {
    if (storageError) return;
    saveNotes(notes.filter((note) => note.id !== noteId));
  }

  function handleTogglePin(noteId: string) {
    if (storageError) return;
    saveNotes(notes.map((note) => note.id === noteId ? { ...note, pinned: !note.pinned } : note));
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem("notely-user");
    } catch {
      setStorageError("Could not clear your session. Please close this tab to finish signing out.");
      return;
    }
    router.replace("/");
  }

  if (isLoading) {
    return (
      <main className="loading-screen">
        <span className="loading-mark" aria-hidden="true">✦</span>
        <p>Opening your notes…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="loading-screen">
        {storageError ? <p className="storage-error">{storageError}</p> : <p>Returning to sign in…</p>}
      </main>
    );
  }

  return (
    <main className="grimoire-page">
      <aside className="grimoire-sidebar">
        <Link className="grimoire-brand" href="/notes" aria-label="Notes home">
          <span className="brand-book" aria-hidden="true">◈</span>
          <span>My<br />Notes</span>
        </Link>
        <p className="sidebar-heading">YOUR NOTES</p>
        <button
          aria-pressed={filter === "All"}
          className={`collection-link${filter === "All" ? " is-current" : ""}`}
          onClick={() => setFilter("All")}
          type="button"
        >
          <span aria-hidden="true">✧</span> All notes <span className="collection-count">{notes.length}</span>
        </button>
        <div className="sidebar-divider" />
        {CATEGORIES.map((item) => (
          <button
            aria-pressed={filter === item}
            className={`collection-link${filter === item ? " is-current" : ""}`}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            <span className={`collection-gem gem-${item.toLowerCase().replaceAll(" ", "-")}`} aria-hidden="true">✦</span>
            {item}
          </button>
        ))}
        <div className="sidebar-omen">
          <span aria-hidden="true">☾</span>
          <p>One thing at a time. You’ve got this.</p>
        </div>

        <div className="sidebar-profile">
          <span className="profile-orb" aria-hidden="true">{user.charAt(0).toUpperCase()}</span>
          <span className="profile-details">
            <strong>{user.split("@")[0]}</strong>
            <span>Personal account</span>
          </span>
          <button aria-label="Log out" className="sidebar-logout" onClick={handleLogout} type="button">↪</button>
        </div>
      </aside>

      <div className="grimoire-main">
        <header className="grimoire-header">
          <div className="grimoire-account">
            <span className="account-context">MY NOTES <span>/</span> ALL NOTES</span>
            <span className="account-email">Logged in as <strong>{user}</strong></span>
          </div>
        </header>

      <section className="grimoire-board" aria-label="Your notes">
        <div className="board-intro">
          <div>
            <span className="board-overline">YOUR NOTEBOOK</span>
            <h1>Your notes<span>.</span></h1>
            <p>Keep track of ideas, plans, and things to remember.</p>
          </div>
          <span className="board-constellation" aria-hidden="true">✧</span>
        </div>
        <div className="memory-toolbar">
          <label className="memory-search">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.8" cy="8.8" r="5.8" />
              <path d="m13.2 13.2 4 4" />
            </svg>
            <span className="visually-hidden">Search your notes</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your notes…"
              value={query}
            />
          </label>

          <div className="category-filters" aria-label="Filter notes by category">
            {(["All", ...CATEGORIES] as CategoryFilter[]).map((item) => (
              <button
                aria-pressed={filter === item}
                className={`category-filter${filter === item ? " is-active" : ""}`}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <button className="create-memory-button" onClick={() => openComposer()} type="button">
            <span aria-hidden="true">＋</span> New note
          </button>
        </div>

        {storageError && <p className="storage-error storage-error-banner" role="alert">{storageError}</p>}

        {visibleNotes.length ? (
          <div className="memory-grid">
            {visibleNotes.map((note) => {
              const noteCategory = getCategory(note);
              return (
                <article className={`memory-card ${noteCategory.toLowerCase().replaceAll(" ", "-")}`} key={note.id}>
                  <div className="memory-card-top">
                    <span className="memory-category">{noteCategory}</span>
                    <button
                      aria-label={`${note.pinned ? "Unpin" : "Pin"} ${note.title}`}
                      aria-pressed={Boolean(note.pinned)}
                      className={`pin-button${note.pinned ? " is-pinned" : ""}`}
                      onClick={() => handleTogglePin(note.id)}
                      type="button"
                    >
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M7 3.5h6l-.7 4 2.2 2v1H5.5v-1l2.2-2zM10 10.5v6" />
                      </svg>
                    </button>
                  </div>
                  <h2>{note.title}</h2>
                  <p className="memory-body">{note.body}</p>
                  <div className="memory-card-footer">
                    <time dateTime={note.createdAt}>{formatDate(note.createdAt)}</time>
                    <div className="memory-actions">
                      <button aria-label={`Edit ${note.title}`} onClick={() => openComposer(note)} type="button">
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                          <path d="m4 13.5-.8 3.3 3.3-.8L15.8 6.7a1.7 1.7 0 0 0-2.4-2.4zM12.2 5.5l2.4 2.4" />
                        </svg>
                      </button>
                      <button aria-label={`Delete ${note.title}`} onClick={() => handleDeleteNote(note.id)} type="button">
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M4 6h12M8 6V4h4v2m2 0-.7 10H6.7L6 6m2.5 3v4m3-4v4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grimoire-empty">
            <span aria-hidden="true">✧</span>
            <h2>{query || filter !== "All" ? "No notes found" : "No notes yet"}</h2>
            <p>
              {query || filter !== "All"
                ? "Try another search or category."
                : "Create a note and it’ll show up here."}
            </p>
          </div>
        )}
      </section>
      </div>

      {isComposerOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeComposer();
        }}>
          <section aria-labelledby="composer-title" aria-modal="true" className="memory-modal" role="dialog">
            <button aria-label="Close" className="modal-close" onClick={closeComposer} type="button">×</button>
            <span className="modal-kicker">YOUR NOTEBOOK</span>
            <h2 id="composer-title">{editingId ? "Edit note" : "Create a note"}</h2>
            <p className="modal-description">Write down a thought, idea, or reminder.</p>
            <form className="memory-form" onSubmit={handleSaveNote}>
              <label htmlFor="memory-title">Title</label>
              <input
                autoFocus
                id="memory-title"
                maxLength={80}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give your note a title"
                required
                value={title}
              />
              <label htmlFor="memory-category">Category</label>
              <select
                id="memory-category"
                onChange={(event) => setCategory(event.target.value as Category)}
                value={category}
              >
                {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
              <label htmlFor="memory-body">Note</label>
              <textarea
                id="memory-body"
                maxLength={1000}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write your note here…"
                required
                rows={5}
                value={body}
              />
              <button className="modal-save-button" disabled={!title.trim() || !body.trim() || Boolean(storageError)} type="submit">
                {editingId ? "Save changes" : "Save note"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
