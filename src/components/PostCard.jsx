// src/components/PostCard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import CommentBox from "./CommentBox";

export default function PostCard({ post }) {
  if (!post) return null;

  const [session, setSession] = useState(null);
  const [counts, setCounts] = useState({ like: 0, dislike: 0 });
  const [myReaction, setMyReaction] = useState(null);
  const [comments, setComments] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false); // tiny debounce for reactions

  // --- boot auth + listener
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data?.session ?? null);
      } catch {}
      const sub = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
      unsub = () => sub?.data?.subscription?.unsubscribe?.();
    })();
    return () => unsub();
  }, []);

  // --- initial pull (reactions + comments)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setErr("");

        // reactions
        const { data: r, error: rErr } = await supabase
          .from("reactions")
          .select("type,user_id")
          .eq("post_id", post.id);

        if (rErr) throw rErr;

        const likeCount = r?.filter((x) => x.type === "like").length || 0;
        const dislikeCount = r?.filter((x) => x.type === "dislike").length || 0;
        const me = r?.find((x) => x.user_id === session?.user?.id);

        // comments (includes display_name if you added that column)
        const { data: c, error: cErr } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", post.id)
          .order("created_at", { ascending: true });

        if (cErr) throw cErr;

        if (!cancelled) {
          setCounts({ like: likeCount, dislike: dislikeCount });
          setMyReaction(me?.type || null);
          setComments(c || []);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [post.id, session?.user?.id]);

  // --- realtime (new comments + any reactions change from others)
  useEffect(() => {
    const chan = supabase
      .channel(`post-${post.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${post.id}` },
        (payload) => setComments((cur) => [...cur, payload.new])
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions", filter: `post_id=eq.${post.id}` },
        async () => {
          try {
            const { data: r, error } = await supabase
              .from("reactions")
              .select("type,user_id")
              .eq("post_id", post.id);
            if (error) throw error;

            const likeCount = r?.filter((x) => x.type === "like").length || 0;
            const dislikeCount = r?.filter((x) => x.type === "dislike").length || 0;
            const me = r?.find((x) => x.user_id === session?.user?.id);
            setCounts({ like: likeCount, dislike: dislikeCount });
            setMyReaction(me?.type || null);
          } catch (e) {
            setErr(e.message || String(e));
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(chan);
      } catch {}
    };
  }, [post.id, session?.user?.id]);

  // --- optimistic reaction + pop anim + DB persist
  const react = async (type) => {
    if (!session) return alert("Sign in to react.");
    if (busy) return;
    setBusy(true);
    setErr("");

    // snapshot for rollback
    const prev = { counts, myReaction };

    // optimistic update
    let { like, dislike } = counts;
    let nextMy = myReaction;

    if (myReaction === type) {
      // toggle off
      nextMy = null;
      if (type === "like") like = Math.max(0, like - 1);
      else dislike = Math.max(0, dislike - 1);
    } else {
      // switch or set
      if (type === "like") like += 1;
      else dislike += 1;

      if (myReaction === "like") like = Math.max(0, like - 1);
      if (myReaction === "dislike") dislike = Math.max(0, dislike - 1);

      nextMy = type;
    }

    setCounts({ like, dislike });
    setMyReaction(nextMy);

    // tiny pop animation on the button
    const btn = document.getElementById(`${post.id}-${type}`);
    if (btn) {
      btn.classList.remove("btn-pop");
      // force reflow
      void btn.offsetWidth;
      btn.classList.add("btn-pop");
    }

    // persist to DB
    try {
      // ensure one reaction per user
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", session.user.id);

      if (nextMy) {
        const { error } = await supabase.from("reactions").insert({
          post_id: post.id,
          user_id: session.user.id,
          type: nextMy,
        });
        if (error) throw error;
      }
    } catch (e) {
      // rollback
      setCounts(prev.counts);
      setMyReaction(prev.myReaction);
      setErr(e.message || String(e));
    } finally {
      setTimeout(() => setBusy(false), 200);
    }
  };

  return (
    <div className="wall-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h3>{post.topic_title || "Untitled"}</h3>
        <small>{post.created_at ? new Date(post.created_at).toLocaleString() : ""}</small>
      </div>

      {post.question_prompt && (
        <p>
          <b>Prompt:</b> {post.question_prompt}
        </p>
      )}
      {post.ai_answer && (
        <p>
          <b>AI:</b> {post.ai_answer}
        </p>
      )}
      {post.critique && (
        <p>
          <b>Critique:</b> {post.critique}
        </p>
      )}
      {post.rewrite && (
        <p>
          <b>Rewrite:</b> {post.rewrite}
        </p>
      )}
      {post.display_name && <small>by {post.display_name}</small>}

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

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          id={`${post.id}-like`}
          onClick={() => react("like")}
          className={`btn ${myReaction === "like" ? "btn-primary" : ""}`}
          aria-pressed={myReaction === "like"}
          aria-label="Like"
        >
          👍 {counts.like}
        </button>
        <button
          id={`${post.id}-dislike`}
          onClick={() => react("dislike")}
          className={`btn ${myReaction === "dislike" ? "btn-primary" : ""}`}
          aria-pressed={myReaction === "dislike"}
          aria-label="Dislike"
        >
          👎 {counts.dislike}
        </button>
      </div>

      {/* Comments (expects CommentBox to insert display_name) */}
      <CommentBox postId={post.id} comments={comments} />
    </div>
  );
}
