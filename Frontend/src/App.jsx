import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [saveStatus, setSaveStatus] = useState("Saved");

  const activeNoteRef = useRef(null);
  const isDirtyRef = useRef(false);
  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    const res = await fetch(`${API_BASE}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access_token", data.access);
      setToken(data.access);
    } else {
      setAuthError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    flushUnsavedNote();
    localStorage.removeItem("access_token");
    setToken("");
    setNotes([]);
    setActiveNote(null);
  };

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/notes/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) handleLogout();
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setNotes(data);
          if (data.length > 0) {
            setActiveNote(data[0]);
            activeNoteRef.current = data[0];
          }
        }
      });
  }, [token]);

  const handleCreateNote = async () => {
    flushUnsavedNote();

    const res = await fetch(`${API_BASE}/notes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: "Untitled Note", content: "" }),
    });

    if (res.ok) {
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      setActiveNote(newNote);
      activeNoteRef.current = newNote;
      isDirtyRef.current = false;
      setSaveStatus("Saved");
    }
  };

  const handleEditorChange = (field, value) => {
    const updated = { ...activeNote, [field]: value };
    setActiveNote(updated);
    activeNoteRef.current = updated;
    isDirtyRef.current = true;
    setSaveStatus("Unsaved changes...");

    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
  };

  const saveNoteToDatabase = async (noteToSave, useKeepAlive = false) => {
    if (!noteToSave || !tokenRef.current) return;
    setSaveStatus("Saving...");

    await fetch(`${API_BASE}/notes/${noteToSave.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenRef.current}`,
      },
      body: JSON.stringify({
        title: noteToSave.title,
        content: noteToSave.content,
      }),
      keepalive: useKeepAlive,
    });

    isDirtyRef.current = false;
    setSaveStatus("Saved to Postgres");
  };

  const flushUnsavedNote = () => {
    if (isDirtyRef.current && activeNoteRef.current) {
      saveNoteToDatabase(activeNoteRef.current, true);
    }
  };

  // Auto-save 800ms after stopping typing
  useEffect(() => {
    if (!activeNote || !isDirtyRef.current) return;
    const timer = setTimeout(() => {
      saveNoteToDatabase(activeNote, false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeNote]);

  // Auto-save immediately if the user closes the tab or switches away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushUnsavedNote();
    };
    const handleBeforeUnload = () => flushUnsavedNote();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  if (!token) {
    return (
      <div style={{ maxWidth: "360px", margin: "5rem auto", fontFamily: "sans-serif" }}>
        <h2>Sign in to Notes</h2>
        {authError && <p style={{ color: "crimson" }}>{authError}</p>}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "8px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "8px" }}
          />
          <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
            Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <aside style={{ width: "260px", borderRight: "1px solid #ddd", padding: "1rem", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <button onClick={handleCreateNote} style={{ padding: "6px 12px", cursor: "pointer" }}>
            + New Note
          </button>
          <button onClick={handleLogout} style={{ padding: "6px 12px", cursor: "pointer" }}>
            Logout
          </button>
        </div>

        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => {
              flushUnsavedNote();
              setActiveNote(note);
              activeNoteRef.current = note;
              isDirtyRef.current = false;
            }}
            style={{
              padding: "10px",
              marginBottom: "8px",
              cursor: "pointer",
              borderRadius: "6px",
              background: activeNote?.id === note.id ? "#e8f0fe" : "#f9f9f9",
            }}
          >
            <strong style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {note.title || "Untitled"}
            </strong>
            <small style={{ color: "#666" }}>
              {note.content ? note.content.slice(0, 40) + "..." : "Empty note"}
            </small>
          </div>
        ))}
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "2rem" }}>
        {activeNote ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleEditorChange("title", e.target.value)}
                placeholder="Note Title..."
                style={{ fontSize: "1.5rem", fontWeight: "bold", border: "none", outline: "none", width: "75%" }}
              />
              <span style={{ fontSize: "0.85rem", color: "#666" }}>{saveStatus}</span>
            </div>

            <textarea
              value={activeNote.content}
              onChange={(e) => handleEditorChange("content", e.target.value)}
              placeholder="Start typing your note... It will save automatically."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: "1.05rem",
                lineHeight: "1.6",
              }}
            />
          </>
        ) : (
          <p style={{ color: "#666" }}>Click "+ New Note" to create your first note.</p>
        )}
      </main>
    </div>
  );
}