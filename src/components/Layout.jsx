// src/components/Layout.jsx
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  const wrap = {minHeight:"100vh",display:"flex",flexDirection:"column",background:"#0b1222",color:"#e5e7eb",fontFamily:"system-ui,sans-serif"};
  const head = {display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,.1)",position:"sticky",top:0,background:"rgba(15,23,42,.85)",backdropFilter:"blur(6px)",zIndex:10};
  const nav  = {display:"flex",gap:12};
  const link = {color:"#e5e7eb",textDecoration:"none",fontWeight:600};
  const main = {flex:1};
  const foot = {padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,.1)",opacity:.9};

  return (
    <div style={wrap}>
      <header style={head}>
        <div style={{fontWeight:900,color:"#f472b6"}}>Whose Voice?</div>
        <nav style={nav}>
          <Link to="/" style={link}>Home</Link>
          <Link to="/topics" style={link}>Topics</Link>
          <Link to="/wall" style={link}>Wall</Link>
          <Link to="/login" style={link}>Login</Link>
        </nav>
      </header>

      <main style={main}>
        <Outlet /> {/* ← CHILD ROUTES RENDER HERE */}
      </main>

      <footer style={foot}>
        🪶 Built with care by <b>Anna</b> • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
