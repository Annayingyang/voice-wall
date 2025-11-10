// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  // keep session in sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- Actions --------------------------------------------------------------

  const redirectTo = `${window.location.origin}/login`;

  async function signInWithGoogle() {
    setErr("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }, // works for localhost and vercel
    });
    if (error) setErr(error.message);
  }

  async function sendMagicLink(e) {
    e.preventDefault();
    setErr("");
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setSending(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  async function signOut() {
    setErr("");
    const { error } = await supabase.auth.signOut();
    if (error) setErr(error.message);
    else nav("/");
  }

  // ---- UI -------------------------------------------------------------------

  if (session) {
    return (
      <div style={{ maxWidth: 520, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>You’re signed in ✅</h1>
        <p style={{ opacity: 0.8, marginBottom: 16 }}>{session.user.email}</p>
        {err && (
          <div style={{ marginBottom: 12, color: "#fecaca" }}>
            {err}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" to="/topics">Start Rewriting</Link>
          <Link className="btn btn-ghost" to="/wall">View Wall</Link>
          <button className="btn btn-outline" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>Login</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Sign in with Google or get a magic link by email.
      </p>

      {err && (
        <div style={{
          marginBottom: 14,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(248,113,113,.35)",
          background: "rgba(248,113,113,.12)",
          color: "#fecaca"
        }}>
          {err}
        </div>
      )}

      {/* Google */}
      <button onClick={signInWithGoogle} className="btn btn-primary" style={{ width: "100%", marginBottom: 14 }}>
        Continue with Google
      </button>

      <div style={{ textAlign: "center", opacity: 0.6, margin: "10px 0" }}>or</div>

      {/* Magic link */}
      <form onSubmit={sendMagicLink}>
        <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
          Email address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.03)",
            color: "#e5e7eb",
            marginBottom: 12,
          }}
        />
        <button className="btn btn-outline" type="submit" disabled={sending} style={{ width: "100%" }}>
          {sending ? "Sending…" : "Send magic link"}
        </button>
      </form>

      {sent && (
        <p style={{ marginTop: 12, color: "#86efac" }}>
          Check your inbox for the magic link. You can close this tab.
        </p>
      )}

      <div style={{ marginTop: 20, opacity: 0.7 }}>
        <small>
          Redirect URL used: <code>{redirectTo}</code>
        </small>
      </div>
    </div>
  );
}
