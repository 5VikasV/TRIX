import { useEffect } from "react";

import Header from "../components/Header";
import StatusBar from "../components/StatusBar";
import Board from "../components/Board";
import GameOverModal from "../components/GameOverModal";
import HostLeftModal from "../components/HostLeftModal";

import useMultiplayerGame from "../hooks/useMultiplayerGame";
import { leaveRoom } from "../firebase/multiplayer";

type GameProps = {
  roomId: string;
  onLeave: () => void;
};

export default function Game({
  roomId,
  onLeave,
}: GameProps) {
  const {
    room,
    game,
    play,
    restart,
    loading,
    opponentLeft,
    roomClosed,
    canPlay,
    isPlayerX,
  } = useMultiplayerGame(roomId);

  useEffect(() => {
    if (roomClosed) {
      // HostLeftModal handles this
    }
  }, [roomClosed]);

  if (loading || !game || !room) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        Loading...
      </main>
    );
  }

  const myName = isPlayerX
    ? room.players.X?.name
    : room.players.O?.name;

  const opponentName = isPlayerX
    ? room.players.O?.name
    : room.players.X?.name;

  async function handleLeave() {
    if (!confirm("Leave this match?")) return;

    await leaveRoom(roomId);

    onLeave();
  }

  return (
    <>
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-10">

          <Header />

          <div className="mb-6 flex w-full max-w-3xl items-center justify-between rounded-xl border border-cyan-500 px-6 py-3">
            <div>
              Room •
              <span className="ml-2 font-bold">
                {roomId}
              </span>
            </div>

            <button
              onClick={handleLeave}
              className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
            >
              Leave Match
            </button>
          </div>

          {opponentLeft && (
            <div className="mb-4 rounded-xl border border-yellow-500 bg-yellow-500/10 px-6 py-3 text-yellow-300">
              Opponent left the match. Waiting for another player...
            </div>
          )}

          <StatusBar
            currentPlayer={game.currentPlayer}
            activeBoard={game.activeBoard}
            isMyTurn={canPlay}
            myName={myName}
            opponentName={opponentName}
          />

          <Board
            game={game}
            onPlay={play}
          />

        </div>
      </main>

      <GameOverModal
        winner={game.winner}
        winnerName={
          game.winner === "X"
            ? room.players.X?.name
            : game.winner === "O"
            ? room.players.O?.name
            : undefined
        }
        onRestart={restart}
      />

      <HostLeftModal
        open={roomClosed}
        onClose={onLeave}
      />
    </>
  );
}