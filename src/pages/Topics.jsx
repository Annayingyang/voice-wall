// src/pages/Topics.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../style/Topics.css";

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data, error } = await supabase
          .from("topics")
          .select("*")
          .order("title", { ascending: true });
        if (error) throw error;
        if (!cancelled) setTopics(data || []);
      } catch (e) {
        if (!cancelled) setErr(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="topics-page">
      <div className="topics-wrap">
        <h1 className="page-title">Let Your Voice Be Heard</h1>
        <p className="page-sub">
          Choose a topic to challenge AI from your perspective.
        </p>

        {loading && <p className="page-sub">Loading topics…</p>}

        {err && (
          <p className="page-sub" style={{ color: "#fca5a5" }}>
            {err}
          </p>
        )}

        {!loading && !err && (
          <div className="chip-grid">
            {topics.length > 0 ? (
              topics.map((t) => (
                <Link
                  key={t.id}
                  to={`/topics/${t.slug}`}
                  className="topic-chip"
                >
                  <span className="chip-emoji">{t.emoji}</span> {t.title}
                </Link>
              ))
            ) : (
              <p className="page-sub" style={{ opacity: 0.8 }}>
                No topics available yet.
              </p>
            )}
          </div>
        )}

        <div className="goto-wall">
          <Link to="/wall" className="btn-secondary">
            🔎 View Wall of Reclaimed Prompts
          </Link>
        </div>
      </div>
    </div>
  );
}
