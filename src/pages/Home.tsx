import { useState, type FormEvent } from "react";
import { ArrowRight, Link, Gamepad2, ShieldCheck, Users } from "lucide-react";
import { readableError } from "../utils/errors";

type Props = { inviteCode?: string; onEnter: (code: string) => void };
const CODE = /^[A-HJ-NP-Z2-9]{5}$/;

export default function Home({ inviteCode, onEnter }: Props) {
  const [name, setName] = useState(localStorage.getItem("trix.playerName") || "");
  const [roomCode, setRoomCode] = useState(inviteCode || "");
  const [mode, setMode] = useState<"create" | "join">(inviteCode ? "join" : "create");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2 || name.trim().length > 20) return;
    if (mode === "join" && !CODE.test(roomCode)) return;
    setBusy(true);
    setError("");
    try {
      const { createRoom, joinRoom } = await import("../firebase/api");
      const result = mode === "create" ? await createRoom(name.trim()) : await joinRoom(roomCode, name.trim());
      localStorage.setItem("trix.playerName", name.trim());
      onEnter(result.code);
    } catch (cause) {
      setError(readableError(cause));
    } finally {
      setBusy(false);
    }
  }

  return <main className={`landing shell ${inviteCode ? "invited" : ""}`}>
    <header className="topbar"><a className="brand" href="/" aria-label="TRIX home"><span className="brand-mark">✳</span> TRIX</a><span className="topbar-note"><span className="online-dot" /> LIVE MULTIPLAYER</span></header>
    <div className="landing-grid">
      <section className="hero">
        <div className="eyebrow">A LITTLE FRIENDLY COMPETITION</div>
        <h1>Small squares.<br /><span>Big possibilities.</span></h1>
        <p className="hero-copy">Your next great rivalry starts here. Challenge a friend to tic tac toe with a nine-board twist.</p>
        <div className="hero-points"><span><Users size={16} /> Just you two</span><span><Link size={16} /> One invite away</span></div>
        <div className="lobby-preview">
          <div className="preview-arena" aria-hidden="true">{Array.from({ length: 9 }, (_, board) => {
            const winner = board === 0 ? "X" : board === 4 ? "O" : null;
            return <div className={`preview-mini ${winner ? "preview-claimed " + winner.toLowerCase() : ""} ${board === 8 ? "preview-active" : ""}`} key={board}>
              {winner || Array.from({ length: 9 }, (_, cell) => {
                const mark = (board * 7 + cell) % 5 === 0 ? "X" : (board * 3 + cell) % 7 === 0 ? "O" : "";
                return <span className={mark.toLowerCase()} key={cell}>{mark}</span>;
              })}
            </div>;
          })}</div>
          <div className="preview-copy"><span className="section-kicker">THE NINE-BOARD TWIST</span><strong>A small move.<br />A whole new game.</strong><p>Win the little boards.<br />Think about the big picture.</p><div className="preview-key"><span><b className="x">X</b> You</span><span><b className="o">O</b> A rival</span></div></div>
        </div>
      </section>

      <section className="entry-card" aria-label="Start a match">
        <div className="entry-heading"><div><span className="section-kicker">LET’S PLAY</span><h2>{inviteCode ? "You're invited." : "Make your move."}</h2></div><div className="entry-icon"><Gamepad2 size={24} /></div></div>
        {inviteCode && <div className="invite-banner">Invitation to room <strong>{inviteCode}</strong></div>}
        {!inviteCode && <div className="segmented" role="group" aria-label="Match option"><button type="button" aria-pressed={mode === "create"} className={mode === "create" ? "selected" : ""} onClick={() => { setMode("create"); setError(""); }}>Create room</button><button type="button" aria-pressed={mode === "join"} className={mode === "join" ? "selected" : ""} onClick={() => { setMode("join"); setError(""); }}>Join room</button></div>}
        <form onSubmit={submit}>
          <label htmlFor="player-name">Your name</label>
          <input id="player-name" autoComplete="nickname" placeholder="What should we call you?" minLength={2} maxLength={20} required aria-describedby="name-hint" value={name} onChange={(event) => setName(event.target.value)} />
          <p className="field-hint" id="name-hint">Pick a name your friend will recognize. 2–20 characters.</p>
          {mode === "join" && !inviteCode && <><label htmlFor="room-code">Room code</label><input id="room-code" inputMode="text" autoComplete="off" autoCapitalize="characters" placeholder="ABCDE" maxLength={5} value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""))} aria-describedby="code-hint" /><p className="field-hint" id="code-hint">Enter the five-character code from your friend.</p></>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button primary entry-submit" disabled={busy || name.trim().length < 2 || (mode === "join" && !CODE.test(roomCode))}>{busy ? "Connecting…" : mode === "create" ? "Create a room" : "Join the match"}<ArrowRight size={18} /></button>
        </form>
        <p className="entry-foot"><ShieldCheck size={14} /> No sign-up. No downloads. Just a good game.</p>
      </section>
    </div>
    {!inviteCode && <section className="quick-rules" aria-label="How to play">
      <div className="quick-rule"><span className="rule-number">01</span><div><h3>Choose your square</h3><p>Your square sends your friend to the matching mini-board.</p></div></div>
      <div className="quick-rule"><span className="rule-number">02</span><div><h3>Claim a little victory</h3><p>Get three in a row to claim a mini-board as your own.</p></div></div>
      <div className="quick-rule"><span className="rule-number">03</span><div><h3>Win the bigger game</h3><p>Claim three mini-boards in a row. Then call for a rematch.</p></div></div>
    </section>}
    <footer className="landing-footer"><span>TRIX · Ultimate tic tac toe</span><span>A little strategy. A lot of “one more round.”</span></footer>
  </main>;
}
