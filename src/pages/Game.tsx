import { useEffect, useState } from "react";
import { Check, Copy, LogOut, RotateCcw, Share2, Users, WifiOff } from "lucide-react";
import Board from "../components/Board";
import { auth } from "../firebase/config";
import { leaveRoom, playMove, reconnectToRoom, subscribeRoom, voteRematch } from "../firebase/api";
import { readableError } from "../utils/errors";
import { playClick, playJoin, playWin } from "../utils/sound";
import type { Player, Room } from "../types/game";

type Props = { code: string; onLeave: () => void };

export default function Game({ code, onLeave }: Props) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(0);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsubscribe = subscribeRoom(code, (next) => {
      setRoom(next);
      setLoading(false);
      setClosed(!next);
    }, (cause) => {
      setError(readableError(cause));
      setLoading(false);
      if ("code" in cause && (cause.code === "permission-denied" || cause.code === "not-found")) {
        setRoom(null);
        setClosed(true);
      }
    });
    const heartbeat = () => reconnectToRoom(code).catch(() => {});
    heartbeat();
    const heartbeatTimer = window.setInterval(heartbeat, 20_000);
    const initialClock = window.setTimeout(() => setNow(Date.now()), 0);
    const clockTimer = window.setInterval(() => setNow(Date.now()), 5_000);
    const connectivity = () => setOnline(navigator.onLine);
    window.addEventListener("online", connectivity);
    window.addEventListener("offline", connectivity);
    return () => { unsubscribe(); clearTimeout(initialClock); clearInterval(heartbeatTimer); clearInterval(clockTimer); window.removeEventListener("online", connectivity); window.removeEventListener("offline", connectivity); };
  }, [code]);

  useEffect(() => {
    if (room?.status === "playing" && room.game.moveCount === 0) playJoin();
    if (room?.status === "finished") playWin();
  }, [room?.status, room?.round, room?.game.moveCount]);

  const side: Player | null = room?.players.X.uid === auth.currentUser?.uid ? "X" : room?.players.O?.uid === auth.currentUser?.uid ? "O" : null;
  const opponent = side === "X" ? room?.players.O : room?.players.X;
  const opponentAway = !!opponent && now - opponent.lastSeenAt > 45_000;
  const myTurn = room?.status === "playing" && room.game.currentPlayer === side;
  const hasVoted = !!side && !!room?.rematchVotes[side];
  const inviteUrl = `${location.origin}/join/${code}`;

  async function act(action: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await action(); } catch (cause) { setError(readableError(cause)); } finally { setBusy(false); }
  }

  function move(board: number, cell: number) {
    if (busy || !myTurn) return;
    playClick();
    void act(() => playMove(code, board, cell));
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: "Join me on TRIX", text: `Join my match: ${code}`, url: inviteUrl });
      else { await navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError("Could not share the invite. You can send the room code instead.");
    }
  }

  function exit() {
    void act(async () => { await leaveRoom(code); onLeave(); });
  }

  if (loading) return <main className="center-screen"><p>Opening room {code}…</p></main>;
  if (closed || !room || !side) return <main className="center-screen"><div className="card empty-state"><WifiOff size={36} /><h1>Room unavailable</h1><p>{error || "The match has ended or your place in it is no longer available."}</p><button className="button primary" onClick={onLeave}>Return home</button></div></main>;

  const winnerName = room.game.winner === "X" ? room.players.X.name : room.game.winner === "O" ? room.players.O?.name || "" : "";
  const instruction = room.game.activeBoard === null ? "Choose any open board" : `Play in board ${room.game.activeBoard + 1}`;
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { setError("Could not copy the code. You can select and copy it manually."); }
  };

  return <main className="game-shell shell">
    <header className="game-masthead">
      <a className="game-title" href="/" onClick={(event) => { event.preventDefault(); setConfirmLeave(true); }} aria-label="TRIX home">TRIX</a>
      <span className="game-subtitle">ULTIMATE TIC TAC TOE</span>
      {room.status === "waiting" && <button className="masthead-leave icon-text" onClick={() => setConfirmLeave(true)}><LogOut size={16} /> Leave</button>}
    </header>
    {!online && <div className="connection-banner" role="status"><WifiOff size={16} /> You're offline. Reconnect to continue playing.</div>}
    {error && <div className="form-error game-error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}

    {room.status === "waiting" ? <section className="waiting-layout">
      <div className="waiting-icon"><Users size={28} /></div>
      <div className="section-kicker">YOUR TABLE IS READY</div>
      <h1>Waiting for a friend</h1>
      <p>Good games are better together. Send an invite and your match will begin as soon as they join. Your marks are drawn fairly at the start.</p>
      <div className="invite-card">
        <div className="panel-label">YOUR ROOM CODE</div><div className="modal-code">{code}</div>
        <button className="button primary" onClick={share}>{copied ? <Check size={17} /> : <Share2 size={17} />}{copied ? "Invite copied" : "Share invite"}</button>
        <button className="text-button" onClick={copyCode}><Copy size={14} /> Copy room code</button>
      </div>
      <div className="waiting-players"><span><span className="player-token waiting-token">?</span>{room.players.X.name}<small>Mark draws at kickoff</small></span><span><span className="player-token waiting-token">?</span>Your friend<small>Mark draws at kickoff</small></span></div>
      <details className="match-help"><summary>A quick guide while you wait</summary><p>Win three squares in a mini-board to claim it. Your chosen square sends your friend to the matching mini-board. Claim three mini-boards in a row to win. If the next board is complete, choose any open board.</p></details>
    </section> : <section className="match-area match-grid" aria-label="Current match">
      <div className="players-rail">
        <aside className="match-side players-panel" aria-label="Players">
          <h2>PLAYERS</h2>
          <div className="side-players">{([side, side === "X" ? "O" : "X"] as const).map((mark) => <PlayerCard key={mark} mark={mark} name={room.players[mark]?.name || "Waiting…"} isYou={side === mark} isTurn={room.status === "playing" && room.game.currentPlayer === mark} />)}</div>
          <div className="side-detail turn-detail"><span>TURN</span><strong className={room.status === "finished" ? "" : room.game.currentPlayer.toLowerCase()}>{room.status === "finished" ? "Round complete" : myTurn ? "Your turn" : "Your friend’s turn"}</strong></div>
          {opponentAway && room.status === "playing" && <p className="opponent-status">Your friend is reconnecting. Their place is saved.</p>}
        </aside>
        <div className="match-status" aria-live="polite"><span className="section-kicker">ROUND {String(room.round).padStart(2, "0")}</span><h1>{room.status === "finished" ? "Round complete." : myTurn ? "Your move." : "Your friend’s move."}</h1><p>{room.status === "finished" ? "The final board. Ready for a rematch?" : opponentAway ? "Your friend is reconnecting. Their place is saved." : myTurn ? instruction + " and make it count." : "Think ahead. Your next move is coming."}</p></div>
      </div>
      <div className="arena-column">
        <div className="board-stage"><Board game={room.game} canPlay={!!myTurn && !busy && online} onPlay={move} /><div className="board-caption"><span className="caption-pip" />{room.status === "finished" ? "The final board. Nicely played." : busy ? "Sending your move…" : instruction}</div></div>
        <details className="match-help"><summary>How to play</summary><p>Win three squares in a mini-board to claim it. The square you choose sends your friend to the matching mini-board. Claim three mini-boards in a row to win the match. If you’re sent to a completed board, choose any open board.</p></details>
      </div>
      <aside className="match-side match-panel" aria-label="Match details">
        <h2>MATCH</h2>
        <div className="side-detail"><span>ROOM CODE</span><strong className="side-room-code">{code}</strong></div>
        <div className="side-detail"><span>ROUND</span><strong>{String(room.round).padStart(2, "0")}</strong></div>
        <div className="side-detail"><span>CURRENT TURN</span><strong className={room.status === "finished" ? "" : room.game.currentPlayer.toLowerCase()}>{room.status === "finished" ? "—" : room.game.currentPlayer}</strong></div>
        <div className="side-detail"><span>ACTIVE BOARD</span><strong>{room.status === "finished" ? "—" : room.game.activeBoard === null ? "Any" : String(room.game.activeBoard + 1)}</strong></div>
        <button className="match-invite" onClick={share}>{copied ? <Check size={16} /> : <Share2 size={16} />}{copied ? "Invite copied" : "Invite a friend"}</button>
        <button className="match-leave" onClick={() => setConfirmLeave(true)}><LogOut size={16} /> Leave Match</button>
      </aside>
    </section>}
    {room.status === "finished" && <ResultPopup round={room.round} winner={room.game.winner} winnerName={winnerName} hasVoted={hasVoted} busy={busy} canRematch={!!room.players.O} onRematch={() => void act(() => voteRematch(code))} />}
    {confirmLeave && <LeaveDialog host={room.hostUid === auth.currentUser?.uid} busy={busy} error={error} onCancel={() => setConfirmLeave(false)} onConfirm={exit} />}
  </main>;
}

function ResultPopup({ round, winner, winnerName, hasVoted, busy, canRematch, onRematch }: { round: number; winner: "X" | "O" | "Draw" | null; winnerName: string; hasVoted: boolean; busy: boolean; canRematch: boolean; onRematch: () => void }) {
  const draw = winner === "Draw";
  const resultText = draw ? "A well-played draw." : `${winnerName} wins!`;
  return <div className="result-popup-layer" role="presentation">
    <section className={`result-popup ${draw ? "draw" : winner?.toLowerCase() || ""}`} role="dialog" aria-modal="false" aria-labelledby="result-title" aria-describedby="result-copy">
      <div className="result-symbol" aria-hidden="true">{draw ? "=" : winner}</div>
      <div className="section-kicker">ROUND {round} COMPLETE</div>
      <h2 id="result-title">{resultText}</h2>
      <p id="result-copy">{hasVoted ? "Rematch requested. Waiting for your friend." : "Good game. Ready for another round?"}</p>
      <button className="button primary result-rematch" autoFocus disabled={busy || hasVoted || !canRematch} onClick={onRematch}><RotateCcw size={16} />{hasVoted ? "Request sent" : "Play again"}</button>
    </section>
  </div>;
}

function PlayerCard({ mark, name, isYou, isTurn }: { mark: Player; name: string; isYou: boolean; isTurn: boolean }) {
  return <div className={`player-card ${mark === "O" ? "o-player" : ""} ${isTurn ? "is-turn" : ""}`}><span className={`player-token ${mark.toLowerCase()}`}>{mark}</span><div><strong>{name}</strong><small>{isYou ? "You" : "Your friend"}{isTurn ? " · Playing" : ""}</small></div>{isTurn && <span className="turn-dot" />}</div>;
}

function LeaveDialog({ host, busy, error, onCancel, onConfirm }: { host: boolean; busy: boolean; error: string; onCancel: () => void; onConfirm: () => void }) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLDialogElement>("#leave-dialog");
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog id="leave-dialog" className="leave-dialog card modal" aria-labelledby="leave-title" onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}>
    <LogOut size={25} /><h2 id="leave-title">Leave this match?</h2>
    <p>{host ? "You’re the host, so leaving will close the room for both players." : "Your place will open up for another player. You can join a new match anytime."}</p>
    {error && <div className="form-error" role="alert">{error}</div>}
    <div className="modal-actions"><button className="button secondary" autoFocus disabled={busy} onClick={onCancel}>Keep playing</button><button className="button danger" disabled={busy} onClick={onConfirm}>{busy ? "Leaving…" : "Leave match"}</button></div>
  </dialog>;
}
