// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState("email"); // 'email' | 'code'
  const [code, setCode] = useState("");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // 1) Send a one-time code to email (no redirect needed)
  const sendCode = async (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");
    setSending(true);

    // This sends an email with both a magic link AND a 6-digit code.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }, // create account if not exists
    });

    setSending(false);
    if (error) {
      setErr(error.message);
    } else {
      setInfo("We emailed you a 6-digit code. Enter it below.");
      setPhase("code");
    }
  };

  // 2) Verify the 6-digit code (no redirect)
  const verifyCode = async (e) => {
    e.preventDefault();
    setErr("");
    setVerifying(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email", // <— important: verify email OTP code
    });

    setVerifying(false);
    if (error) setErr(error.message);
    else setInfo("Signed in ✅");
  };

  // 3) Guest sign-in (anonymous)
  const signInGuest = async () => {
    setErr("");
    const { error } = await supabase.auth.signInAnonymously();
    if (error) setErr(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Already logged in?
  if (session) {
    return (
      <div style={{ maxWidth: 480, margin: "40px auto" }}>
        <h2>Logged in</h2>
        <p style={{ opacity: 0.8 }}>{session.user.email || "Guest user"}</p>
        <button className="btn btn-primary" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", display: "grid", gap: 18 }}>
      <h1>Sign in</h1>

      {/* Email → Code flow */}
      {phase === "email" && (
        <form onSubmit={sendCode} style={{ display: "grid", gap: 10 }}>
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button className="btn btn-primary" disabled={sending}>
            {sending ? "Sending…" : "Send 6-digit code"}
          </button>
        </form>
      )}

      {phase === "code" && (
        <form onSubmit={verifyCode} style={{ display: "grid", gap: 10 }}>
          <label>Enter 6-digit code</label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="••••••"
            autoFocus
          />
          <button className="btn btn-primary" disabled={verifying}>
            {verifying ? "Verifying…" : "Verify and sign in"}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPhase("email")}
          >
            ← Back to email
          </button>
        </form>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        <button className="btn btn-outline" onClick={signInGuest}>
          Continue as Guest
        </button>
        {info && <div style={{ color: "#a7f3d0" }}>{info}</div>}
        {err && <div style={{ color: "#fecaca" }}>{err}</div>}
      </div>
    </div>
  );
}
