import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useLocation } from "react-router-dom";
import "../style/Wall.css";
import PostCard from "../components/PostCard";

export default function Wall() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const location = useLocation();
  const justPosted = new URLSearchParams(location.search).get("posted") === "1";

  // helper: dedupe by id
  const upsertHead = (arr, item) => {
    const map = new Map(arr.map(p => [p.id, p]));
    map.set(item.id, item);
    // newest first
    return [...map.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const fetchPosts = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")   // TIP: later switch to explicit columns for perf
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(100);
      if (error) throw error;
      setPosts(data ?? []);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // realtime: insert new posts at the top; refetch on update/delete
  useEffect(() => {
    const channel = supabase
      .channel("posts-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => setPosts((p) => upsertHead(p, payload.new))
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        /* ignore */
      }
    };
  }, []);

  return (
    <div className="wall-page">
      <div className="wall-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h1 className="wall-title">Wall of Rewrites</h1>
          <Link to="/topics" className="btn btn-primary">+ Start Rewriting</Link>
        </div>

        {justPosted && (
          <div
            style={{
              margin: "0 0 16px",
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(34,197,94,.15)",
              border: "1px solid rgba(34,197,94,.35)",
              color: "#d1fae5",
            }}
          >
            ✨ Posted! Your rewrite is live on the wall.
          </div>
        )}

        {err && (
          <div
            style={{
              margin: "0 0 16px",
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(239,68,68,.15)",
              border: "1px solid rgba(239,68,68,.35)",
              color: "#fecaca",
            }}
          >
            {err}
          </div>
        )}

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="wall-posts">
            {posts.length > 0 ? (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <p className="no-posts">No posts yet — be the first 🌸</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
