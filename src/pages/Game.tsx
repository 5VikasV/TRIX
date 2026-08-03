import { useEffect } from "react";

import Header from "../components/Header";
import Board from "../components/Board";
import PlayerPanel from "../components/PlayerPanel";
import MatchPanel from "../components/MatchPanel";
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
    isPlayerX,
  } = useMultiplayerGame(roomId);

  useEffect(() => {
    if (roomClosed) {
      // HostLeftModal handles this
    }
  }, [roomClosed]);

  if (loading || !game || !room) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
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
      <main className="relative min-h-screen bg-transparent text-white">

        {/* Dark overlay over the wallpaper */}
        <div className="pointer-events-none absolute inset-0 bg-black/30" />

        <div className="relative mx-auto max-w-[1800px] px-8 py-8">

          <Header />

          <div className="mt-8 grid grid-cols-[280px_1fr_280px] gap-8 items-start">

            <PlayerPanel
              myName={myName}
              opponentName={opponentName}
              isPlayerX={isPlayerX}
              currentPlayer={game.currentPlayer}
              opponentLeft={opponentLeft}
            />

            <div className="flex justify-center">
              <Board
                game={game}
                onPlay={play}
              />
            </div>

            <MatchPanel
              roomId={roomId}
              currentPlayer={game.currentPlayer}
              activeBoard={game.activeBoard}
              onLeave={handleLeave}
            />

          </div>

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