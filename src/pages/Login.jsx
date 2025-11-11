// src/pages/Login.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  // where the magic-link returns
  const redirectTo = useMemo(
    () => `${window.location.origin}/login`,
    []
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const sub = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.data.subscription.unsubscribe();
  }, []);

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

  async function signInGuest() {
    setErr("");
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) setErr(error.message);
    else setSession(data.session);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setSent(false);
    setEmail("");
  }

  // Already logged in
  if (session) {
    return (
      <div style={{ maxWidth: 520, margin: "40px auto" }}>
        <h2>You're signed in</h2>
        <p style={{ opacity: .8 }}>
          {session.user.email || "Guest (anonymous)"}<br/>
          User ID: <code>{session.user.id}</code>
        </p>
        <button className="btn btn-primary" onClick={signOut}>Sign out</button>
      </div>
    );
  }

  // Not logged in
  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <h2>Sign in</h2>

      <form onSubmit={sendMagicLink} style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width:"100%", padding:10, borderRadius:10 }}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Sending…" : "Send Magic Link"}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={signInGuest}>
          Continue as Guest
        </button>
      </div>

      {sent && (
        <p style={{ marginTop: 12, color: "#22c55e" }}>
          Check your inbox for the magic link.
        </p>
      )}
      {err && (
        <p style={{ marginTop: 12, color: "#ef4444" }}>
          {err}
        </p>
      )}
    </div>
  );
}
