import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const [status, setStatus] = useState("Checking Supabase…");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.from("posts").select("*").limit(5);
        if (error) throw error;
        if (!cancelled) {
          setStatus("✅ Supabase connected!");
          setRows(data || []);
        }
      } catch (e) {
        if (!cancelled) setStatus("❌ Supabase error: " + e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "40px auto",
        fontFamily: "system-ui",
        color: "#e5e7eb",
        background: "#0b1222",
        padding: 24,
        borderRadius: 12,
      }}
    >
      <h1>Voice Wall — Connection Test</h1>
      <p>{status}</p>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <pre
          style={{
            background: "#111827",
            color: "#22c55e",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(rows, null, 2)}
        </pre>
      )}
    </div>
  );
}
