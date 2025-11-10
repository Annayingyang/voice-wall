// src/pages/Answer.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../style/Answer.css";

export default function Answer() {
  const { questionId } = useParams();
  const nav = useNavigate();

  // session
  const [session, setSession] = useState(null);

  // data
  const [topic, setTopic] = useState(null);
  const [question, setQuestion] = useState(null);

  // form
  const [ai, setAi] = useState("");
  const [critique, setCritique] = useState("");
  const [rewrite, setRewrite] = useState("");
  const [name, setName] = useState("");

  // ui
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // auth + fetch
  useEffect(() => {
    let cancelled = false;

    // hydrate session + listener
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSession(data.session);
    });
    const sub = supabase.auth.onAuthStateChange((_e, s) => {
      if (!cancelled) setSession(s);
    });

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) pull question
        const { data: q, error: qErr } = await supabase
          .from("questions")
          .select("*")
          .eq("id", questionId)
          .single();
        if (qErr) throw qErr;
        if (!q) throw new Error("Question not found");

        if (!cancelled) {
          setQuestion(q);
          // if you ever add an 'ai_answer' column to questions, this will hydrate it
          setAi(q.ai_answer ?? "");
        }

        // 2) pull topic for breadcrumb
        const { data: t, error: tErr } = await supabase
          .from("topics")
          .select("*")
          .eq("id", q.topic_id)
          .single();
        if (tErr) throw tErr;
        if (!cancelled) setTopic(t);
      } catch (e) {
        if (!cancelled) setErr(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      sub?.data?.subscription?.unsubscribe?.();
    };
  }, [questionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: sData } = await supabase.auth.getSession();
      const sess = session ?? sData?.session;
      if (!sess) {
        alert("Please sign in first (Login page).");
        setSubmitting(false);
        return;
      }

      const rewriteText = (rewrite ?? "").trim();
      if (!rewriteText) {
        alert("Please write your rewrite before submitting ✨");
        setSubmitting(false);
        return;
      }
      if (rewriteText.length > 4000) {
        alert("Rewrite is too long (max 4000 chars).");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: sess.user.id,
        topic_id: topic?.id ?? null,
        question_id: question?.id ?? null,
        topic_title: topic?.title ?? null,
        question_prompt: question?.prompt ?? null,
        ai_answer: (ai ?? "").trim() || null,
        critique: (critique ?? "").trim() || null,
        rewrite: rewriteText,
        display_name: (name ?? "").trim() || null,
      });
      if (error) throw error;

      nav("/wall?posted=1");
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  // UI states
  if (loading) {
    return (
      <div className="answer-page">
        <div className="answer-wrap">
          <h1 className="page-title">Loading…</h1>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="answer-page">
        <div className="answer-wrap">
          <h1 className="page-title">Oops</h1>
          <p className="page-sub" style={{ color: "#fca5a5" }}>{err}</p>
          <Link to="/topics" className="btn-secondary">← Back to Topics</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="answer-page">
      <div className="answer-wrap">
        <h1 className="page-title">{topic?.title}</h1>
        <p className="page-sub">{question?.prompt}</p>

        {ai && (
          <div className="ai-card">
            <h3>AI’s Draft</h3>
            <p>{ai}</p>
          </div>
        )}

        <form className="answer-form" onSubmit={handleSubmit}>
          <label>
            <span>Your Critique</span>
            <textarea
              rows={4}
              value={critique}
              onChange={(e) => setCritique(e.target.value)}
              placeholder="What is missing? What's inaccurate?"
            />
          </label>

          <label>
            <span>Your Rewrite (required)</span>
            <textarea
              rows={6}
              required
              value={rewrite}
              onChange={(e) => setRewrite(e.target.value)}
              placeholder="Write your version here…"
            />
          </label>

          <label>
            <span>Your Name (optional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. A. Mabaso"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Response"}
          </button>
          <div style={{ marginTop: 10 }}>
            <Link to={`/topics/${topic?.slug}`} className="btn-secondary">← Back</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
