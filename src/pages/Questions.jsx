// src/pages/Questions.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../style/Questions.css";

export default function Questions() {
  const { slug } = useParams();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) fetch topic by slug
        const { data: t, error: tErr } = await supabase
          .from("topics")
          .select("*")
          .eq("slug", slug)
          .single();
        if (tErr) throw tErr;
        if (!cancelled) setTopic(t);

        // 2) fetch that topic’s questions
        const { data: q, error: qErr } = await supabase
          .from("questions")
          .select("*")
          .eq("topic_id", t.id)
          .order("id", { ascending: true });

        if (qErr) throw qErr;
        if (!cancelled) setQuestions(q || []);
      } catch (e) {
        if (!cancelled) setErr(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="questions-page">
      <div className="questions-wrap">
        <h1 className="page-title">{topic ? topic.title : "Questions"}</h1>
        <p className="page-sub">
          {topic ? `Choose a question under ${topic.title} to challenge the AI.` : "Loading…"}
        </p>

        {err && (
          <p className="page-sub" style={{ color: "#fca5a5" }}>
            {err}
          </p>
        )}

        {loading ? (
          <p className="page-sub">Loading questions…</p>
        ) : questions.length > 0 ? (
          <div className="question-list">
            {questions.map((q) => (
              <Link key={q.id} to={`/answer/${q.id}`} className="question-item">
                {q.prompt}
              </Link>
            ))}
          </div>
        ) : (
          <p className="page-sub" style={{ opacity: 0.8 }}>
            No questions for this topic yet.
          </p>
        )}

        <div className="back-row" style={{ marginTop: 24 }}>
          <Link to="/topics" className="btn-secondary">← Back to Topics</Link>
        </div>
      </div>
    </div>
  );
}
