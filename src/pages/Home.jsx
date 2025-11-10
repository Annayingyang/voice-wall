// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useEffect } from "react";
import "../style/Home.css";

export default function Home() {
  // simple reveal-on-scroll for feature cards
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll(".feature").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="home">
      

      {/* HERO */}
      <section className="hero">
        {/* floating orbs */}
        <div className="orb orb-a" aria-hidden />
        <div className="orb orb-b" aria-hidden />

        <div className="hero-inner">
          <h1 className="hero-title">
            Challenge AI Bias with{" "}
            <span className="gradient-text">Your Own Voice</span>
          </h1>

          <p className="hero-sub">
            A living archive where people critique, rewrite, and reclaim AI
            outputs through local knowledge. Minimal friction. Maximum dignity.
          </p>

          <div className="cta-row">
            <Link to="/topics" className="btn btn-primary btn-lg">
              Start Rewriting
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign in to Post
            </Link>
          </div>

          <div className="glass-blurb">
            <span className="blurb-emoji">🪶</span>
            <span>
              “AI is a draft. You are the author.” — Add your rewrite to the public wall.
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div
          className="features-grid"
          // tiny progressive reveal handled by IntersectionObserver above
        >
          {[
            {
              title: "Epistemic Justice",
              copy:
                "See bias, name it, and replace it with situated knowledge from lived experience.",
              emoji: "⚖️",
            },
            {
              title: "Local First",
              copy:
                "Write in your voice, language, and tradition. Your context is the point.",
              emoji: "🌍",
            },
            {
              title: "Realtime Wall",
              copy:
                "Every post appears instantly for everyone. A chorus, not a dataset.",
              emoji: "🧱",
            },
            {
              title: "Open & Simple",
              copy:
                "No heavy UX. Just a clean path from prompt → critique → rewrite → publish.",
              emoji: "✨",
            },
          ].map((f) => (
            <article key={f.title} className="feature">
              <div className="feature-emoji">{f.emoji}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-copy">{f.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
