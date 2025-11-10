// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // hydrate session + listen for changes
  useEffect(() => {
    let unsub = () => {};
    supabase.auth.getSession().then(({ data }) => setSession(data?.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    unsub = () => sub?.subscription?.unsubscribe?.();
    return () => unsub();
  }, []);

  // use current origin for redirect (works locally & after deploy)
  const redirectTo = `${window.location.origin}/login`;

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setErr("");
    setSent(false);

    const cleaned = email.trim();
    if (!cleaned) {
      setErr("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: cleaned,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setErr("");
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    setErr("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (e) {
      setErr(e.message || String(e));
    }
  };

  if (session) {
    return (
      <div style={{ maxWidth: 480, margin: "40px auto" }}>
        <h2 style={{ margin: 0 }}>Logged in</h2>
        <p style={{ opacity: 0.9 }}>{session.user.email}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={sendMagicLink} style={{ maxWidth: 480, margin: "40px auto" }}>
      <h2 style={{ margin: 0 }}>Login</h2>
      <p style={{ opacity: 0.8 }}>We’ll email you a magic link.</p>

      <input
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setSent(false);
          setErr("");
        }}
        placeholder="you@example.com"
        style={{ width: "100%", padding: 10, margin: "12px 0" }}
        disabled={loading}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button disabled={loading} type="submit">
          {loading ? "Sending…" : "Send magic link"}
        </button>
        <button type="button" onClick={signInWithGoogle} disabled={loading}>
          Continue with Google
        </button>
      </div>

      {sent && <p style={{ color: "#a7f3d0" }}>Check your inbox for the magic link.</p>}
      {err && (
        <p style={{ color: "#fecaca", marginTop: 8 }}>
          {err}
        </p>
      )}
    </form>
  );
}
