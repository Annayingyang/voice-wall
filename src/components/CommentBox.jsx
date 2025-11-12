// src/components/CommentBox.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CommentBox({ postId, comments = [] }) {
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // 🪶 Load saved display name from localStorage (so user doesn’t type it every time)
  useEffect(() => {
    const saved = localStorage.getItem("vw.display_name");
    if (saved) setName(saved);
  }, []);

  // 💬 Submit new comment
  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!postId) return setErr("No post selected.");
    const text = body.trim();
    if (!text) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) return setErr("Please sign in to comment.");

    const display_name = (name || "").trim() || "Guest";
    localStorage.setItem("vw.display_name", display_name);

    try {
      setSubmitting(true);
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: session.user.id,
        body: text,
        display_name, // 🧩 Include the name
      });

      if (error) return setErr(error.message);
      setBody("");
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Existing comments */}
      <div className="comment-list">
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="comment-item">
              <small>
                <b>{c.display_name || "Guest"}</b> •{" "}
                {new Date(c.created_at).toLocaleString()}
              </small>
              <p style={{ margin: "6px 0" }}>{c.body}</p>
            </div>
          ))
        ) : (
          <small className="no-posts">Be the first to comment ✨</small>
        )}
      </div>

      {/* Error banner */}
      {err && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 10px",
            borderRadius: 8,
            background: "rgba(239,68,68,.15)",
            border: "1px solid rgba(239,68,68,.35)",
            color: "#fecaca",
          }}
        >
          {err}
        </div>
      )}

      {/* Form */}
      <form onSubmit={submit} className="comment-form" style={{ marginTop: 12 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          aria-label="Your name"
          disabled={submitting}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.04)",
            color: "#e5e7eb",
          }}
        />
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          aria-label="Add a comment"
          disabled={submitting}
          style={{
            flex: 2,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.04)",
            color: "#e5e7eb",
          }}
        />
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
