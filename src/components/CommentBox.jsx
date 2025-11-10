// src/components/CommentBox.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CommentBox({ postId, comments = [] }) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!postId) return setErr("No post selected.");
    const text = body.trim();
    if (!text) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) return setErr("Please sign in to comment.");

    try {
      setSubmitting(true);
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: session.user.id,
        body: text,
      });
      if (error) return setErr(error.message);
      setBody("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "grid", gap: 8 }}>
        {comments.length > 0 ? (
          comments.map((c) => (
            <div
              key={c.id}
              style={{
                borderTop: "1px dashed rgba(255,255,255,.12)",
                paddingTop: 8,
              }}
            >
              <small style={{ opacity: 0.7 }}>
                {new Date(c.created_at).toLocaleString()}
              </small>
              <p style={{ margin: "6px 0" }}>{c.body}</p>
            </div>
          ))
        ) : (
          <small className="no-posts">Be the first to comment ✨</small>
        )}
      </div>

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

      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          aria-label="Add a comment"
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
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
