import { lazy, Suspense, useEffect, useState } from "react";
import Home from "./pages/Home";
import { firebaseConfigError } from "./firebase/config";

const Game = lazy(() => import("./pages/Game"));

function currentRoute(): { kind: "home" | "join" | "room"; code?: string } {
  const match = location.pathname.match(/^\/(join|room)\/([A-HJ-NP-Z2-9]{5})\/?$/i);
  if (match) return { kind: match[1].toLowerCase() as "join" | "room", code: match[2].toUpperCase() };
  const legacy = new URLSearchParams(location.search).get("room");
  if (legacy) return { kind: "join", code: legacy.toUpperCase() };
  return { kind: "home" };
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const update = () => setRoute(currentRoute());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  useEffect(() => {
    if (route.kind !== "room" || authReady) return;
    let active = true;
    import("./firebase/api")
      .then(({ getGuest }) => getGuest())
      .then(() => { if (active) setAuthReady(true); }, (error) => { if (active) setAuthError(error.message); });
    return () => { active = false; };
  }, [route.kind, authReady]);

  function navigate(path: string) {
    history.pushState(null, "", path);
    setRoute(currentRoute());
  }

  function enterRoom(code: string) {
    setAuthReady(true);
    navigate(`/room/${code}`);
  }

  function goHome() {
    setAuthError("");
    navigate("/");
  }

  if (firebaseConfigError) return <main className="center-screen"><div className="card"><h1>Firebase setup required</h1><p>{firebaseConfigError}</p></div></main>;
  if (authError) return <main className="center-screen"><div className="card"><h1>Connection unavailable</h1><p>{authError}</p><button className="button primary" onClick={() => location.reload()}>Try again</button></div></main>;
  if (!authReady && route.kind === "room") return <main className="center-screen"><p>Connecting to TRIX…</p></main>;

  if (route.kind === "room" && route.code) return <Suspense fallback={<main className="center-screen"><p>Opening room…</p></main>}><Game code={route.code} onLeave={goHome} /></Suspense>;
  return <Home inviteCode={route.kind === "join" ? route.code : undefined} onEnter={enterRoom} />;
}
